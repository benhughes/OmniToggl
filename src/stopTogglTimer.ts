(() => {
  // Main action
  const action = new PlugIn.Action(async function stopTogglTimerAction(
    this: ISharedThis,
  ) {
    const {
      resetTasks,
      log,
    } = this.common.commonHolder;

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

    const togglClient = new this.TogglClient.TogglClientClass(TOGGL_AUTH_TOKEN)

    try {
      const currentTimer = await togglClient.getCurrentTogglTimer();
      if (currentTimer) {
        await togglClient.stopTogglTimer(currentTimer.id);
      }
      resetTasks(TRACKING_TAG_NAME, TRACKING_NAME_PREFIX);
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
