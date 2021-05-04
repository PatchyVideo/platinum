import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createApollo, provideClient } from '@/graphql'

/* Tailwind CSS */
import '@/tailwindcss'

/* Dark Mode */
import '@/darkmode'

/* GraphQL */
const client = createApollo()

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

/* Vue Router */
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
    },
    {
      path: '/video/:vid',
      component: () => import('@/video/Video.vue'),
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
      path: '/debug/error-pages/404',
      component: () => import('@/error-pages/components/404.vue'),
    },
    {
      path: '/:url+',
      component: () => import('@/error-pages/components/404.vue'),
    },
  ],
})
app.use(router)

/* Vue I18n */
import i18n from '@/locales'
app.use(i18n)

app.mount('#app')

import './pvcc'
