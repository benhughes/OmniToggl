(() => {
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

      try {
        const togglDetails = await togglClient.getTogglDetails();
        projects = togglDetails.projects || [];
      } catch (e) {
        await log(
          'An error occurred getting projects',
          'See console for more info',
        );
        console.log(e);
      }

      const task: Task = selection.tasks[0];
      const projectName = task.containingProject
        ? task.containingProject.name
        : '';

      const toggleProject = projects.find(
        (p) => p.name.trim().toLowerCase() === projectName.trim().toLowerCase(),
      );

      const taskName = task.name;
      let pid = null;
      if (!projectName) {
        pid = null;
      } else if (!toggleProject) {
        console.log(`project not found creating new ${projectName} project`);
        try {
          const r = await togglClient.createTogglProject(projectName);
          console.log(`project created id: ${r.id}`);
          pid = r.id;
        } catch (e) {
          console.log(`Error creating project ${projectName}`);
          console.log(JSON.stringify(e, null, 2));
        }
      } else {
        pid = toggleProject.id;
      }
      console.log('pid is: ', String(pid));

      const taskTags = task.tags.map((t) => t.name);

      try {
        const r = await togglClient.startTogglTimer({
          description: taskName,
          created_with: 'omnitoggl',
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

  action.validate = function startTogglTimerValidate(selection: Selection) {
    // selection options: tasks, projects, folders, tags
    return selection.tasks.length === 1;
  };

  return action;
})();
