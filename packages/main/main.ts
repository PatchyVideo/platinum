import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { BuiltFragment, createApollo, createGraphQLRoot, provideClient } from '/@/graphql'

import '/@/tailwindcss'

/* Dark Mode */
import '/@/darkmode'

/* GraphQL */
const client = createApollo()
const onRouterImport = (value: unknown) => {
  if ((value as { gqlFrag: BuiltFragment }).gqlFrag)
    createGraphQLRoot(client)((value as { gqlFrag: BuiltFragment }).gqlFrag)
  return value
}

/* Vue App */
const app = createApp(
  defineComponent({
    render: () => h(RouterView),
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
    // Routers
    { path: '/', component: () => import('/@/home/Home.vue').then(onRouterImport) },
    { path: '/video/:vid', component: () => import('/@/video/Video.vue') },
    { path: '/debug/error-pages/404', component: () => import('/@/error-pages/components/404.vue') },
    { path: '/:url+', component: () => import('/@/error-pages/components/404.vue') },
  ],
})
app.use(router)

import i18n from '/@/locales'
app.use(i18n)

app.mount('#app')
