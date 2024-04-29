/* eslint-disable no-bitwise, no-plusplus */

(() => {
  // Replace the string below with your API Token found here: https://track.toggl.com/profile
  const TOGGL_AUTH_TOKEN = 'REPLACE_ME';
  // Name of the tag we use to assign what you're working on
  // (this makes it easier to reset the changes made to the name)
  const TRACKING_TAG_NAME = 'working-on';
  // this is the name prefix so it's easy to identify what you're working on.
  // Replace this if you would like something different
  const TRACKING_NAME_PREFIX = '🎯';

  // TODO: Migrate v8 to v9
  // DONE: Migrate v8 to v9
  const TOGGL_URL = 'https://api.track.toggl.com/api/v9';

  // the following is a pollyfill for base64 taken from https://github.com/MaxArt2501/base64-js/blob/master/base64.js
  function btoa(stringParam) {
    const b64 =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const string = String(stringParam);
    let result = '';
    const rest = string.length % 3; // To determine the final padding

    for (let i = 0; i < string.length; ) {
      const a = string.charCodeAt(i++);
      const b = string.charCodeAt(i++);
      const c = string.charCodeAt(i++);
      if (a > 255 || b > 255 || c > 255) {
        throw new Error(
          "Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.",
        );
      }

      // eslint-disable-next-line no-bitwise
      const bitmap = (a << 16) | (b << 8) | c;
      result +=
        b64.charAt((bitmap >> 18) & 63) +
        b64.charAt((bitmap >> 12) & 63) +
        b64.charAt((bitmap >> 6) & 63) +
        b64.charAt(bitmap & 63);
    }
    // If there's need of padding, replace the last 'A's with equal signs
    return rest ? result.slice(0, rest - 3) + '==='.substring(rest) : result;
  }

  const buildErrorObject = (r) => ({
    statusCode: r.statusCode,
    data: r.bodyString,
  });

  const AuthHeader = `Basic ${btoa(`${TOGGL_AUTH_TOKEN}:api_token`)}`;

  const dependencyLibrary = new PlugIn.Library(new Version('1.0'));

  dependencyLibrary.startTogglTimer = async function startTogglTimer(
    timeEntry,
  ) {
    const fetchRequest = new URL.FetchRequest();
    fetchRequest.bodyData = Data.fromString(
      JSON.stringify({
        //        time_entry: timeEntry,
        timeEntry,
      }),
    );
    fetchRequest.method = 'POST';
    fetchRequest.headers = {
      Authorization: AuthHeader,
      'Content-Type': 'application/json',
    };
    fetchRequest.url = URL.fromString(
      // TODO: Migrate v8 to v9
      // DONE: Migrate v8 to v9
      `${TOGGL_URL}/workspaces/${time_entry.workspace_id}/time_entries`,
    );
    const r = await fetchRequest.fetch();

    if (r.statusCode !== 200) {
      throw buildErrorObject(r);
    }

    // modified to cut '.data' from the return value
    return JSON.parse(r.bodyString);
  };

  dependencyLibrary.getCurrentTogglTimer =
    async function getCurrentTogglTimer() {
      const fetchRequest = new URL.FetchRequest();

      fetchRequest.method = 'GET';
      fetchRequest.headers = {
        Authorization: AuthHeader,
        'Content-Type': 'application/json',
      };
      fetchRequest.url = URL.fromString(
        // TODO: Migrate v8 to v9
        // DONE: Migrate v8 to v9
        `${TOGGL_URL}/me/time_entries/current`,
      );
      const r = await fetchRequest.fetch();

      if (r.statusCode !== 200) {
        throw buildErrorObject(r);
      }
      // modified to cut '.data' from the return value
      return JSON.parse(r.bodyString);
    };

  dependencyLibrary.stopTogglTimer = async function stopTogglTimer(id) {
    const fetchRequest = new URL.FetchRequest();

    fetchRequest.method = 'PUT';
    fetchRequest.headers = {
      Authorization: AuthHeader,
      'Content-Type': 'application/json',
    };
    fetchRequest.url = URL.fromString(
      // TODO: Migrate v8 to v9
      `${TOGGL_URL}/time_entries/${id}/stop`,
    );
    const r = await fetchRequest.fetch();

    if (r.statusCode !== 200) {
      throw buildErrorObject(r);
    }
    // modified to cut '.data' from the return value
    return JSON.parse(r.bodyString);
  };

  dependencyLibrary.createTogglProject = async function createTogglProject(
    workspaceId,
    name,
  ) {
    const fetchRequest = new URL.FetchRequest();
    fetchRequest.bodyData = Data.fromString(
      JSON.stringify({ active: true, project: { name } }),
    );
    fetchRequest.method = 'POST';
    fetchRequest.headers = {
      Authorization: AuthHeader,
      'Content-Type': 'application/json',
    };
    fetchRequest.url = URL.fromString(
      // TODO: Migrate v8 to v9
      // DONE: Migrate v8 to v9
      `${TOGGL_URL}/workspaces/${workspaceId}/projects`,
    );
    const r = await fetchRequest.fetch();

    if (r.statusCode !== 200) {
      throw buildErrorObject(r);
    }
    // modified to cut '.data' from the return value
    return JSON.parse(r.bodyString);
  };

  dependencyLibrary.getTogglProjects = async function getTogglProjects() {
    const fetchRequest = new URL.FetchRequest();
    fetchRequest.method = 'GET';
    fetchRequest.headers = {
      Authorization: AuthHeader,
      'Content-Type': 'application/json',
    };
    fetchRequest.url = URL.fromString(
      // TODO: Migrate v8 to v9
      // DONE: unnecessary
      `${TOGGL_URL}/me?with_related_data=true`,
    );
    const r = await fetchRequest.fetch();

    if (r.statusCode !== 200) {
      throw buildErrorObject(r);
    }
    // modified to cut '.data' from the return value
    // return JSON.parse(r.bodyString).projects;
    return JSON.parse(r.bodyString);
  };

  dependencyLibrary.log = async function log(message, title = 'Log') {
    const a = new Alert(title, message);
    a.addOption('OK');
    await a.show();
  };

  const config = {
    TOGGL_AUTH_TOKEN,
    TRACKING_TAG_NAME,
    TRACKING_NAME_PREFIX,
  };

  dependencyLibrary.resetTasks = () => {
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
  };

  dependencyLibrary.config = config;

  return dependencyLibrary;
})();
