// @ts-check
const path = require('path')
const fs = require('fs')
const vue = require('@vitejs/plugin-vue')
require('cross-fetch/polyfill')

// @ts-ignore
const data = fs.existsSync('./.cache/buildData.json') ? require('./.cache/buildData.json') : {}

// @type string
const banner = `
PatchyVideo/Platinum V<%= pkg.version %>(<%= data.gitLatest.hash.slice(0, 7) %>)
MIT License, Copyright (c) 2020-2021 PatchyVideo
Generated: <%= new Date().toISOString() %>
`.trim()

// @type string[]
const prebuildFiles = ['/packages/tailwindcss/css/tailwind.css']

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
    exclude: ['@apollo/client'],
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
    {
      name: 'graphql-hmr-helper-plugin',
      transform(code, id) {
        if (!/.vue/.test(id) || !/ graph\s*=/.test(code)) return
        return (
          code +
          '\nif (typeof graph !== "undefined" && "provideHot" in graph && typeof graph.provideHot === "function" && import.meta.hot) graph.provideHot(import.meta.hot);'
        )
      },
      apply: 'serve',
    },
    {
      name: 'plugin-prebuild',
      configureServer(server) {
        server.httpServer.once('listening', () => {
          const address = server.httpServer.address()
          if (typeof address !== 'string') {
            const serverBase =
              'http://' +
              (address.family === 'IPv6' ? '[' + address.address + ']' : address.address) +
              ':' +
              address.port
            prebuildFiles.forEach((file) => fetch(serverBase + file).catch(() => {}))
          }
        })
      },
      apply: 'serve',
    },
  ],
  build: {
    sourcemap: true,
  },
}
