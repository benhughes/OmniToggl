(() => {
  // Main action
  const action = new PlugIn.Action(async function stopTogglTimerAction() {
    const { getCurrentTogglTimer, stopTogglTimer, resetTasks, log } =
      this.common;

    try {
      const currentTimer = await getCurrentTogglTimer();
      if (currentTimer) {
        const r = await stopTogglTimer(
          currentTimer.workspace_id,
          currentTimer.id,
        );
        console.log('Timer stopped successfully', JSON.stringify(r));
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
