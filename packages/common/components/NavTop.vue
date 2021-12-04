<template>
  <div>
    <!-- Top Nav -->
    <div
      class="h-auto p-1 flex items-center justify-between border-b border-gray-300 bg-gray-50 dark:bg-gray-900 dark:border-gray-800"
    >
      <!-- Logo & Slide Button -->
      <div v-show="!hidePage" class="flex items-center flex-nowrap ml-2">
        <div class="p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
          <div class="i-uil-list-ul text-3xl cursor-pointer rounded-full" @click="drawerOpen = true" />
        </div>
        <Logo v-if="screenSizes.md" class="inline-block ml-2 cursor-pointer" @click="toHome()"></Logo>
      </div>
      <!-- Search Bar -->
      <div v-if="showSearchBar" class="flex flex-auto flex-nowrap items-center justify-center mx-2">
        <AutoComplete
          ref="autoComplete"
          v-model:keyword="keyword"
          class="w-full max-w-2xl"
          :teleport-result="screenSizes['<sm'] ? teleportTo : undefined"
          :show-recommendations="true"
          @search="searchResult"
          @click="() => screenSizes['<sm'] && (hidePage = true)"
        ></AutoComplete>
        <div
          v-if="hidePage === true"
          class="i-uil-corner-up-left ml-2 text-2xl cursor-pointer select-none whitespace-nowrap transform rotate-90"
          @click="hidePage = false"
        ></div>
      </div>
      <!-- User Box -->
      <div v-show="!hidePage" class="flex-shrink-0 mr-2">
        <div v-if="isLogin === IsLogin.no" class="whitespace-nowrap">
          <RouterLink to="/user/login" v-text="t('common.nav-top.user.login')"></RouterLink>
        </div>
        <div v-else class="relative">
          <div class="flex items-center space-x-3">
            <div
              v-if="!screenSizes['<sm'] && props.fetchNote"
              ref="NoteBoxBtn"
              class="flex items-center justify-center w-9 h-9 text-xl cursor-pointer rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              :class="{ 'bg-gray-200 dark:bg-gray-700': NoteBoxOpen }"
              @click="NoteBoxOpen = true"
            >
              <div class="inline-block i-uil-envelope"></div>
              <label
                v-if="listNoteCountUnread"
                class="absolute top-1 right-12 bg-red-500 text-white text-xs rounded-full px-1"
                >{{ listNoteCountUnread > 99 ? '99+' : listNoteCountUnread }}</label
              >
            </div>
            <div ref="userListBtn">
              <UserAvatar
                :title="user.name"
                :image="user.avatar"
                :email="user.email"
                class="h-9 w-9 rounded-full border border-white cursor-pointer"
                @click="userListOpen = true"
              ></UserAvatar>
              <label
                v-if="listNoteCountUnread && !userListOpen && screenSizes['<sm'] && props.fetchNote"
                class="absolute -top-0.3 -right-0.5 bg-red-500 rounded-full p-1.5"
              ></label>
            </div>
          </div>
          <!-- Note Box -->
          <Transition name="NoteBox">
            <div v-show="NoteBoxOpen" ref="NoteBox">
              <NoteBoxNavTop v-model:list-note-count-unread="listNoteCountUnread" />
            </div>
          </Transition>
          <!-- User List -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0"
            leave-active-class="transition-all duration-200"
            leave-to-class="opacity-0"
          >
            <div
              v-show="userListOpen"
              ref="userList"
              class="z-900 absolute -top-6 -right-2 w-40 p-2 mt-1/2 rounded bg-white border border-gray-400 shadow overflow-visible dark:bg-gray-900 dark:border-black"
            >
              <UserAvatar
                :title="user.name"
                :image="user.avatar"
                :email="user.email"
                class="absolute -top-5 right-0 w-14 h-14 rounded-full border border-white cursor-pointer"
              ></UserAvatar>
              <div v-if="isLogin === IsLogin.yes" class="space-y-3">
                <div class="text-lg font-800 truncate w-25">{{ user.name }}</div>
                <RouterLink
                  v-if="screenSizes['<sm'] && props.fetchNote"
                  class="block text-center"
                  to="/user/notification"
                >
                  <label>我的消息</label
                  ><label v-if="listNoteCountUnread" class="bg-red-500 text-white text-sm rounded-full px-2">{{
                    listNoteCountUnread > 99 ? '99+' : listNoteCountUnread
                  }}</label></RouterLink
                >
                <RouterLink class="block text-center" to="/user/me">{{
                  t('common.nav-top.user.userprofile')
                }}</RouterLink>
                <div class="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500" @click="logout">
                  {{ t('common.nav-top.user.logout') }}
                  <div v-show="loggingOut" class="i-uil-spinner-alt inline-block text-2xl animate-spin"></div>
                </div>
              </div>
              <div v-else class="p-5">{{ t('common.nav-top.user.confirming') }}</div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    <!-- DrawerLayout -->
    <div>
      <!-- Drawer -->
      <div
        class="absolute inset-y-0 z-50 left-0 p-1 sm:px-2 w-3/4 sm:w-auto overflow-auto bg-white dark:bg-gray-900 transform transition-transform duration-250 ease-in-out"
        :class="{ '-translate-x-full': !drawerOpen }"
      >
        <!-- Title & Slide Button -->
        <div class="flex items-center flex-nowrap">
          <div class="inline-block rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            <div class="i-uil-times text-3xl p-1 cursor-pointer rounded-full" @click="drawerOpen = false"></div>
          </div>
          <Logo class="md:mr-15 cursor-pointer" :show-icon="false" @click="toHome()"></Logo>
        </div>
        <!-- Nav Items -->
        <template v-for="(link, index) in links" :key="link.key">
          <div v-if="link.type === 'blank' && link.text === ''" class="w-full mt-6"></div>
          <NavTopLink v-else :index="index" :drawer-open="drawerOpen" class="mt-1.5">
            <div v-if="link.type === 'catogory'" class="block text-gray-400 text-sm -mb-1" v-text="link.text"></div>
            <RouterLink v-else-if="link.type === 'router'" :to="link.path" class="block">
              <div v-if="link.icon" class="inline-block mr-1 text-xl text-center align-middle" :class="link.icon"></div>
              <div class="inline-block align-middle" v-text="link.text"></div>
            </RouterLink>
            <a v-else-if="link.type === 'a'" class="block" target="_blank" rel="noopener noreferrer" :href="link.href">
              <div v-if="link.icon" class="inline-block mr-1 text-xl text-center align-middle" :class="link.icon"></div>
              <div class="inline-block align-middle" v-text="link.text"></div>
            </a>
            <a v-else-if="link.type === 'click'" class="block" @click="link.onClick">
              <div v-if="link.icon" class="inline-block mr-1 text-xl text-center align-middle" :class="link.icon"></div>
              <div class="inline-block align-middle" v-text="link.text"></div>
            </a>
            <div v-else-if="link.type === 'select'" class="flex justify-between space-x-6 items-end">
              <label>
                <div
                  v-if="link.icon"
                  class="inline-block mr-1 text-xl text-center align-middle"
                  :class="link.icon"
                ></div>
                <div class="inline-block align-middle" v-text="link.text"></div>
              </label>
              <!-- TODO find a better way to do this -->
              <PvSelect
                :selected="link.selected.value"
                :item-list="link.options"
                @update:selected="(v) => (link.selected.value = v)"
              />
            </div>
            <div v-else-if="link.type === 'component'" class="flex justify-between space-x-6 items-end">
              <label>
                <div
                  v-if="link.icon"
                  class="inline-block mr-1 text-xl text-center align-middle"
                  :class="link.icon"
                ></div>
                <div class="inline-block align-middle" v-text="link.text"></div>
              </label>
              <Component :is="link.component" />
            </div>
            <div v-else class="block">
              <div v-if="link.icon" class="inline-block mr-1 text-xl text-center align-middle" :class="link.icon"></div>
              <div class="inline-block align-middle" v-text="link.text"></div>
            </div>
          </NavTopLink>
        </template>
      </div>
      <!-- Mask -->
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="bg-opacity-0"
        leave-active-class="transition-all duration-200"
        leave-to-class="bg-opacity-0"
      >
        <div
          v-if="drawerOpen"
          class="absolute inset-0 bg-black/20 z-49"
          @click="drawerOpen = false"
          @touchmove.prevent.passive
        ></div>
      </Transition>
    </div>
  </div>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="hidden invisible" v-html="hiddenStyle"></div>
  <div v-show="hidePage" class="absolute z-50 w-full h-full bg-white dark:bg-gray-900">
    <div ref="teleportTo" class="absolute w-full"></div>
  </div>
</template>

<script lang="ts" setup>
import Logo from '@/common/components/Logo.vue'
import AutoComplete from '@/search/components/AutoComplete.vue'
import PvSelect from '@/ui/components/PvSelect.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import DarkModeSwitch from '@/darkmode/components/DarkModeSwitch.vue'
import NavTopLink from './NavTopLink.vue'
import { ref, computed, shallowRef, Ref } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventListener } from '@vueuse/core'
import { locale, messages } from '@/locales'
import NoteBoxNavTop from '@/user-notification/components/NoteBoxNavTop.vue'
import { screenSizes } from '@/css'
import { progressing } from '@/common/lib/progressing'
import { user, isLogin, IsLogin, clearUserDataFromLocalStorage } from '@/user'

const props = withDefaults(
  defineProps<{
    showSearchBar?: boolean
    fetchNote?: boolean
  }>(),
  {
    showSearchBar: true,
    fetchNote: true,
  }
)

const { t } = useI18n()
const route = useRoute()

/* User lists Operation */
const userListOpen = ref<boolean>(false)
const userListBtn = shallowRef<HTMLDivElement | null>(null)
const userList = shallowRef<HTMLDivElement | null>(null)
const NoteBoxOpen = ref<boolean>(false)
const NoteBoxBtn = shallowRef<HTMLDivElement | null>(null)
const NoteBox = shallowRef<HTMLDivElement | null>(null)
useEventListener(document, 'click', (e: MouseEvent): void => {
  if (!(userList.value?.contains(e.target as HTMLElement) || userListBtn.value?.contains(e.target as HTMLElement))) {
    userListOpen.value = false
  }
  if (!(NoteBox.value?.contains(e.target as HTMLElement) || NoteBoxBtn.value?.contains(e.target as HTMLElement))) {
    NoteBoxOpen.value = false
  }
})

/* Notifications */
const listNoteCountUnread = ref(0)

/* Drawer Operation */
const drawerOpen = ref(false)
const hiddenStyle = computed(() => (drawerOpen.value ? '<style>body{overflow:hidden;}</style>' : ''))

/* Search */
const router = useRouter()
function searchResult(searchContent: string): void {
  hidePage.value = false
  router.push({ path: '/search-result', query: { i: searchContent } })
}

/* Back to home page */
function toHome(): void {
  router.push({ path: '/' })
}

/* Log out */
const loggingOut = ref(false)
async function logout(): Promise<void> {
  loggingOut.value = true
  await fetch('https://patchyvideo.com/be/logout.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({}),
    credentials: 'include',
  })
  clearUserDataFromLocalStorage()
  loggingOut.value = false
  location.reload()
}

const languageList = Object.entries(messages).map(([k, v]) => ({
  name: (v as { _info?: { name?: string } })?._info?.name ?? k,
  value: k,
}))

const autoComplete = ref<InstanceType<typeof AutoComplete> | null>(null)
const hidePage = ref(false)
const keyword = ref(
  route.path === '/search-result'
    ? route.query.i
      ? Array.isArray(route.query.i)
        ? route.query.i.join(' ')
        : route.query.i
      : ''
    : ''
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
      key: 'top-padding',
      type: 'blank',
      text: '',
    },
    {
      key: 'home',
      type: 'router',
      icon: 'i-uil-home-alt',
      text: t('common.nav-top.main-menu.home'),
      path: '/',
    },
    {
      key: 'video-list',
      type: 'router',
      icon: 'i-uil-play-circle',
      text: t('common.nav-top.main-menu.video'),
      path: '/video-list',
    },
    {
      key: 'playlist-list',
      type: 'router',
      icon: 'i-uil-folder',
      text: t('common.nav-top.main-menu.list'),
      path: '/playlist-list',
    },
    {
      key: 'discuss-board',
      type: 'click',
      icon: 'i-uil-chat',
      text: t('common.nav-top.main-menu.discuss-board'),
      onClick: () => progressing(t('common.nav-top.main-menu.discuss-board')),
    },
    {
      key: 'leaderboard',
      type: 'router',
      icon: 'i-uil-list-ol-alt',
      text: t('common.nav-top.main-menu.leaderboard'),
      path: '/leaderboard',
    },
    {
      key: 'wiki',
      type: 'a',
      icon: 'i-carbon-wikis',
      text: t('common.nav-top.main-menu.wiki'),
      href: 'https://patchyvideo.wiki/',
    },
  ]

  if (isLogin.value === IsLogin.yes)
    links.push(
      {
        key: 'user-padding',
        type: 'blank',
        text: '',
      },
      {
        key: 'postvideo',
        type: 'click',
        icon: 'i-uil-upload',
        text: t('common.nav-top.user-operation.postvideo'),
        onClick: () => progressing(t('common.nav-top.user-operation.postvideo')),
      },
      {
        key: 'edittag',
        type: 'click',
        icon: 'i-uil-tag-alt',
        text: t('common.nav-top.user-operation.tag'),
        onClick: () => progressing(t('common.nav-top.user-operation.tag')),
      }
    )
  if (isLogin.value === IsLogin.loading)
    links.push(
      {
        key: 'user-padding',
        type: 'blank',
        text: '',
      },
      {
        key: 'user-verify',
        type: 'blank',
        text: '验证登录中……',
      }
    )

  if (isLogin.value === IsLogin.yes && user.value.isAdmin)
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
      }
    )

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
    }
  )

  return links
})
</script>
