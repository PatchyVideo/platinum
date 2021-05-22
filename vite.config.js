// @ts-check
import path from 'path'
import fs from 'fs'
import vue from '@vitejs/plugin-vue'
import windicss from 'vite-plugin-windicss'
import components from 'vite-plugin-components'
import viteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import { visualizer } from 'rollup-plugin-visualizer'
import yaml from '@rollup/plugin-yaml'
import { defineConfig } from 'vite'
import { version } from './package.json'

/**
 * Vite Configuration File
 * @type {import('vite').UserConfig}
 */
export default async ({ command, mode }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const data = fs.existsSync('./.cache/buildData.json')
    ? JSON.parse(fs.readFileSync('./.cache/buildData.json').toString())
    : await require('./scripts/usedata')()

  // @type string
  const banner = [
    '/*!',
    ` * PatchyVideo/Platinum V${version}(${data.gitLatest.hash.slice(0, 7)})`,
    ' * MIT License, Copyright (c) 2020-2021 PatchyVideo',
    ` * Generated: ${data.date}`,
    ' */',
  ].join()

  return defineConfig({
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './packages/') },
        { find: '@@', replacement: path.resolve(__dirname, './') },
      ],
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
      'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(data.gitLatest.hash),
      'import.meta.env.VITE_APP_BUILDTIME': JSON.stringify(data.date),
    },
    optimizeDeps: {
      include: ['@apollo/client/core'],
      exclude: ['@apollo/client'],
    },
    plugins: [
      yaml(),
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
}
