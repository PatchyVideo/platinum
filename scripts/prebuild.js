;(async () => {
  const fs = require('fs')
  const simpleGit = require('simple-git')

  require('./usecache')

  fs.writeFileSync(
    './.cache/buildData.json',
    JSON.stringify({
      gitLatest: (await simpleGit().log({ maxCount: 1 })).latest,
      date: new Date().toISOString(),
    })
  )
})()
