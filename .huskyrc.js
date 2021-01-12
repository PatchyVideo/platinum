// @ts-check

/**
 * Husky Configuration File
 */
module.exports = {
  // See https://git-scm.com/docs/githooks
  hooks: {
    'pre-commit': 'lint-staged',
  },
}
