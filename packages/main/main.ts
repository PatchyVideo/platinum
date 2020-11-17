import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'

import '/@/tailwindcss'

/* Dark Mode */
import { dark } from '/@/darkmode'
if ('themePreference' in localStorage && localStorage.themePreference === 'dark') {
  dark()
} else if (!('themePreference' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  dark()
}
document.querySelector('body')?.classList.add('dark:bg-gray-700')

/* Vue App */
import { createApollo } from '/@/graphql'
const app = createApp(
  defineComponent({
    render: () => h(RouterView),
    setup() {
      createApollo()
    },
  })
)

/* Vue Router */
const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: [
    // Routers
    { path: '/', component: () => import('/@/home/Home.vue') },
    { path: '/video/:vid', component: () => import('/@/video/Video.vue') },
  ],
})
app.use(router)

import i18n from '/@/locales'
app.use(i18n)

app.mount('#app')
