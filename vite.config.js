// @ts-check
import path from 'path'
import fs from 'fs'
import vue from '@vitejs/plugin-vue'
import windicss from 'vite-plugin-windicss'

// @ts-ignore
const data = fs.existsSync('./.cache/buildData.json') ? require('./.cache/buildData.json') : {}

// @type string
const banner = `
PatchyVideo/Platinum V<%= pkg.version %>(<%= data.gitLatest.hash.slice(0, 7) %>)
MIT License, Copyright (c) 2020-2021 PatchyVideo
Generated: <%= new Date().toISOString() %>
`.trim()

/**
 * Vite Configuration File
 * @type {import('vite').UserConfig}
 */
module.exports = {
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './packages/') },
      { find: '@@', replacement: path.resolve(__dirname, './') },
    ],
  },
  optimizeDeps: {
    include: ['@apollo/client/core'],
    exclude: ['@apollo/client'],
  },
  plugins: [
    // @ts-ignore
    vue(),
    // @ts-ignore
    windicss({
      scan: {
        dirs: ['packages'],
      },
    }),
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
  ],
  build: {
    sourcemap: true,
  },
}
