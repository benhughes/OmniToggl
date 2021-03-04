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

class TogglClient implements ITogglClient {
  authToken: string = ''

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  buildErrorObject(r: URL.FetchResponse) {
    return {
      statusCode: r.statusCode,
      data: r.bodyString,
    }
  };

  async makeTogglRequest(
    url: string,
    options: requestOptions = {},
  ): Promise<any> {
    const AuthHeader = `Basic ${btoa(`${this.authToken}:api_token`)}`;
    const { headers = {}, method = 'GET', bodyData = null } = options;
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
      throw this.buildErrorObject(r);
    }

    return r.bodyString ? JSON.parse(r.bodyString).data : {};
  }

  async startTogglTimer(timeEntry: createTimeEntry) {
    const bodyData = Data.fromString(
      JSON.stringify({
        time_entry: timeEntry,
      }),
    );

    return await this.makeTogglRequest(
      `https://www.toggl.com/api/v8/time_entries/start`,
      { method: 'POST', bodyData },
    );
  }
  async stopTogglTimer(id: timeEntry['id']) {
    return await this.makeTogglRequest(
      `https://www.toggl.com/api/v8/time_entries/${id}/stop`,
      { method: 'PUT' },
    );
  }

  async getCurrentTogglTimer() {
    return await this.makeTogglRequest(
      'https://www.toggl.com/api/v8/time_entries/current',
    );
  }

  async createTogglProject(name: string, cid: number | null = null) {
    const bodyData = Data.fromString(
      JSON.stringify({ project: { name, cid } }),
    );

    return await this.makeTogglRequest(
      `https://api.track.toggl.com/api/v8/projects`,
      { method: 'POST', bodyData },
    );
  }

  async createTogglClient(name: string, wid: number) {
    const bodyData = Data.fromString(JSON.stringify({ client: { name, wid } }));

    return await this.makeTogglRequest(
      `https://api.track.toggl.com/api/v8/clients`,
      { method: 'POST', bodyData },
    );
  }

  async getTogglDetails() {
    return await this.makeTogglRequest(
      `https://api.track.toggl.com/api/v8/me?with_related_data=true`,
    );
  }
}

(() => {
  const TogglClientHolder = new PlugIn.Library(new Version('1.0'));

  // @ts-ignore
  TogglClientHolder.TogglClientClass = TogglClient;

  return TogglClientHolder;
})();
