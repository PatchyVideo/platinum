const simpleGit = require('simple-git')

module.exports = async function () {
  return {
    gitLatest: (await simpleGit().log({ maxCount: 1 })).latest,
    date: new Date().toISOString(),
  }
}
