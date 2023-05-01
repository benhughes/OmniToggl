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

      const source = selection.tasks[0] || selection.projects[0];
      let projectName = '';
      if(source instanceof Task) {
        if(source.containingProject) {
          projectName = source.containingProject.name;
        }
      } else {
        projectName = source.name
      }

      const toggleProject = (projects || []).find(
        (p) => p.name.trim().toLowerCase() === projectName.trim().toLowerCase(),
      );

      const taskName = source.name;
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
          console.log(JSON.stringify(e, null, 2));
        }
      } else {
        pid = toggleProject.id;
      }
      console.log('pid is: ', pid);

      const taskTags = source.tags.map((t) => t.name);

      try {
        const r = await startTogglTimer({
          description: taskName,
          created_with: 'omnifocus',
          tags: taskTags,
          pid,
        });
        source.name = TRACKING_NAME_PREFIX + source.name;
        source.addTag(trackingTag);
        console.log('Timer started successfully', JSON.stringify(r));
      } catch (e) {
        await log('An error occurred', 'See console for more info');
        console.log(e);
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
    const taskSelected = selection.tasks.length === 1;
    const projectSelected = selection.projects.length === 1;

    return taskSelected || projectSelected
  };

  return action;
})();
