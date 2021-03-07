interface editDialogPreferences {
  dialogText?: string;
  confirmTitle?: string;
}

interface PreferenceManagerConfigItemBase {
  id: string;
  displayName: string;
}

interface PreferenceManagerConfigItemString
  extends PreferenceManagerConfigItemBase {
  type: 'string';
  default: string;
}

interface PreferenceManagerConfigItemBoolean
  extends PreferenceManagerConfigItemBase {
  type: 'boolean';
  default: boolean;
}

type PreferenceManagerConfigItem =
  | PreferenceManagerConfigItemString
  | PreferenceManagerConfigItemBoolean;

interface PreferenceManagerConfig {
  editPreferences?: editDialogPreferences;
  items: Record<string, PreferenceManagerConfigItem>;
}

interface IPreferenceManager<T = PreferenceManagerConfig> {
  preferences: Preferences;
  config: T;

  editPreferences(): Promise<void>

  getPreference(id: string): Object
}