// Replace the string below with your API Token found here: https://track.toggl.com/profile
const TOGGL_AUTH_TOKEN = '866a274a2205d931b4ec2a9ab8140bc0';
// Name of the tag we use to assign what you're working on
// (this makes it easier to reset the changes made to the name)
const TRACKING_TAG_NAME = 'working-on';
// this is the name prefix so it's easy to identify what you're working on.
// Replace this if you would like something different
const TRACKING_NAME_PREFIX = '🎯';

const common: ICommon = {
  config: {
    TOGGL_AUTH_TOKEN,
    TRACKING_NAME_PREFIX,
    TRACKING_TAG_NAME,
  },
  log: async function log(message: string, title = 'Log') {
    const a = new Alert(title, message);
    a.addOption('OK');
    return await a.show(null);
  },

  resetTasks: function () {
    let trackingTag: Tag = flattenedTags.find(
      (t) => t.name === TRACKING_TAG_NAME,
    );

    if (!trackingTag) {
      trackingTag = new Tag(TRACKING_TAG_NAME, null);
    }

    trackingTag.tasks.forEach((task) => {
      if (task.name.startsWith(TRACKING_NAME_PREFIX)) {
        task.name = task.name.replace(TRACKING_NAME_PREFIX, '');
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
