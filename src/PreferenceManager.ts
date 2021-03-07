


class PreferenceManager implements IPreferenceManager{
  preferences: Preferences;
  config: PreferenceManagerConfig;
  constructor(name: string, config: PreferenceManagerConfig) {
    this.preferences = new Preferences(name);
    this.config = config;
  }
  async editPreferences() {
    var inputForm = new Form();

    for (const configItemId of Object.keys(this.config.items)) {
      const configItem = this.config.items[configItemId];

      switch (configItem.type) {
        case 'string': {
          const currentValue = this.getPreference(configItem.id);
          const taskNameField = new Form.Field.String(
            configItem.id,
            configItem.displayName,
            currentValue,
            null,
          );
          inputForm.addField(taskNameField, null);
          break;
        }
        case 'boolean': {
          const currentValue = this.preferences.readBoolean(configItem.id);
          const taskNameField = new Form.Field.Checkbox(
            configItem.id,
            configItem.displayName,
            currentValue,
          );
          inputForm.addField(taskNameField, null);
          break;
        }

        default:
          break;
      }
    }
    const result = await inputForm.show(
      this.config?.editPreferences?.dialogText || '',
      this.config?.editPreferences?.confirmTitle || 'Save',
    );
    const fromValues = result.values as Record<string, any>;
    for (const configItemId of Object.keys(this.config.items)) {
      const configItem = this.config.items[configItemId];
      const newValue = fromValues[configItem.id];
      this.preferences.write(configItem.id, newValue);
    }
  }

  getPreference(id: string) {
    const prefValue = this.preferences.read(id);

    return prefValue !== null ? prefValue : this.config.items[id].default;
  }
}

(() => {
  const config: PreferenceManagerConfig = {
    editPreferences: {
      dialogText:
        'Edit your preferences for OmniToggl, see: https://github.com/benhughes/OmniToggl for help',
    },
    items: {
      token: {
        id: 'token',
        displayName: 'Toggl Token',
        type: 'string',
        default: '',
      },
      trackingTag: {
        id: 'trackingTag',
        displayName: 'Tracking Tag',
        type: 'string',
        default: 'working-on',
      },
        namePrefix: {
        id: 'namePrefix',
        displayName: 'Prefix for currently working on task',
        type: 'string',
        default: '🎯 ',
      },
      useTopFolderForClient: {
        id: 'useTopFolderForClient',
        displayName: 'Use the top level folder to determine clients',
        type: 'boolean',
        default: false,
      },
    },
  };
  const preferenceManager = new PreferenceManager('omnitoggl', config);

  const preferenceManagerHolder = new PlugIn.Library(new Version('1.0'));

  // @ts-ignore
  preferenceManagerHolder.preferenceManager = preferenceManager;

  return preferenceManagerHolder;
})();
