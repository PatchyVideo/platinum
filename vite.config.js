// @ts-check
import fs, { promises as fsp } from 'fs'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import components from 'unplugin-vue-components/vite'
import icons from 'unplugin-icons/vite'
import iconsResolver from 'unplugin-icons/resolver'
import { visualizer } from 'rollup-plugin-visualizer'
import yaml from '@rollup/plugin-yaml'
import { defineConfig } from 'vite'
import { version } from './package.json'
import template from 'lodash.template'
import simpleGit from 'simple-git'

/**
 * Vite Configuration File
 *
 * Docs: https://vitejs.dev/config/
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
    ` * PatchyVideo/Platinum v${version}(${data.gitLatest.hash.slice(0, 7)})`,
    ' * MIT License, Copyright (c) 2020-2021 VoileLabs',
    ` * Generated: ${data.date.toISOString()}`,
    ' */',
  ].join('\n')

  /* create __generated__ dir */
  {
    const list = []
    const promises = []
    for (const dir of list) promises.push(fsp.mkdir(path.resolve(__dirname, 'packages', dir, `__generated__`)))
    promises.push(fsp.mkdir(path.resolve(__dirname, `__generated__`)))
    await Promise.allSettled(promises)
  }

  /* copy license */
  fs.copyFileSync(path.resolve(__dirname, './LICENSE'), path.resolve(__dirname, './public/LICENSE'))

  return {
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './packages/') },
        { find: '@@', replacement: path.resolve(__dirname, './') },
      ],
    },
    define: {
      __DEV__: JSON.stringify(mode !== 'production'),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
      'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(data.gitLatest.hash),
      'import.meta.env.VITE_APP_BUILDTIME': JSON.stringify(data.date.toISOString()),
      'import.meta.env.VITE_DATE_FNS_LOCALE': JSON.stringify(
        fs
          .readdirSync(path.resolve(__dirname, './node_modules/date-fns/esm/locale'), { withFileTypes: true })
          .filter((file) => file.isDirectory() && !file.name.startsWith('_'))
          .map((file) => file.name)
      ),
    },
    optimizeDeps: {
      include: ['@apollo/client/core', '@apollo/client/utilities'],
      exclude: ['@apollo/client'],
    },
    plugins: [
      yaml(),
      vue(),
      components({
        dirs: ['packages/layouts/components'],
        resolvers: [
          iconsResolver({
            prefix: 'icon',
          }),
        ],
        dts: '__generated__/viteComponents.d.ts',
      }),
      icons({
        compiler: 'vue3',
      }),
      pwa({
        strategies: 'injectManifest',
        srcDir: 'packages/main',
        filename: 'sw.ts',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        injectManifest: {
          globPatterns: ['LICENSE', 'index.html', 'assets/**.{js,css,jpg,png}'],
        },
        manifest: {
          name: 'PatchyVideo',
          short_name: 'PatchyVideo',
          description: 'The video-indexing platform that helps you find your favorites.',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
        },
      }),
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
