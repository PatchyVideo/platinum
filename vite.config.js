// @ts-check
import path from 'path'
import fs from 'fs'
import vue from '@vitejs/plugin-vue'
import windicss from 'vite-plugin-windicss'
import components from 'vite-plugin-components'
import viteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import { version } from './package.json'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const data = fs.existsSync('./.cache/buildData.json')
  ? JSON.parse(fs.readFileSync('./.cache/buildData.json').toString())
  : undefined

// @type string
const banner =
  data &&
  `
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
export default defineConfig({
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
      transformCSS: 'pre',
      scan: {
        dirs: ['packages'],
        fileExtensions: ['html', 'vue', 'ts', 'tsx', 'js', 'jsx', 'css'],
      },
    }),
    components({
      dirs: [],
      customComponentResolvers: [
        ViteIconsResolver({
          componentPrefix: 'icon',
        }),
      ],
    }),
    viteIcons(),
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-var-requires
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
      ...visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
      apply: 'build',
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
