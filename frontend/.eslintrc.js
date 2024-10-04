module.exports = {
  parserOptions: {
    ecmaVersion: 2020, // Allows for the latest ECMAScript features
    sourceType: 'module', // Allows using import/export
  },
  env: {
    browser: true,
    es6: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  rules: {
    // Add any custom rules if needed
  },
};
