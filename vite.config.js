// @ts-check
import fs, { promises as fsp } from 'fs'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { VitePWA as pwa } from 'vite-plugin-pwa'
import components from 'unplugin-vue-components/vite'
import yaml from '@rollup/plugin-yaml'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import template from 'lodash.template'
import simpleGit from 'simple-git'
import { version } from './package.json'

/**
 * Vite Configuration File
 *
 * Docs: https://vitejs.dev/config/
 */
export default defineConfig(async ({ mode }) => {
  /**
   * @type Promise<unknown>[]
   */
  const promises = []

  const data = {
    mode,
    isDev: mode !== 'production',
    isProd: mode === 'production',
    version,
    gitLatest: (await simpleGit().log({ maxCount: 1 })).latest,
    date: new Date(),
  }

  /**
   * @type string
   */
  const banner = '/*! PatchyVideo/Platinum by VoileLabs */'

  /* create __generated__ dir */
  {
    /**
     * @type string[]
     */
    const list = []
    for (const dir of list) promises.push(fsp.mkdir(path.resolve(__dirname, 'packages', dir, '__generated__')))
    promises.push(fsp.mkdir(path.resolve(__dirname, '__generated__')))
  }

  /* copy license */
  promises.push(fsp.copyFile(path.resolve(__dirname, './LICENSE'), path.resolve(__dirname, './public/LICENSE')))

  await Promise.allSettled(promises)

  return defineConfig({
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './packages/') },
        { find: '@@', replacement: path.resolve(__dirname, './') },
      ],
    },
    define: {
      '__DEV__': JSON.stringify(mode !== 'production'),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
      'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(data.gitLatest.hash),
      'import.meta.env.VITE_APP_BUILDTIME': JSON.stringify(data.date.toISOString()),
      'import.meta.env.VITE_DATE_FNS_LOCALE': JSON.stringify(
        fs.readdirSync(path.resolve(__dirname, './node_modules/date-fns/esm/locale'), { withFileTypes: true })
          .filter(file => file.isDirectory() && !file.name.startsWith('_'))
          .map(file => file.name),
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
        dts: '__generated__/viteComponents.d.ts',
      }),
      unocss(),
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
          start_url: 'index.html',
          display: 'standalone',
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
        },
      }),
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
    esbuild: {
      // to reduce code size (~50KiB decrease, what??)
      charset: 'utf8',
    },
  })
})
