/**
 * Lint-staged Configuration File
 *
 * Docs: https://github.com/okonet/lint-staged#configuration
 */
module.exports = {
  '*.{js,ts,jsx,tsx,vue}': 'eslint --cache --fix',
}
