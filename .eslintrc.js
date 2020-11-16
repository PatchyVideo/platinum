/**
 * Eslint Configuration File
 *
 * Docs: https://eslint.org/docs/user-guide/configuring
 */
module.exports = {
  /**
   * Config Root
   */
  root: true,
  /**
   * Custom Rules
   */
  rules: {},
  /**
   * Custom Groups
   */
  overrides: [
    {
      files: ['./*.config.js', './*rc.js', './scripts/*.js'],
      env: {
        node: true,
      },
      extends: ['eslint:recommended', 'prettier'],
    },
    {
      files: ['*.js', '*.jsx'],
      env: {
        es2020: true,
        browser: true,
      },
      extends: ['eslint:recommended', 'prettier'],
    },
    {
      files: ['*.ts', '*.tsx'],
      env: {
        es2020: true,
        browser: true,
      },
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
      ],
    },
    {
      files: ['*.vue'],
      env: {
        es2020: true,
        browser: true,
      },
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/vue',
        'prettier/@typescript-eslint',
      ],
    },
  ],
}
