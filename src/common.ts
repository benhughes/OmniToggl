const common: ICommon = {
  log: async function log(message: string, title = 'Log') {
    const a = new Alert(title, message);
    a.addOption('OK');
    return await a.show(null);
  },

  resetTasks: function (trackingName: string, trackingNamePrefix: string) {
    let trackingTag: Tag = flattenedTags.find(
      (t) => t.name === trackingName,
    );

    if (!trackingTag) {
      trackingTag = new Tag(trackingName, null);
    }

    trackingTag.tasks.forEach((task) => {
      if (task.name.startsWith(trackingNamePrefix)) {
        task.name = task.name.replace(trackingNamePrefix, '');
      }
      task.removeTag(trackingTag);
    });
  },
};

(() => {
  const lib = new PlugIn.Library(new Version('1.0'));

  // @ts-ignore
  lib.commonHolder = common;

  return lib;
})();
