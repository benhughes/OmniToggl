(() => {
  // Main action
  const action = new PlugIn.Action(async function stopTogglTimerAction(
    this: ISharedThis,
  ) {
    const {
      config: { TOGGL_AUTH_TOKEN },
      resetTasks,
      log,
    } = this.common.commonHolder;

    const togglClient = new this.TogglClient.TogglClientClass(TOGGL_AUTH_TOKEN)

    try {
      const currentTimer = await togglClient.getCurrentTogglTimer();
      if (currentTimer) {
        await togglClient.stopTogglTimer(currentTimer.id);
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
