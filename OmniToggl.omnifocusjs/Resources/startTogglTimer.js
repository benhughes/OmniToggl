(() => {
  // recursive helper to get the top level folder to use as client name
  const getTopFolderName = (f) => (f.parent ? getTopFolderName(f.parent) : f.name);

  // Main action
  const action = new PlugIn.Action(async function startTogglTimerAction(
    selection,
  ) {
    // TODO: make client optional setting
    const {
      config: { TRACKING_TAG_NAME, TRACKING_NAME_PREFIX },
      startTogglTimer,
      createTogglProject,
      createTogglClient,
      getTogglDetails,
      resetTasks,
      log,
    } = this.common;

    const trackingTag = flattenedTags.find((t) => t.name === TRACKING_TAG_NAME);

    try {
      resetTasks();

      let projects = [];
      let clients = [];

      try {
        const togglDetails = await getTogglDetails();
        projects = togglDetails.projects;
        clients = togglDetails.clients;
        wid = togglDetails.workspaces[0].id;
      } catch (e) {
        await log(
          'An error occurred getting projects',
          'See console for more info',
        );
        console.log(e);
      }

      const task = selection.tasks[0];
      const project = task.containingProject;
      const projectName = project && project.name;
      const folderName = project && getTopFolderName(project.parentFolder);

      const toggleProject = (projects || []).find(
        (p) => p.name.trim().toLowerCase() === projectName.trim().toLowerCase(),
      );

      const toggleClient = (clients || []).find(
        (c) => c.name.trim().toLowerCase() === folderName.trim().toLowerCase(),
      );

      const taskName = task.name;

      let cid;
      if (!folderName) {
        cid = null;
      } else if (!toggleClient) {
        console.log(`client not found creating new ${folderName} client`);
        try {
          const r = await createTogglClient(folderName, wid);
          console.log(`client created id: ${r.id}`);
          cid = r.id;
        } catch (e) {
          console.log(`Error creating client ${folderName}`);
          console.log(JSON.stringify(e, null, 2));
        }
      } else {
        cid = toggleClient.id;
      }
      console.log('cid is: ', cid);

      let pid;
      if (!projectName) {
        pid = null;
      } else if (!toggleProject) {
        console.log(`project not found creating new ${projectName} project`);
        try {
          const r = await createTogglProject(projectName, cid);
          console.log(`project created id: ${r.id}`);
          pid = r.id;
        } catch (e) {
          console.log(`Error creating project ${projectName}`);
          console.log(JSON.stringify(e, null, 2));
        }
      } else {
        pid = toggleProject.id;
      }
      console.log('pid is: ', pid);

      const taskTags = task.tags.map((t) => t.name);

      try {
        const r = await startTogglTimer({
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
  });

  action.validate = function startTogglTimerValidate(selection) {
    // selection options: tasks, projects, folders, tags
    return selection.tasks.length === 1;
  };

  return action;
})();
