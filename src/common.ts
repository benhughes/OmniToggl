/* eslint-disable no-bitwise, no-plusplus */

declare var flattenedTags:TagArray;

(() => {
  // Replace the string below with your API Token found here: https://track.toggl.com/profile
  const TOGGL_AUTH_TOKEN = 'REPLACE_ME';
  // Name of the tag we use to assign what you're working on
  // (this makes it easier to reset the changes made to the name)
  const TRACKING_TAG_NAME = 'working-on';
  // this is the name prefix so it's easy to identify what you're working on.
  // Replace this if you would like something different
  const TRACKING_NAME_PREFIX = '🎯';

  // the following is a pollyfill for base64 taken from https://github.com/MaxArt2501/base64-js/blob/master/base64.js
  function btoa(stringParam: string) {
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

  async function makeTogglRequest(
    url: string,
    { headers = {}, method = 'GET', bodyData = null } = {},
  ) {
    const fetchRequest = new URL.FetchRequest();

    fetchRequest.method = method;
    fetchRequest.headers = {
      Authorization: AuthHeader,
      'Content-Type': 'application/json',
      ...headers,
    };
    if (bodyData) {
      fetchRequest.bodyData = bodyData;
    }
    fetchRequest.url = URL.fromString(url);
    const r = await fetchRequest.fetch();

    if (r.statusCode !== 200) {
      throw buildErrorObject(r);
    }
    return JSON.parse(r.bodyString).data;
  }

  const dependencyLibrary = new PlugIn.Library(new Version('1.0'));

  // @ts-ignore
  dependencyLibrary.startTogglTimer = async function startTogglTimer(
    timeEntry,
  ) {
    const bodyData = Data.fromString(
      JSON.stringify({
        time_entry: timeEntry,
      }),
    );

    return await makeTogglRequest(
      `https://www.toggl.com/api/v8/time_entries/start`,
      { method: 'POST', bodyData },
    );
  };
  // @ts-ignore
  dependencyLibrary.getCurrentTogglTimer = async function getCurrentTogglTimer() {
    return await makeTogglRequest(
      'https://www.toggl.com/api/v8/time_entries/current',
    );
  };
  // @ts-ignore
  dependencyLibrary.stopTogglTimer = async function stopTogglTimer(id) {
    return await makeTogglRequest(
      `https://www.toggl.com/api/v8/time_entries/${id}/stop`,
      { method: 'PUT' },
    );
  };
  // @ts-ignore
  dependencyLibrary.createTogglProject = async function createTogglProject(
    name,
    cid = null,
  ) {
    const bodyData = Data.fromString(
      JSON.stringify({ project: { name, cid } }),
    );

    return await makeTogglRequest(
      `https://api.track.toggl.com/api/v8/projects`,
      { method: 'POST', bodyData },
    );
  };
  // @ts-ignore
  dependencyLibrary.createTogglClient = async function createTogglClient(
    name,
    wid,
  ) {
    const bodyData = Data.fromString(JSON.stringify({ client: { name, wid } }));

    return await makeTogglRequest(
      `https://api.track.toggl.com/api/v8/clients`,
      { method: 'POST', bodyData },
    );
  };
  // @ts-ignore
  dependencyLibrary.getTogglDetails = async function getTogglProjects() {
    return await makeTogglRequest(
      `https://api.track.toggl.com/api/v8/me?with_related_data=true`,
    );
  };

  // @ts-ignore
  dependencyLibrary.log = async function log(message, title = 'Log') {
    const a = new Alert(title, message);
    a.addOption('OK');
    await a.show(null);
  };

  const config = {
    TOGGL_AUTH_TOKEN,
    TRACKING_TAG_NAME,
    TRACKING_NAME_PREFIX,
  };

  // @ts-ignore
  dependencyLibrary.resetTasks = () => {
    let trackingTag = flattenedTags.find((t) => t.name === TRACKING_TAG_NAME);

    if (!trackingTag) {
      trackingTag = new Tag(TRACKING_TAG_NAME, null);
    }

    trackingTag.tasks.forEach((task) => {
      if (task.name.startsWith(TRACKING_NAME_PREFIX)) {
        task.name = task.name.replace(TRACKING_NAME_PREFIX, '');
      }
      task.removeTag(trackingTag);
    });
  };
  // @ts-ignore
  dependencyLibrary.config = config;

  return dependencyLibrary;
})();
