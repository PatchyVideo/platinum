;(async () => {
  const fs = require('fs')

  fs.writeFileSync(
    './dist/index.html',
    fs
      .readFileSync('./dist/index.html')
      .toString()
      .replace(
        '%version%',
        require('../package.json').version +
          '(' +
          require('../.cache/buildData.json')['rollup-plugin-license'].data.gitLatest.hash.slice(0, 7) +
          ')'
      )
      .replace('%date%', new Date().toISOString())
  )

  fs.unlinkSync('./.cache/buildData.json')
})()
