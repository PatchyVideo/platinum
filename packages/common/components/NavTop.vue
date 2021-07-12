<template>
  <div>
    <!-- Top Nav -->
    <div
      class="
        h-auto
        p-1
        flex
        items-center
        justify-between
        border-b border-gray-300
        bg-gray-50
        dark:bg-gray-700 dark:border-gray-800
      "
    >
      <!-- Logo & Slide Button -->
      <div v-show="!hidePage" class="flex items-center flex-nowrap ml-2">
        <icon-uil-list-ul
          class="text-2xl cursor-pointer rounded-full transition-colors hover:bg-gray-200 hover:dark:bg-gray-900"
          @click="drawerOpen = true"
        />
        <Logo v-if="screenSizes.md" class="cursor-pointer inline-block" @click="toHome()"></Logo>
      </div>
      <!-- Search Bar -->
      <div v-if="showSearchBar" class="flex flex-auto flex-nowrap items-center justify-center mx-2">
        <AutoComplete
          ref="autoComplete"
          v-model:keyword="keyword"
          class="w-full max-w-150"
          :teleport-result="teleportTo"
          :show-recommendations="true"
          @search="searchResult"
          @click="() => screenSizes['<sm'] && (hidePage = true)"
        ></AutoComplete>
        <div v-if="hidePage === true" class="ml-2 whitespace-nowrap" @click="hidePage = false">取消</div>
      </div>
      <!-- User Box -->
      <div v-show="!hidePage" class="mr-2">
        <div v-if="isLogin === IsLogin.no" class="whitespace-nowrap">
          <RouterLink to="/user/login" v-text="t('common.nav-top.user.login')"></RouterLink>
        </div>
        <div v-else class="relative">
          <div class="flex items-center space-x-3">
            <div
              v-if="!screenSizes['<sm']"
              ref="msgBoxBtn"
              class="
                flex
                items-center
                justify-center
                w-9
                h-9
                text-xl
                cursor-pointer
                rounded-full
                transition-colors
                hover:bg-gray-200 hover:dark:bg-gray-900
              "
              :class="{ 'bg-gray-200 dark:bg-gray-900': msgBoxOpen }"
              @click="msgBoxOpen = true"
            >
              <icon-uil-envelope />
              <label
                v-if="listMsgCount"
                class="absolute top-1 right-12 bg-red-500 text-white text-xs rounded-full px-1"
                >{{ listMsgCount > 99 ? '99+' : listMsgCount }}</label
              >
            </div>
            <div ref="userListBtn">
              <UserAvatar
                :title="user.name"
                :image="user.avatar"
                class="h-9 w-9 rounded-full ring-2 ring-white cursor-pointer"
                @click="userListOpen = true"
              ></UserAvatar>
              <label
                v-if="listMsgCount && !userListOpen && screenSizes['<sm']"
                class="absolute -top-0.3 -right-0.5 bg-red-500 rounded-full p-1.5"
              ></label>
            </div>
          </div>
          <!-- Message Box -->
          <Transition name="msgBox">
            <div
              v-if="msgBoxOpen"
              ref="msgBox"
              class="
                z-999
                absolute
                right-0
                top-10
                w-80
                p-2
                rounded
                overflow-hidden
                bg-white
                border
                shadow
                overflow-visible
                dark:bg-gray-700 dark:border-black
              "
            >
              通知
              <div v-if="loading">加载中</div>
            </div>
          </Transition>
          <!-- User List -->
          <Transition name="userList">
            <div
              v-if="userListOpen"
              ref="userList"
              class="
                z-999
                absolute
                -right-2
                top-5
                w-40
                p-2
                mt-1/2
                rounded
                overflow-hidden
                bg-white
                border
                shadow
                overflow-visible
                dark:bg-gray-700 dark:border-black
              "
            >
              <UserAvatar
                :title="user.name"
                :image="user.avatar"
                class="h-13 w-13 rounded-full ring-2 ring-white cursor-pointer absolute right-0 -top-5"
              ></UserAvatar>
              <div v-if="isLogin === IsLogin.yes" class="space-y-3">
                <div class="text-lg font-800 truncate w-25">{{ user.name }}</div>
                <RouterLink v-if="screenSizes['<sm']" class="block text-center" to="">
                  <label>我的消息</label
                  ><label v-if="listMsgCount" class="bg-red-500 text-white text-sm rounded-full px-2">{{
                    listMsgCount > 99 ? '99+' : listMsgCount
                  }}</label></RouterLink
                >
                <RouterLink class="block text-center" to="/user/me">{{
                  t('common.nav-top.user.userprofile')
                }}</RouterLink>
                <div class="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500" @click="logout">
                  {{ t('common.nav-top.user.logout') }}<icon-uil-spinner-alt v-show="loggingOut" class="inline-block" />
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
        class="
          absolute
          inset-y-0
          p-1
          z-50
          left-0
          overflow-auto
          bg-white
          transform-gpu
          transition-transform
          duration-300
          w-9/12
          dark:bg-gray-700
          md:w-auto md:p-2
        "
        :class="{ '-translate-x-full': !drawerOpen }"
      >
        <!-- Title & Slide Button -->
        <div class="flex items-center flex-nowrap">
          <icon-uil-times
            class="text-2xl cursor-pointer rounded-full transition-colors hover:bg-gray-200 hover:dark:bg-gray-900"
            @click="drawerOpen = false"
          />
          <Logo class="md:mr-15 cursor-pointer" :show-icon="false" @click="toHome()"></Logo>
        </div>
        <!-- Main List -->
        <div class="mt-4 space-y-2">
          <RouterLink to="/" class="block"
            ><icon-uil-home-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.home')
            }}</RouterLink
          >
          <RouterLink to="/video-list" class="block"
            ><icon-uil-play-circle class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.video')
            }}</RouterLink
          >
          <RouterLink to="/playlist-list" class="block"
            ><icon-uil-folder class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.list')
            }}</RouterLink
          >
          <a class="block" @click="progressing()"
            ><icon-uil-chat class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.discuss-board')
            }}</a
          >
          <a class="block" @click="progressing()"
            ><icon-uil-list-ol-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.leaderboard')
            }}</a
          >
          <a class="block" href="https://patchyvideo.wiki/" target="_blank" rel="noopener noreferrer"
            ><icon-carbon-wikis class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.wiki')
            }}</a
          >
        </div>
        <!-- User List -->
        <div v-if="isLogin === IsLogin.yes" class="mt-4 space-y-2">
          <a class="block" @click="progressing()"
            ><icon-uil-upload class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.user-operation.postvideo')
            }}</a
          >
          <a class="block" @click="progressing()"
            ><icon-uil-tag-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.user-operation.tag')
            }}</a
          >
        </div>
        <div v-else-if="isLogin === IsLogin.loading" class="mt-8">验证登录中...</div>
        <!-- Super Admin -->
        <div v-if="isLogin === IsLogin.yes && user.isAdmin" class="mt-8 w-full space-y-2">
          <div class="text-gray-400 text-xs" v-text="t('common.nav-top.admin.admin')"></div>
          <div v-text="t('common.nav-top.admin.who-am-I')"></div>
          <a class="block" v-text="t('common.nav-top.admin.super-admin')"></a>
        </div>
        <!-- Settings -->
        <div class="mt-8 w-full space-y-2">
          <div class="text-gray-400 text-xs" v-text="t('common.nav-top.settings.settings')"></div>
          <div class="flex justify-between items-center">
            <label class="space-x-2">
              <label v-text="t('common.nav-top.settings.darkmode')"></label>
              <label class="bg-gray-600 text-white text-xs rounded-full px-1">Beta</label>
            </label>
            <PvCheckBox v-model:check="isDark"></PvCheckBox>
          </div>
          <div class="flex justify-between items-center">
            <label v-text="t('common.nav-top.settings.lang')"></label>
            <PvSelect v-model:selected="locale" :item-list="languageList"></PvSelect>
          </div>
        </div>
      </div>
      <!-- Mask -->
      <Transition name="mask">
        <div
          v-if="drawerOpen"
          class="absolute inset-0 bg-black bg-opacity-20 z-49"
          @click="drawerOpen = false"
          @touchmove.prevent.passive
        ></div>
      </Transition>
    </div>
  </div>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="hidden invisible" v-html="hiddenStyle"></div>
  <div v-if="hidePage" class="absolute z-50 w-full h-full bg-white dark:bg-gray-700">
    <div ref="teleportTo" class="absolute w-full"></div>
  </div>
</template>

<script lang="ts" setup>
import Logo from '@/common/components/Logo.vue'
import AutoComplete from '@/search/components/AutoComplete.vue'
import PvSelect from '@/ui/components/PvSelect.vue'
import PvCheckBox from '@/ui/components/PvCheckBox.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import { ref, computed, defineProps, watchEffect, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventListener } from '@vueuse/core'
import { isDark } from '@/darkmode'
import { locale, messages } from '@/locales'
import { screenSizes } from '@/tailwindcss'
import { progressing } from '@/common/lib/progressing'
import { user, isLogin, IsLogin, clearUserDataFromLocalStorage } from '@/user'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import NProgress from 'nprogress'

defineProps({
  showSearchBar: {
    type: Boolean,
    default: true,
  },
})

const { t } = useI18n()
const route = useRoute()

/* User lists Operation */
const userListOpen = ref<boolean>(false)
const userListBtn = ref<HTMLDivElement | null>(null)
const userList = ref<HTMLDivElement | null>(null)
const msgBoxOpen = ref<boolean>(false)
const msgBoxBtn = ref<HTMLDivElement | null>(null)
const msgBox = ref<HTMLDivElement | null>(null)
useEventListener(document, 'click', (e: MouseEvent): void => {
  if (!(userList.value?.contains(e.target as HTMLElement) || userListBtn.value?.contains(e.target as HTMLElement))) {
    userListOpen.value = false
  }
  if (!(msgBox.value?.contains(e.target as HTMLElement) || msgBoxBtn.value?.contains(e.target as HTMLElement))) {
    msgBoxOpen.value = false
  }
})

/* Drawer Operation */
const drawerOpen = ref<boolean | undefined>()
const hiddenStyle = computed(() => (drawerOpen.value ? '<style>body{overflow:hidden;}</style>' : ''))

/* Search */
const router = useRouter()
function searchResult(searchContent: string): void {
  hidePage.value = false
  router.push({ path: '/search-result', query: { i: searchContent } })
}

/* List unread messages */
const listMsgOffset = ref<number>(0)
const listMsgLimit = ref<number>(10)
const listMsgAll = ref<boolean>(false)
const listMsg = ref<schema.NotificationObject[]>()
const listMsgCount = ref<number>(0)
const listMsgStatus = ref<'loading' | 'result' | 'error'>()
watch(
  isLogin,
  () => {
    if (isLogin.value === IsLogin.yes)
      fetchMore({
        variables: {
          offset: listMsgOffset.value,
          limit: listMsgLimit.value,
          listAll: listMsgAll.value,
        },
      })?.then((v) => {
        result.value = v.data
      })
  },
  { deep: true }
)
const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int, $limit: Int, $listAll: Boolean) {
      listNotifications(para: { offset: $offset, limit: $limit, listAll: $listAll }) {
        notes {
          id
          type
        }
        count
      }
    }
  `,
  {
    offset: listMsgOffset.value,
    limit: listMsgLimit.value,
    listAll: listMsgAll.value,
  }
)
watchEffect(() => {
  if (loading.value) {
    listMsgStatus.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    listMsgStatus.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})
const resultData = useResult(result, null, (data) => data.listNotifications)
watchEffect(() => {
  if (resultData.value) {
    console.log(resultData.value)
    listMsg.value = resultData.value.notes
    listMsgCount.value = resultData.value.count
  } else listMsgStatus.value = 'error'
})
onError((err) => {
  // errMsg.value = err.message
  listMsgStatus.value = 'error'
})

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

const teleportTo = ref<HTMLElement>()
</script>

<style lang="postcss" scoped>
.mask-enter-active,
.mask-leave-active {
  @apply transition-all duration-200;
}
.mask-enter-from,
.mask-leave-to {
  @apply bg-opacity-0;
}
.userList-enter-active,
.userList-leave-active {
  transition: opacity 0.2s ease;
}

.userList-enter-from,
.userList-leave-to {
  opacity: 0;
}
</style>
