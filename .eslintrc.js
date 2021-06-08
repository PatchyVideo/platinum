// @ts-check

/**
 * Eslint Configuration File
 *
 * Docs: https://eslint.org/docs/user-guide/configuring
 * @type {import('eslint').Linter.Config}
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
      files: ['./*.config.js', './*rc.js', '**/scripts/**/*.js', './public/**/*.js'],
      env: {
        node: true,
      },
      extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    },
    {
      files: ['*.js', '*.jsx'],
      env: {
        es2020: true,
        browser: true,
      },
      extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    },
    {
      files: ['*.ts', '*.tsx'],
      env: {
        es2020: true,
        browser: true,
      },
      parser: '@typescript-eslint/parser',
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
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
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
}
