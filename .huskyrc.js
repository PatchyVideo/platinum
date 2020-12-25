// @ts-check

/**
 * Husky Configuration File
 */
module.exports = {
  // See https://git-scm.com/docs/githooks
  hooks: {
    'pre-commit': 'lint-staged',
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
  },
}
