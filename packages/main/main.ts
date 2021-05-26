import { createApp, defineComponent, h, nextTick } from 'vue'

/* Tailwind CSS */
import '@/tailwindcss'

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
import AppRouterView from './components/AppRouterView.vue'
const app = createApp(
  defineComponent({
    render: () => [h(AppRouterView), h(Notification)],
    setup() {
      provideClient(client)
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
      path: '/video/:vid',
      component: () => import('@/video/Video.vue'),
      meta: { holdLoading: true },
    },
    {
      path: '/embed/:vid',
      component: () => import('@/video/Embed.vue'),
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
      path: '/debug/error-pages/404',
      component: () => import('@/error-pages/components/404.vue'),
    },
    {
      path: '/:url+',
      component: () => import('@/error-pages/components/404.vue'),
    },
  ],
})
router.beforeEach(() => {
  if (!NProgress.isStarted()) NProgress.start()
})
router.afterEach((guard) => {
  incProcess()
  checkIfBackendDown()
  appPromisesFinish.then(() => {
    if (!guard.meta.holdLoading && NProgress.isStarted()) {
      NProgress.done()
    }
  })
})
app.use(router)

/* Vue I18n */
import i18n from '@/locales'
app.use(i18n)

/* Check if backend is alive */
import BackendDown from './components/BackendDown.vue'
async function loadBackendDown() {
  const errorPageApp = createApp(
    defineComponent({
      render: () => h(BackendDown),
    })
  )
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

/* PatchyVideo Console Controls */
import './pvcc'
