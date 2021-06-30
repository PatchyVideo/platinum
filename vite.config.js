// @ts-check
import path from 'path'
import vue from '@vitejs/plugin-vue'
import windicss from 'vite-plugin-windicss'
import components from 'vite-plugin-components'
import viteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import { visualizer } from 'rollup-plugin-visualizer'
import yaml from '@rollup/plugin-yaml'
import { defineConfig } from 'vite'
import { version } from './package.json'
import template from 'lodash.template'
import simpleGit from 'simple-git'

/**
 * Vite Configuration File
 */
export default defineConfig(async ({ command, mode }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const data = {
    mode,
    isDev: mode !== 'production',
    isProd: mode === 'production',
    version,
    gitLatest: (await simpleGit().log({ maxCount: 1 })).latest,
    date: new Date(),
  }

  // @type string
  const banner = [
    '/*!',
    ` * PatchyVideo/Platinum V${version}(${data.gitLatest.hash.slice(0, 7)})`,
    ' * MIT License, Copyright (c) 2020-2021 VoileLabs',
    ` * Generated: ${data.date.toISOString()}`,
    ' */',
  ].join()

  return {
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './packages/') },
        { find: '@@', replacement: path.resolve(__dirname, './') },
      ],
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
      'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(data.gitLatest.hash),
      'import.meta.env.VITE_APP_BUILDTIME': JSON.stringify(data.date.toISOString()),
    },
    optimizeDeps: {
      include: ['@apollo/client/core', '@apollo/client/utilities'],
      exclude: ['@apollo/client'],
    },
    plugins: [
      yaml(),
      vue(),
      windicss(),
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
      {
        name: 'html-template',
        transformIndexHtml: {
          enforce: 'pre',
          transform(html) {
            return template(html)(data)
          },
        },
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
  }
})
