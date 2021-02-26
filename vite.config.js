// @ts-check
import path from 'path'
import fs from 'fs'
import vue from '@vitejs/plugin-vue'
import windicss from 'vite-plugin-windicss'
import { defineConfig } from 'vite'
import { version } from './package.json'

// @ts-ignore
const data = fs.existsSync('./.cache/buildData.json') ? require('./.cache/buildData.json') : {}

// @type string
const banner = `
/*!
 * PatchyVideo/Platinum V${version}(${data.gitLatest.hash.slice(0, 7)})
 * MIT License, Copyright (c) 2020-2021 PatchyVideo
 * Generated: ${data.date}
 */
`.trim()

/**
 * Vite Configuration File
 * @type {import('vite').UserConfig}
 */
module.exports = defineConfig({
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
    vue(),
    windicss({
      scan: {
        dirs: ['packages'],
        fileExtensions: ['html', 'vue', 'ts', 'tsx', 'js', 'jsx', 'css'],
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
    rollupOptions: {
      output: {
        banner,
      },
    },
  },
})
