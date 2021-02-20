(() => {
  // Main action
  const action = new PlugIn.Action(async function stopTogglTimerAction(this: {
    common: commonLibrary;
  }) {
    const {
      getCurrentTogglTimer,
      stopTogglTimer,
      resetTasks,
      log,
    } = this.common;

    try {
      const currentTimer = await getCurrentTogglTimer();
      if (currentTimer) {
        await stopTogglTimer(currentTimer.id);
      }
      resetTasks();
    } catch (e) {
      log('Please try again later', 'Error stopping current task');
      console.log(JSON.stringify(e, null, 2));
    }
  });

  action.validate = function startTogglTimerValidate() {
    // selection options: tasks, projects, folders, tags
    return true;
  };

  return action;
})();
