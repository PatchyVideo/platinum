import { fileURLToPath } from 'url'
import { Repository } from '@napi-rs/simple-git'
import { transformerDirectives } from 'unocss'
import { version } from './package.json'

const time = new Date()

const repo = new Repository(fileURLToPath(new URL('.', import.meta.url)))

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  experimental: {
    reactivityTransform: true,
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/apollo',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'nuxt-headlessui',
  ],

  typescript: {
    strict: true,
  },

  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
    ],
  },

  appConfig: {
    info: {
      version,
      commitHash: repo.head().target() || '?',
      buildTime: time.toISOString(),
    },
  },

  app: {
    head: {
      meta: [
        { name: 'color-scheme', content: '#000000' },
        { name: 'apple-mobile-web-app-title', content: 'PatchyVideo' },
        { name: 'application-name', content: 'PatchyVideo' },
        { name: 'msapplication-TileColor', content: '#9f00a7' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'referrer', content: 'never' },
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://patchyvideo.com' },
        { rel: 'preconnect', href: 'https://patchyvideo.com', crossorigin: '' },
      ],
      bodyAttrs: { class: 'dark:bg-black dark:text-white' },
    },
  },

  nitro: {
    preset: 'vercel-edge',
  },

  apollo: {
    clients: {
      default: {
        httpEndpoint: 'https://patchyvideo.com/be/gql/graphql',
        httpLinkOptions: {
          credentials: 'include',
        },
      },
    },
  },

  i18n: {
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      { code: 'CHS', name: '简体中文', iso: 'zh-Hans', file: 'zh-Hans.yml' },
      { code: 'ENG', name: 'English', iso: 'en-US', file: 'en-US.yml' },
      { code: 'CHT', name: '粵語中文', iso: 'yue-Hant', file: 'yue-Hant.yml' },
    ],
    defaultLocale: 'CHS',
    vueI18n: {
      legacy: false,
      fallbackLocale: 'CHS',
    },
  },

  unocss: {
    preflight: true,
    uno: {
      dark: 'class',
    },
    typography: true,
    icons: {
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    },
    transformers: [transformerDirectives()],
  },

  postcss: {
    plugins: {
      /**
       * @see https://github.com/postcss/postcss-nested#readme
       */
      'postcss-nested': {},
    },
  },

  headlessui: {
    prefix: 'H',
  },
})
