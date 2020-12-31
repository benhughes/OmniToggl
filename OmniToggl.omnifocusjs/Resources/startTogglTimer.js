/*{
  "type": "action",
  "targets": ["omnifocus"],
  "author": "Ben Hughes",
  "identifier": "com.github.benhughes.of-start-toggl-timer",
  "version": "1.0",
  "description": "This action will start a timer on the highlighted task using toggl.",
  "label": "Start Timer",
  "shortLabel": "Start Toggle Timer"
}*/

(() => {
  // Main action
  var action = new PlugIn.Action(async function (selection) {
    const {
      config: {TRACKING_TAG_NAME, TRACKING_NAME_PREFIX},
      startTogglTimer,
      createTogglProject,
      getTogglProjects,
      log,
    } = this.common;

    try {
      let trackingTag = flattenedTags.find((t) => t.name === TRACKING_TAG_NAME);

      if (!trackingTag) {
        trackingTag = new Tag(TRACKING_TAG_NAME);
      }

      trackingTag.tasks.forEach((task) => {
        if (task.name.startsWith(TRACKING_NAME_PREFIX)) {
          task.name = task.name.replace(TRACKING_NAME_PREFIX, '');
        }
        task.removeTag(trackingTag);
      });

      let projects = [];

      try {
        projects = await getTogglProjects();
      } catch (e) {
        await log(
          'An error occurred getting projects',
          'See console for more info'
        );
        console.log(e);
      }

      const task = selection.tasks[0];
      let projectName = task.containingProject && task.containingProject.name;

      const toggleProject = projects.find(
        (p) => p.name.trim().toLowerCase() === projectName.trim().toLowerCase()
      );

      let taskName = task.name;
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
      console.log(JSON.stringify(e, null, 2));
    }
  });

  action.validate = function (selection, sender) {
    // selection options: tasks, projects, folders, tags
    return selection.tasks.length === 1;
  };

  return action;
})();
