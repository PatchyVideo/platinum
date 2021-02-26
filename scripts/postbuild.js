;(async () => {
  const fs = require('fs')

  const data = require('../.cache/buildData.json')

  fs.writeFileSync(
    './dist/index.html',
    fs
      .readFileSync('./dist/index.html')
      .toString()
      .replace('%version%', require('../package.json').version + '(' + data.gitLatest.hash.slice(0, 7) + ')')
      .replace('%date%', data.date)
  )

  fs.unlinkSync('./.cache/buildData.json')
})()
