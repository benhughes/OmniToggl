(() => {
  // recursive helper to get the top level folder to use as client name
  const getTopFolderName = (f: Folder): string =>
    f.parent ? getTopFolderName(f.parent) : f.name;

  // Main action
  const action = new PlugIn.Action(async function startTogglTimerAction(
    this: ISharedThis,
    selection: Selection,
  ) {
    const { resetTasks, log } = this.common.commonHolder;

    // TODO: can I use generics to make this better?
    const TOGGL_AUTH_TOKEN = String(
      this.PreferenceManager.preferenceManager.getPreference('token'),
    );
    const TRACKING_TAG_NAME = String(
      this.PreferenceManager.preferenceManager.getPreference('trackingTag'),
    );
    const TRACKING_NAME_PREFIX = String(
      this.PreferenceManager.preferenceManager.getPreference('namePrefix'),
    );

    const togglClient = new this.TogglClient.TogglClientClass(TOGGL_AUTH_TOKEN);

    const trackingTag = flattenedTags.find((t) => t.name === TRACKING_TAG_NAME);

    try {
      resetTasks(TRACKING_TAG_NAME, TRACKING_NAME_PREFIX);

      let projects: togglProject[] = [];
      let clients: togglClient[] = [];
      let wid = null;

      try {
        const togglDetails = await togglClient.getTogglDetails();
        projects = togglDetails.projects || [];
        clients = togglDetails.clients || [];
        wid = togglDetails.workspaces[0].id;
      } catch (e) {
        await log(
          'An error occurred getting projects',
          'See console for more info',
        );
        console.log(e);
      }

      if (!wid) {
        throw new Error('Cannot find Workspace ID');
      }

      const task: Task = selection.tasks[0];
      const taskName = task.name;
      const taskTags = task.tags.map((t: Tag) => t.name);

      const project = task.containingProject;
      const projectName = (project && project.name) || '';
      const folderName =
        project &&
        project.parentFolder &&
        getTopFolderName(project.parentFolder);

      const cid = folderName
        ? await getClientId(folderName, clients, wid)
        : null;
      console.log('cid is: ', String(cid));

      const pid = await getProjectId(projectName, projects, cid);
      console.log('pid is: ', String(pid));

      try {
        const r = await togglClient.startTogglTimer({
          description: taskName,
          created_with: 'omnifocus',
          tags: taskTags,
          pid,
        });
        task.name = TRACKING_NAME_PREFIX + task.name;
        task.addTag(trackingTag);
        console.log('Timer started successfully', JSON.stringify(r));
      } catch (e) {
        await log('An error occurred', 'See console for more info');
        console.log(JSON.stringify(e, null, 2));
      }
    } catch (e) {
      await log('An error occurred', 'See console for more info');
      console.log(e);
      console.log(JSON.stringify(e, null, 2));
    }

    async function getClientId(
      clientName: string,
      togglClients: togglClient[],
      wid: number,
    ) {
      const togglClientItem = (togglClients || []).find(
        (c) => c.name.trim().toLowerCase() === clientName.trim().toLowerCase(),
      );
      let cid = null;
      if (!clientName) {
        cid = null;
      } else if (!togglClientItem) {
        console.log(`client not found creating new ${clientName} client`);
        try {
          const r = await togglClient.createTogglClient(clientName, wid);
          console.log(`client created id: ${r.id}`);
          cid = r.id;
        } catch (e) {
          console.log(`Error creating client ${clientName}`);
          console.log(JSON.stringify(e, null, 2));
        }
      } else {
        cid = togglClientItem.id;
      }
      return cid;
    }

    async function getProjectId(
      projectName: string,
      togglProjects: togglProject[],
      cid: number | null,
    ) {
      const togglProjectItem = (togglProjects || []).find(
        (p) => p.name.trim().toLowerCase() === projectName.trim().toLowerCase(),
      );

      let pid = null;
      if (!projectName) {
        pid = null;
      } else if (!togglProjectItem) {
        console.log(`project not found creating new ${projectName} project`);
        try {
          const r = await togglClient.createTogglProject(projectName, cid);
          console.log(`project created id: ${r.id}`);
          pid = r.id;
        } catch (e) {
          console.log(`Error creating project ${projectName}`);
          console.log(JSON.stringify(e, null, 2));
        }
      } else {
        pid = togglProjectItem.id;
      }
      return pid;
    }
  });

  action.validate = function startTogglTimerValidate(selection: Selection) {
    // selection options: tasks, projects, folders, tags
    return selection.tasks.length === 1;
  };

  return action;
})();
