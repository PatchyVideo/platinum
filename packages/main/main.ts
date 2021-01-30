import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { buildGraph, BuiltChild, createApollo, provideClient } from '@/graphql'

import '@/tailwindcss'

/* Dark Mode */
import '@/darkmode'

/* GraphQL */
const client = createApollo()
const onRouterImport = (value: unknown) => {
  if ((value as { graph?: BuiltChild }).graph) buildGraph((value as { graph: BuiltChild }).graph, client)
  return value
}

/* Vue App */
import Notification from '@/notification/components/Notification.vue'
const app = createApp(
  defineComponent({
    render: () => [h(RouterView), h(Notification)],
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
      component: () => import('@/home/Home.vue').then(onRouterImport),
    },
    {
      path: '/video/:vid',
      component: () => import('@/video/Video.vue').then(onRouterImport),
    },
    {
      path: '/debug/error-pages/404',
      component: () => import('@/error-pages/components/404.vue').then(onRouterImport),
    },
    {
      path: '/:url+',
      component: () => import('@/error-pages/components/404.vue').then(onRouterImport),
    },
  ],
})
app.use(router)

/* Vue I18n */
import i18n from '@/locales'
app.use(i18n)

app.mount('#app')

import './pvcc'
