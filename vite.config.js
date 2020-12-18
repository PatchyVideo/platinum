const path = require('path')
const fs = require('fs')

const data = require('./.cache/buildData.json')

/**
 * Vite Configuration File
 */
module.exports = {
  alias: {
    '/@/': path.resolve(__dirname, './packages/'),
    '/@@/': path.resolve(__dirname, './'),
  },
  sourcemap: true,
  optimizeDeps: {
    include: ['@apollo/client/core'],
    exclude: ['@apollo/client'],
  },
  rollupInputOptions: {
    pluginsPostBuild: [
      require('rollup-plugin-license')({
        sourcemap: true,
        banner: {
          commentStyle: 'regular',
          content: {
            file: path.resolve(__dirname, './BANNER'),
          },
          data() {
            return {
              gitLatest: data['rollup-plugin-license'].data.gitLatest,
            }
          },
        },
        thirdParty: {
          output: {
            file: path.resolve(__dirname, './dist/NOTICE.txt'),
          },
        },
      }),
    ],
  },
  configureBuild() {
    return (result) => {
      result.assets = result.assets.concat([
        {
          fileName: '../NOTICE.txt',
          name: 'NOTICE.txt',
          source: fs.readFileSync('./dist/NOTICE.txt').toString(),
          type: 'asset',
        },
        {
          fileName: '../LICENSE',
          name: 'LICENSE',
          source: fs.readFileSync('./LICENSE').toString(),
          type: 'asset',
        },
      ])
    }
  },
}
