;(async () => {
  const fs = require('fs')
  const vite = require('vite')

  /**
   * Prebuild
   */

  require('./usecache')

  const data = await require('./usedata')()

  fs.writeFileSync('./.cache/buildData.json', JSON.stringify(data))

  /**
   * Build
   */

  await vite.build()

  /**
   * Postbuild
   */

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
