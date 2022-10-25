/* eslint-disable vue/one-component-per-file */
import { Suspense, createApp, defineComponent, h, nextTick } from 'vue'
import { createRouter, createWebHistory, useRouter } from 'vue-router'
import { MotionPlugin } from '@vueuse/motion'
import { until } from '@vueuse/core'
import { createPinia } from 'pinia'
import BackendDown from './components/BackendDown.vue'
import ReloadPrompt from './components/ReloadPrompt.vue'
import AppRouterView from './components/AppRouterView.vue'
import BrowserOffline from './components/BrowserOffline.vue'
import { createBackendStatus, provideBackendStatus } from './libs/backendStatus'
import Notification from '@/notification/components/Notification.vue'
import PvMessage from '@/ui/components/PvMessage.vue'
import { createApollo, provideClient as provideGraphQLClient } from '@/graphql'
import { provideSharedObject } from '@/nested'
import i18n, { loadI18nPromise } from '@/locales'
import { incProcess, startProgress, stopProgress } from '@/nprogress'
import { useAuth } from '@/user'
import 'nprogress/nprogress.css'
import '@/css'
import '@/darkmode'
import './libs/extension'
import './libs/pvcc'

startProgress()

const client = createApollo()
const backendStatus = createBackendStatus()
const rootComponent = defineComponent({
  setup() {
    provideGraphQLClient(client)
    provideSharedObject()
    provideBackendStatus(backendStatus)

    return () => backendStatus.alive.value === 'no'
      ? window.navigator.onLine ? h(BackendDown) : h(BrowserOffline)
      : [
          h(Suspense, {}, h(AppRouterView)),
          h(Notification),
          h(PvMessage),
          h(ReloadPrompt),
        ]
  },
})

const app = createApp(rootComponent)

// pinia
const pinia = createPinia()
app.use(pinia)

// router
// @ts-expect-error idk
// eslint-disable-next-line import/first, import/order
import type { RouteLocationNormalizedLoaded } from 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    holdLoading?: boolean
    requireLogin?: boolean
    hashKey?: (route: RouteLocationNormalizedLoaded) => string | undefined
  }
}
const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: [
    // Home
    {
      name: 'home',
      path: '/',
      alias: ['/index', '/index.html'],
      component: () => import('@/home/Home.vue'),
    },

    // Search
    {
      name: 'search-page',
      path: '/search-page',
      component: () => import('@/search/SearchPage.vue'),
    },
    {
      name: 'search-result',
      path: '/search-result',
      component: () => import('@/search/SearchResult.vue'),
      meta: { holdLoading: true },
    },

    // Video
    {
      name: 'video-list',
      path: '/video-list',
      component: () => import('@/video/VideoList.vue'),
      meta: { holdLoading: true },
    },
    {
      name: 'video-detail',
      path: '/video/:vid',
      component: () => import('@/video/Video.vue'),
      meta: {
        holdLoading: true,
        hashKey(route) {
          return `video-${route.params.vid}`
        },
      },
    },
    {
      name: 'video-embed',
      path: '/embed/:vid',
      component: () => import('@/video/Embed.vue'),
    },
    {
      name: 'video-edit',
      path: '/edit-video/:vid',
      component: () => import('@/video/EditVideo.vue'),
      meta: { holdLoading: true },
    },

    // Playlist
    {
      name: 'playlist-list',
      path: '/playlist-list',
      component: () => import('@/playlist/PlaylistList.vue'),
      meta: { holdLoading: true },
    },
    {
      name: 'playlist-detail',
      path: '/playlist/:pid',
      component: () => import('@/playlist/Playlist.vue'),
      meta: { holdLoading: true },
    },

    // Tag
    {
      name: 'tag-author-detail',
      path: '/tag/author/:tid',
      component: () => import('@/tag/Author.vue'),
      meta: { holdLoading: true },
    },

    // LeaderBoard
    {
      name: 'leaderboard',
      path: '/leaderboard',
      component: () => import('@/leaderboard/Leaderboard.vue'),
      meta: { holdLoading: true },
    },

    // User
    {
      name: 'user-settings',
      path: '/user/me',
      component: () => import('@/user/User.vue'),
    },
    {
      name: 'user-notification',
      path: '/user/notification',
      component: () => import('@/user-notification/Notification.vue'),
      meta: { requireLogin: true },
    },
    {
      name: 'user-login',
      path: '/user/login',
      component: () => import('@/user/Login.vue'),
    },
    {
      name: 'user-signup',
      path: '/user/signup',
      component: () => import('@/user/Signup.vue'),
    },
    {
      name: 'user-forgot-password',
      path: '/user/forget-password',
      component: () => import('@/user/ForgetPassword.vue'),
    },
    {
      name: 'user-reset-password',
      path: '/user/reset-password',
      component: () => import('@/user/ResetPassword.vue'),
    },
    {
      name: 'user-redirect',
      path: '/user/redirect',
      component: () => import('@/user/Redirect.vue'),
    },
    {
      name: 'user-profile',
      path: '/user/:uid',
      component: () => import('@/user/Profile.vue'),
      meta: { holdLoading: true },
    },

    // Settings
    {
      name: 'settings-redirect',
      path: '/settings',
      redirect: '/settings/general',
    },
    {
      name: 'settings',
      path: '/settings/:catogory',
      component: () => import('@/settings/ChangeSettings.vue'),
    },

    // Debug
    {
      name: 'debug-user-force-logout',
      path: '/debug/user/force-logout',
      component: defineComponent({
        async setup() {
          const router = useRouter()
          try {
            await fetch('https://patchyvideo.com/be/logout.do', {
              method: 'POST',
              headers: new Headers({
                'Content-Type': 'application/json',
              }),
              body: JSON.stringify({}),
              credentials: 'include',
            })
          }
          finally {
            router.push('/')
          }

          return () => []
        },
      }),
    },
    {
      name: 'debug-error-pages-404',
      path: '/debug/error-pages/404',
      component: () => import('@/error-pages/components/404.vue'),
    },

    // Error
    {
      name: '404',
      path: '/:url+',
      component: () => import('@/error-pages/components/404.vue'),
    },
  ],
})
router.beforeEach(async (to, from, next) => {
  startProgress()

  backendStatus.refetch()

  if (to.meta.requireLogin) {
    const user = useAuth()
    await until(() => user.status).not.toBe('loading')
    if (!user.isLogin)
      next({ path: '/' })
  }

  next()
})
router.afterEach((to) => {
  incProcess()

  if (!to.meta.holdLoading) {
    // wait for dom update
    nextTick(() => {
      stopProgress()
    })
  }
})
app.use(router)

// i18n
app.use(i18n)

// motion
app.use(MotionPlugin)

loadI18nPromise.then(() => app.mount('#app'))
