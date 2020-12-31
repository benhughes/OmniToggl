module.exports = {
  extends: ['airbnb', 'prettier'],
  rules: {
    'no-param-reassign': 'off',
    'no-console': 'off',
  },
  globals: {
    PlugIn: 'readonly',
    Version: 'readonly',
    Data: 'readonly',
    flattenedTags: 'readonly',
    Alert: 'readonly',
    Tag: 'readonly',
  },
};
