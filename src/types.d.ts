declare var console: Console;
declare var flattenedTags: TagArray;

type createTimeEntry = {
  description?: String;
  tags?: String[];
  pid?: number | null;
  created_with?: string;
};

interface timeEntry {
  id: number;
  pid: number | null;
  wid: number | null;
  billable: boolean;
  start: String;
  duration: number;
  description: string;
  tags: string[];
}
interface togglProject {
  id: number;
  wid: number;
  cid: number;
  name: string;
  billable: boolean;
  is_private: boolean;
  active: boolean;
  at: string;
  template_id: number;
  color: string;
}

interface togglClient {
  id: number;
  wid: number;
  name: string;
  at: string;
}

interface togglWorkspace {
  id: number;
  name: string;
  premium: boolean;
  at: string;
}

interface togglTag {
  id: number;
  wid: number;
  name: string;
  at: string;
}
interface togglMe {
  id: number;
  api_token: string;
  default_wid: number;
  email: string;
  fullname: string;
  jquery_timeofday_format: string;
  jquery_date_format: string;
  timeofday_format: string;
  date_format: string;
  store_start_and_stop_time: boolean;
  beginning_of_week: number;
  language: string;
  image_url: string;
  sidebar_piechart: boolean;
  at: string;
  retention: number;
  record_timeline: boolean;
  render_timeline: boolean;
  timeline_enabled: boolean;
  timeline_experiment: boolean;
  new_blog_post: {
    title: string;
    url: string;
  };
  time_entries: timeEntry[] | null;
  projects: togglProject[] | null;
  tags: togglTag[] | null;
  workspaces: togglWorkspace[];
  clients: togglClient[] | null;
}

interface requestOptions {
  headers?: Record<string, string>;
  method?: string;
  bodyData?: Data;
}
type ICommon = {
  log: (message: string, title?: string) => Promise<number>;
  resetTasks: (trackingName: string, trackingNamePrefix: string) => void;
};

interface ITogglClient {
  authToken: string;
  makeTogglRequest: (url: string, options: requestOptions) => Promise<any>;
  startTogglTimer: (timeEntry: createTimeEntry) => Promise<timeEntry>;
  getCurrentTogglTimer: () => Promise<timeEntry>;
  stopTogglTimer: (id: timeEntry['id']) => Promise<timeEntry>;
  createTogglProject: (
    name: string,
    cid?: number | null,
  ) => Promise<togglProject>;
  createTogglClient: (name: string, wid: number) => Promise<togglClient>;
  getTogglDetails: () => Promise<togglMe>;
}

interface ITogglClientConstructor {
  new (authToken: string): ITogglClient;
}

interface ISharedThis {
  common: { commonHolder: ICommon };
  TogglClient: { TogglClientClass: ITogglClientConstructor };
  PreferenceManager: { preferenceManager: IPreferenceManager };
}
