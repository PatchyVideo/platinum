// @ts-check

/**
 * ESLint Configuration File
 *
 * Docs: https://eslint.org/docs/user-guide/configuring
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: [
    '@antfu',
  ],
  rules: {
    'vue/component-tags-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
  },
}
