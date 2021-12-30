import { createApp, defineComponent, h, nextTick } from 'vue'

const appPromises: Promise<unknown>[] = []

/* CSS */
import '@/css'

/* Dark Mode */
import '@/darkmode'

/* GraphQL */
import { createApollo, provideClient as provideGraphQLClient } from '@/graphql'
const client = createApollo()

/* NProgress */
import NProgress from 'nprogress'
import 'nprogress/css/nprogress.css'
function incProcess() {
  if (NProgress.isStarted()) NProgress.inc()
}
NProgress.start()

/* Vue App */
import Notification from '@/notification/components/Notification.vue'
import PvMessage from '@/ui/components/PvMessage.vue'
import ReloadPrompt from './components/ReloadPrompt.vue'
import AppRouterView from './components/AppRouterView.vue'
import { provideSharedObject } from '@/nested'
const app = createApp(
  defineComponent({
    render: () => [h(AppRouterView), h(Notification), h(PvMessage), h(ReloadPrompt)],
    setup() {
      provideGraphQLClient(client)
      provideSharedObject()
    },
  })
)

/* Check if backend is alive */
import BackendDown from './components/BackendDown.vue'
import BrowserOffline from './components/BrowserOffline.vue'
async function loadBackendDown() {
  let errorPageApp
  if (window.navigator.onLine) {
    errorPageApp = createApp(
      defineComponent({
        render: () => h(BackendDown),
      })
    )
  } else {
    errorPageApp = createApp(
      defineComponent({
        render: () => h(BrowserOffline),
      })
    )
  }
  await appPromisesFinish
  await router.isReady()
  await nextTick()
  app.unmount()
  errorPageApp.mount('#app')
}
const checkIfBackendDown = () =>
  fetch('https://patchyvideo.com/be/alive.txt')
    .then((res) => {
      if (!res.ok) throw ''
    })
    .catch(() => {
      loadBackendDown()
    })
appPromises.push(checkIfBackendDown())

/* Login authentication & user data filling */
import { checkLoginStatus, isLogin, IsLogin } from '@/user'
const checkLoginStatusPromise = checkLoginStatus(true)
appPromises.push(checkLoginStatusPromise)

/* Vue Router */
import { createRouter, createWebHistory } from 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    holdLoading?: boolean
    requireLogin?: boolean
  }
}
const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: [
    // Home
    {
      path: '/',
      alias: ['/index', '/index.html'],
      component: () => import('@/home/Home.vue'),
    },

    // Search
    {
      path: '/search-page',
      component: () => import('@/search/SearchPage.vue'),
    },
    {
      path: '/search-result',
      component: () => import('@/search/SearchResult.vue'),
      meta: { holdLoading: true },
    },

    // Video
    {
      path: '/video-list',
      component: () => import('@/video/VideoList.vue'),
      meta: { holdLoading: true },
    },
    {
      path: '/video/:vid',
      component: () => import('@/video/Video.vue'),
      meta: { holdLoading: true },
    },
    {
      path: '/embed/:vid',
      component: () => import('@/video/Embed.vue'),
    },
    {
      path: '/edit-video/:vid',
      component: () => import('@/video/EditVideo.vue'),
      meta: { holdLoading: true },
    },
    {
      path: '/tag-editor/:vid',
      component: () => import('@/video/EditVideoTag.vue'),
      meta: { holdLoading: true },
    },

    // Playlist
    {
      path: '/playlist-list',
      component: () => import('@/playlist/PlaylistList.vue'),
      meta: { holdLoading: true },
    },
    {
      path: '/playlist/:pid',
      component: () => import('@/playlist/Playlist.vue'),
      meta: { holdLoading: true },
    },

    // Tag
    {
      path: '/tag/author/:tid',
      component: () => import('@/tag/Author.vue'),
      meta: { holdLoading: true },
    },

    // LeaderBoard
    {
      path: '/leaderboard',
      component: () => import('@/leaderboard/Leaderboard.vue'),
      meta: { holdLoading: true },
    },

    // User
    {
      path: '/user/me',
      component: () => import('@/user/User.vue'),
    },
    {
      path: '/user/notification',
      component: () => import('@/user-notification/Notification.vue'),
      meta: { requireLogin: true },
    },
    {
      path: '/user/login',
      component: () => import('@/user/Login.vue'),
    },
    {
      path: '/user/signup',
      component: () => import('@/user/Signup.vue'),
    },
    {
      path: '/user/forget-password',
      component: () => import('@/user/ForgetPassword.vue'),
    },
    {
      path: '/user/reset-password',
      component: () => import('@/user/ResetPassword.vue'),
    },
    {
      path: '/user/redirect',
      component: () => import('@/user/Redirect.vue'),
    },
    {
      path: '/user/:uid',
      component: () => import('@/user/Profile.vue'),
      meta: { holdLoading: true },
    },

    // Settings
    {
      path: '/settings',
      redirect: '/settings/general',
    },
    {
      path: '/settings/:catogory',
      component: () => import('@/settings/ChangeSettings.vue'),
    },

    // Error
    {
      path: '/debug/error-pages/404',
      component: () => import('@/error-pages/components/404.vue'),
    },
    {
      path: '/:url+',
      component: () => import('@/error-pages/components/404.vue'),
    },
  ],
})
let pendingNProgress: number | undefined
router.beforeEach(async (to, from, next) => {
  // start progress bar if page took a bit of time to load
  if (pendingNProgress === undefined)
    pendingNProgress = setTimeout(() => {
      if (!NProgress.isStarted()) NProgress.start()
      pendingNProgress = undefined
    }, 150)

  await checkLoginStatusPromise

  if (to.meta.requireLogin && isLogin.value !== IsLogin.yes) next({ path: '/' })

  next()
})
router.afterEach((guard) => {
  incProcess()
  checkIfBackendDown()
  appPromisesFinish.then(() => {
    if (pendingNProgress) {
      clearTimeout(pendingNProgress)
      pendingNProgress = undefined
    }
    if (!guard.meta.holdLoading) {
      if (NProgress.isStarted()) NProgress.done()
    }
  })
})
app.use(router)

/* Vue I18n */
import i18n, { loadI18nPromise } from '@/locales'
app.use(i18n)
appPromises.push(loadI18nPromise)

/* Vue Motion */
import { MotionPlugin } from '@vueuse/motion'
app.use(MotionPlugin)

const appPromisesFinish = Promise.allSettled(appPromises.map((v) => v.then(incProcess))).then(() => {
  app.mount('#app')
  incProcess()
})

/* Extension */
import './extension'

/* PatchyVideo Console Controls */
import './pvcc'
