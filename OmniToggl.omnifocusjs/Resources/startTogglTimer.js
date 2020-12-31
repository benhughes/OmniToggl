(() => {
  // Main action
  const action = new PlugIn.Action(async function startTogglTimerAction(
    selection,
  ) {
    const {
      config: { TRACKING_TAG_NAME, TRACKING_NAME_PREFIX },
      startTogglTimer,
      createTogglProject,
      getTogglProjects,
      resetTasks,
      log,
    } = this.common;

    const trackingTag = flattenedTags.find((t) => t.name === TRACKING_TAG_NAME);

    try {
      resetTasks();

      let projects = [];

      try {
        projects = await getTogglProjects();
      } catch (e) {
        await log(
          'An error occurred getting projects',
          'See console for more info',
        );
        console.log(e);
      }

      const task = selection.tasks[0];
      const projectName = task.containingProject && task.containingProject.name;

      const toggleProject = projects.find(
        (p) => p.name.trim().toLowerCase() === projectName.trim().toLowerCase(),
      );

      const taskName = task.name;
      let pid;
      if (!projectName) {
        pid = null;
      } else if (!toggleProject) {
        console.log(`project not found creating new ${projectName} project`);
        try {
          const r = await createTogglProject(projectName);
          console.log(`project created id: ${r.id}`);
          pid = r.id;
        } catch (e) {
          console.log(`Error creating project ${projectName}`);
          console.log(e);
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
