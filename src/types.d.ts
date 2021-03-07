declare var console: Console;
declare var flattenedTags: TagArray;

type ICommon = {
  log: (message: string, title?: string) => Promise<number>;
  resetTasks: (trackingName: string, trackingNamePrefix: string) => void;
};

interface ISharedThis {
  common: { commonHolder: ICommon };
  TogglClient: { TogglClientClass: ITogglClientConstructor };
  PreferenceManager: { preferenceManager: IPreferenceManager };
}
