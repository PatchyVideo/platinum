import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { createI18n } from 'vue-i18n'

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
    { path: '/', component: () => import('/@/home/home.vue') },
    { path: '/video/:vid', component: () => import('/@/video/video.vue') },
  ],
})
app.use(router)

/* Vue i18n */
import i18n_zh_CN from '/@/locales/zh-CN.json'
import i18n_en_US from '/@/locales/en-US.json'
const i18n = createI18n({
  locale: 'zh-CN',
  availableLocales: ['zh-CN', 'en-US'],
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': i18n_zh_CN,
    'en-US': i18n_en_US,
  },
})
app.use(i18n)

app.mount('#app')
