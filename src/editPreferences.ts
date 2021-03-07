(() => {
  // Main action
  const action = new PlugIn.Action(async function editPreferences(
    this: ISharedThis,
  ) {
    await this.PreferenceManager.preferenceManager.editPreferences();
  });

  action.validate = function startTogglTimerValidate() {
    // selection options: tasks, projects, folders, tags
    return true;
  };

  return action;
})();
