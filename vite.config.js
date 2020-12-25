// @ts-check
const path = require('path')
const fs = require('fs')

// @ts-ignore
const data = fs.existsSync('./.cache/buildData.json') ? require('./.cache/buildData.json') : {}

/**
 * Vite Configuration File
 * @type {import('vite').UserConfig}
 */
module.exports = {
  alias: {
    '/@/': path.resolve(__dirname, './packages/'),
    '/@@/': path.resolve(__dirname, './'),
  },
  sourcemap: true,
  optimizeDeps: {
    include: ['@apollo/client/core'],
    exclude: ['@apollo/client', '@primer/css'],
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
      // @ts-ignore
      require('rollup-plugin-copy')({
        targets: [{ src: 'LICENSE', dest: 'dist' }],
        hook: 'writeBundle',
      }),
    ],
  },
}
