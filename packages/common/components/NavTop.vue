<template>
  <div ref="navContainer">
    <!-- Top Nav -->
    <div
      ref="nav"
      class="z-49 fixed flex inset-x-0 h-12 p-1 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <!-- Logo & Slide Button -->
      <div v-show="!hidePage" class="flex-1 inline-flex items-center flex-nowrap mr-auto">
        <div
          class="p-0.5 rounded-full border-2 border-transparent transition-colors duration-100 hover:border-gray-200 dark:hover:border-gray-700"
        >
          <button
            class="text-3xl rounded-full"
            :class="drawerOpen ? 'i-uil:times' : 'i-uil:list-ul'"
            @click="drawerOpen = !drawerOpen"
          />
        </div>
        <RouterLink v-if="screenSizes.md" to="/">
          <Logo class="ml-2" />
        </RouterLink>
      </div>
      <!-- Search Bar -->
      <div v-if="showSearchBar" class="flex-auto inline-flex flex-nowrap items-center justify-center mx-2">
        <AutoComplete
          v-model:keyword="keyword"
          class="w-full max-w-2xl"
          :teleport-result="screenSizes['<sm'] ? teleportTo : undefined"
          :show-recommendations="true"
          @search="searchResult"
          @click="() => screenSizes['<sm'] && (hidePage = true)"
        />
        <div
          v-if="hidePage === true"
          class="i-uil:corner-up-left ml-2 text-2xl cursor-pointer select-none whitespace-nowrap transform rotate-90"
          @click="hidePage = false"
        />
      </div>
      <!-- User Box -->
      <div v-show="!hidePage" class="flex-1 inline-flex justify-end ml-auto mr-2 min-w-9">
        <div v-if="!auth.isLogin" class="whitespace-nowrap">
          <RouterLink to="/user/login">
            {{ t('common.nav-top.user.login') }}
          </RouterLink>
        </div>

        <div v-else class="flex items-center space-x-3">
          <NoteBoxNavTop
            v-if="screenSizes.sm && fetchNote"
            v-model:list-note-count-unread="listNoteCountUnread"
          />

          <UserBoxNavTop
            :fetch-note="fetchNote"
            :list-note-count-unread="listNoteCountUnread"
          />
        </div>
      </div>
    </div>

    <!-- Padding -->
    <div class="h-12" />

    <!-- Drawer -->
    <div
      class="z-50 fixed flex top-12 bottom-0 transform transition-transform ease-in-out"
      :class="{ '-translate-x-full': !drawerOpen }"
    >
      <!-- Menu -->
      <div class="flex flex-col gap-1 pt-2 px-2 rounded-r overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <!-- Nav Items -->
        <template v-for="(link, index) in links" :key="link.key">
          <div v-if="link.type === 'blank' && link.text === ''" class="w-full mt-2" />
          <NavTopLink v-else :index="index" :drawer-open="drawerOpen" :item-length="links.length">
            <div v-if="link.type === 'catogory'" class="text-gray-500 text-sm dark:text-gray-400" v-text="link.text" />
            <RouterLink v-else-if="link.type === 'router'" :to="link.path" class="flex flex-row items-center gap-x-1">
              <div v-if="link.icon" class="text-xl text-center" :class="link.icon" />
              <div v-text="link.text" />
            </RouterLink>
            <a v-else-if="link.type === 'a'" class="flex flex-row items-center gap-x-1" target="_blank" rel="noopener noreferrer" :href="link.href">
              <div v-if="link.icon" class="text-xl text-center" :class="link.icon" />
              <div v-text="link.text" />
            </a>
            <a v-else-if="link.type === 'click'" class="flex flex-row items-center gap-x-1" @click="link.onClick">
              <div v-if="link.icon" class="text-xl text-center" :class="link.icon" />
              <div v-text="link.text" />
            </a>
            <div v-else-if="link.type === 'select'" class="flex justify-between gap-x-6 items-center">
              <div class="inline-flex flex-row items-center gap-1">
                <div
                  v-if="link.icon"
                  class="text-xl text-center"
                  :class="link.icon"
                />
                <div v-text="link.text" />
              </div>
              <PvSelect
                v-model="link.selected.value"
                :item-list="link.options"
              />
            </div>
            <div v-else-if="link.type === 'component'" class="flex justify-between gap-x-6 items-center">
              <div class="inline-flex flex-row items-center gap-1">
                <div
                  v-if="link.icon"
                  class="inline-block mr-1 text-xl text-center align-middle"
                  :class="link.icon"
                />
                <div class="inline-block align-middle" v-text="link.text" />
              </div>
              <Component :is="link.component" />
            </div>
            <div v-else class="flex flex-row items-center gap-1">
              <div v-if="link.icon" class="text-xl text-center" :class="link.icon" />
              <div v-text="link.text" />
            </div>
          </NavTopLink>
        </template>
      </div>
    </div>

    <div v-show="hidePage" class="z-49 fixed flex top-12 bottom-0 w-full h-full bg-white dark:bg-gray-900">
      <div ref="teleportTo" class="absolute w-full" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, shallowRef } from 'vue'
import type { Component, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventListener } from '@vueuse/core'
import NavTopLink from './NavTopLink.vue'
import Logo from '@/common/components/Logo.vue'
import AutoComplete from '@/search/components/AutoComplete.vue'
import PvSelect from '@/ui/components/PvSelect.vue'
import DarkModeSwitch from '@/darkmode/components/DarkModeSwitch.vue'
import NoteBoxNavTop from '@/user-notification/components/NoteBoxNavTop.vue'
import UserBoxNavTop from '@/user/components/UserBoxNavTop.vue'
import { languageList, locale } from '@/locales'
import { screenSizes } from '@/css'
import { progressing } from '@/common/libs/progressing'
import { useAuth } from '@/user'

withDefaults(
  defineProps<{
    showSearchBar?: boolean
    fetchNote?: boolean
  }>(),
  {
    showSearchBar: true,
    fetchNote: true,
  },
)

const { t } = useI18n()
const route = useRoute()
const auth = useAuth()

const nav = shallowRef<HTMLDivElement | null>(null)
const navContainer = shallowRef<HTMLDivElement | null>(null)

/* Notifications */
const listNoteCountUnread = ref(0)

/* Drawer Operation */
const drawerOpen = ref(false)
useEventListener(
  document,
  'click',
  (e: MouseEvent) => {
    if (!navContainer.value)
      return
    const target = e.target as HTMLElement
    if (!navContainer.value.contains(target))
      drawerOpen.value = false
  },
  { passive: true },
)

/* Search */
const router = useRouter()
const hidePage = ref(false)
function searchResult(searchContent: string): void {
  hidePage.value = false
  router.push({ path: '/search-result', query: { i: searchContent } })
}

const keyword = ref(
  route.path === '/search-result'
    ? route.query.i
      ? Array.isArray(route.query.i)
        ? route.query.i.join(' ')
        : route.query.i
      : ''
    : '',
)

const teleportTo = shallowRef<HTMLElement>()

type NavLink = (
  | NavLinkRouter
  | NavLinkA
  | NavLinkClick
  | NavLinkBlank
  | NavLinkCatogory
  | NavLinkComponent
  | NavLinkSelect
) & {
  key: string
  text: string
  icon?: string
  if?: () => boolean
}
interface NavLinkRouter {
  type: 'router'
  path: string
  query?: Record<string, string | string[]>
}
interface NavLinkA {
  type: 'a'
  href: string
}
interface NavLinkClick {
  type: 'click'
  onClick: () => void
}
interface NavLinkBlank {
  type: 'blank'
}
interface NavLinkCatogory {
  type: 'catogory'
}
interface NavLinkComponent {
  type: 'component'
  component: Component
}
interface NavLinkSelect {
  type: 'select'
  options: {
    name: string
    value: string
  }[]
  selected: Ref<string>
}
const links = computed(() => {
  const links: NavLink[] = [
    {
      key: 'home',
      type: 'router',
      icon: 'i-uil:home-alt',
      text: t('common.nav-top.main-menu.home'),
      path: '/',
    },
    {
      key: 'video-list',
      type: 'router',
      icon: 'i-uil:play-circle',
      text: t('common.nav-top.main-menu.video'),
      path: '/video-list',
    },
    {
      key: 'playlist-list',
      type: 'router',
      icon: 'i-uil:folder',
      text: t('common.nav-top.main-menu.list'),
      path: '/playlist-list',
    },
    {
      key: 'discuss-board',
      type: 'click',
      icon: 'i-uil:chat',
      text: t('common.nav-top.main-menu.discuss-board'),
      onClick: () => progressing(t('common.nav-top.main-menu.discuss-board')),
    },
    {
      key: 'leaderboard',
      type: 'router',
      icon: 'i-uil:list-ol-alt',
      text: t('common.nav-top.main-menu.leaderboard'),
      path: '/leaderboard',
    },
    {
      key: 'wiki',
      type: 'a',
      icon: 'i-carbon:wikis',
      text: t('common.nav-top.main-menu.wiki'),
      href: 'https://patchyvideo.wiki/',
    },
  ]

  if (auth.isLogin) {
    links.push(
      {
        key: 'user-padding',
        type: 'blank',
        text: '',
      },
      {
        key: 'postvideo',
        type: 'click',
        icon: 'i-uil:upload',
        text: t('common.nav-top.user-operation.postvideo'),
        onClick: () => progressing(t('common.nav-top.user-operation.postvideo')),
      },
      {
        key: 'edittag',
        type: 'click',
        icon: 'i-uil:tag-alt',
        text: t('common.nav-top.user-operation.tag'),
        onClick: () => progressing(t('common.nav-top.user-operation.tag')),
      },
    )
  }

  if (auth.isLogin && auth.isAdmin) {
    links.push(
      {
        key: 'admin-padding',
        type: 'blank',
        text: '',
      },
      {
        key: 'admin',
        type: 'catogory',
        text: t('common.nav-top.admin.admin'),
      },
      {
        key: 'who-am-I',
        type: 'blank',
        text: t('common.nav-top.admin.who-am-I'),
      },
      {
        key: 'super-admin',
        type: 'blank',
        text: t('common.nav-top.admin.super-admin'),
      },
    )
  }

  links.push(
    {
      key: 'settings-padding',
      type: 'blank',
      text: '',
    },
    {
      key: 'settings',
      type: 'catogory',
      text: t('common.nav-top.settings.settings'),
    },
    {
      key: 'settings-darkmode',
      type: 'component',
      text: t('common.nav-top.settings.darkmode'),
      component: DarkModeSwitch,
    },
    {
      key: 'settings-language',
      type: 'select',
      text: t('common.nav-top.settings.lang'),
      options: languageList,
      selected: locale,
    },
    {
      key: 'settings-other',
      type: 'router',
      text: '更改其它设置',
      icon: 'i-uil:cog',
      path: '/settings',
    },
  )

  return links
})
</script>
