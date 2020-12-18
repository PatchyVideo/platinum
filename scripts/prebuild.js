;(async () => {
  const fs = require('fs')
  const simpleGit = require('simple-git')

  require('./usecache')

  const git = simpleGit()
  const gitLatest = (await git.log({ maxCount: 1 })).latest

  fs.writeFileSync(
    './.cache/buildData.json',
    JSON.stringify({
      'rollup-plugin-license': {
        data: {
          gitLatest,
        },
      },
    })
  )
})()
