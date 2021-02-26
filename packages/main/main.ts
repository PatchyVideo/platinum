import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { buildGraph, BuiltGraph, createApollo, provideClient } from '@/graphql'

/* Tailwind CSS */
import '@/tailwindcss'

/* Font Awesome */
import '@fortawesome/fontawesome-free/css/all.css'

/* Dark Mode */
import '@/darkmode'

/* GraphQL */
const client = createApollo()
const onRouterImport = (value: unknown) => {
  if ('graph' in (value as { graph?: BuiltGraph })) buildGraph((value as { graph: BuiltGraph }).graph, client)
  return value
}

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
      component: () => import('@/home/Home.vue').then(onRouterImport),
    },
    {
      path: '/search-page',
      component: () => import('@/search/SearchPage.vue').then(onRouterImport),
    },
    {
      path: '/search-result',
      component: () => import('@/search/SearchResult.vue').then(onRouterImport),
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
