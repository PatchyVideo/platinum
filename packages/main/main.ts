import { createApp, defineComponent, h, nextTick } from 'vue'

/* CSS */
import '@/css'

/* Dark Mode */
import '@/darkmode'

/* GraphQL */
import { createApollo, provideClient } from '@/graphql'
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
      provideClient(client)
      provideSharedObject()
    },
  })
)
const appPromises: Promise<unknown>[] = []

/* Vue Router */
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: [
    {
      path: '/',
      alias: ['/index', '/index.html'],
      component: () => import('@/home/Home.vue'),
    },
    {
      path: '/search-page',
      component: () => import('@/search/SearchPage.vue'),
    },
    {
      path: '/search-result',
      component: () => import('@/search/SearchResult.vue'),
      meta: { holdLoading: true },
    },
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
    {
      path: '/tag/author/:tid',
      component: () => import('@/tag/Author.vue'),
      meta: { holdLoading: true },
    },
    {
      path: '/leaderboard',
      component: () => import('@/leaderboard/Leaderboard.vue'),
      meta: { holdLoading: true },
    },
    {
      path: '/user/me',
      component: () => import('@/user/User.vue'),
    },
    {
      path: '/user/notification',
      component: () => import('@/user-notification/Notification.vue'),
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
    {
      path: '/settings',
      redirect: '/settings/general',
    },
    {
      path: '/settings/:catogory',
      component: () => import('@/settings/ChangeSettings.vue'),
    },
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
router.beforeEach(() => {
  if (pendingNProgress === undefined)
    pendingNProgress = setTimeout(() => {
      if (!NProgress.isStarted()) NProgress.start()
    }, 100)
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
import i18n from '@/locales'
app.use(i18n)

/* Vue Motion */
import { MotionPlugin } from '@vueuse/motion'
app.use(MotionPlugin)

/* Vite PWA */
import { registerSW } from 'virtual:pwa-register'
registerSW({})

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
import { checkLoginStatus } from '@/user'
appPromises.push(checkLoginStatus(true))

const appPromisesFinish = Promise.allSettled(appPromises.map((v) => v.then(incProcess))).then(() => {
  app.mount('#app')
  incProcess()
})

/* Extension */
import './extension'

/* PatchyVideo Console Controls */
import './pvcc'
