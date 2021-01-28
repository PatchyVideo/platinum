// @ts-check
const path = require('path')
const fs = require('fs')
const vue = require('@vitejs/plugin-vue')

// @ts-ignore
const data = fs.existsSync('./.cache/buildData.json') ? require('./.cache/buildData.json') : {}

const banner = `
Bundle of Platinum V<%= pkg.version %>(<%= data.gitLatest.hash.slice(0, 7) %>)
MIT License, Copyright (c) 2020-2021 PatchyVideo
Generated: <%= new Date().toISOString() %>
`.trim()

/**
 * Vite Configuration File
 * @type {import('vite').UserConfig}
 */
module.exports = {
  alias: [
    { find: '@', replacement: path.resolve(__dirname, './packages/') },
    { find: '@@', replacement: path.resolve(__dirname, './') },
  ],
  optimizeDeps: {
    include: ['@apollo/client/core'],
    exclude: ['@apollo/client', '@primer/css'],
  },
  plugins: [
    // @ts-ignore
    vue(),
    {
      ...require('rollup-plugin-license')({
        sourcemap: true,
        banner: {
          commentStyle: 'ignored',
          content: banner,
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
      enforce: 'post',
      apply: 'build',
    },
    {
      // @ts-ignore
      ...require('rollup-plugin-copy')({
        targets: [{ src: 'LICENSE', dest: 'dist' }],
        hook: 'generateBundle',
      }),
      enforce: 'post',
      apply: 'build',
    },
  ],
  build: {
    sourcemap: true,
  },
}
