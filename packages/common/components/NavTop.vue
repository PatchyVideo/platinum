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
              ref="NoteBoxBtn"
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
              :class="{ 'bg-gray-200 dark:bg-gray-900': NoteBoxOpen }"
              @click="NoteBoxOpen = true"
            >
              <icon-uil-envelope />
              <label
                v-if="listNoteCount"
                class="absolute top-1 right-12 bg-red-500 text-white text-xs rounded-full px-1"
                >{{ listNoteCount > 99 ? '99+' : listNoteCount }}</label
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
                v-if="listNoteCount && !userListOpen && screenSizes['<sm']"
                class="absolute -top-0.3 -right-0.5 bg-red-500 rounded-full p-1.5"
              ></label>
            </div>
          </div>
          <!-- Message Box -->
          <Transition name="NoteBox">
            <div
              v-if="NoteBoxOpen"
              ref="NoteBox"
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
              <div v-else-if="listNoteCount === 0"></div>
              <div v-else>
                <div class="divide-y-2 max-h-100 overflow-auto">
                  <div
                    v-for="Note in listNote"
                    :key="Note.id.id"
                    class="hover:bg-gray-50 transition dark:hover:bg-gray-500"
                  >
                    <div v-if="Note.__typename === 'ReplyNotificationObject'" class="flex items-center space-x-2 p-2">
                      <router-link class="w-1/6 cursor-pointer" to>
                        <UserAvatar
                          :title="Note.repliedBy.username"
                          :image="Note.repliedBy.image"
                          class="rounded-full ring-2 ring-white"
                        ></UserAvatar>
                      </router-link>
                      <router-link
                        :to="
                          (Note.repliedType === 'forum'
                            ? ''
                            : Note.repliedType === 'video'
                            ? '/video/'
                            : '/playlist/') +
                          Note.repliedObj +
                          '#' +
                          Note.cid
                        "
                        tag="div"
                        class="w-5/6"
                      >
                        <div>
                          {{ Note.repliedBy.username + ' 回复了你：' }}
                        </div>
                        <div class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200">
                          {{ Note.content }}
                        </div>
                        <div class="text-xs text-gray-600 text-right dark:text-white">
                          <RelativeDate :date="Note.time" />
                        </div>
                      </router-link>
                    </div>
                    <div v-else-if="Note.__typename === 'SystemNotificationObject'" class="p-2">
                      <router-link tag="div" to class="flex items-center space-x-2">
                        <UserAvatar
                          :title="Note.title"
                          current="packages/user/assets/DefaultAvatar.jpg"
                          class="w-1/6 rounded-full ring-2 ring-white"
                        ></UserAvatar>
                        <div class="w-5/6">
                          <div class="truncate">
                            {{ '系统通知：' + Note.title }}
                          </div>
                          <div
                            class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200"
                          >
                            {{ Note.content }}
                          </div>
                          <div class="text-xs text-gray-600 text-right dark:text-white">
                            <RelativeDate :date="Note.time" />
                          </div>
                        </div>
                      </router-link>
                    </div>
                  </div>
                </div>
                <router-link to="/user/notification" class="pt-1 text-center block">查看全部回复</router-link>
              </div>
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
                <RouterLink v-if="screenSizes['<sm']" class="block text-center" to="/user/notification">
                  <label>我的消息</label
                  ><label v-if="listNoteCount" class="bg-red-500 text-white text-sm rounded-full px-2">{{
                    listNoteCount > 99 ? '99+' : listNoteCount
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
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
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

const props = defineProps({
  showSearchBar: {
    type: Boolean,
    default: true,
  },
  fetchNote: {
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
const NoteBoxOpen = ref<boolean>(false)
const NoteBoxBtn = ref<HTMLDivElement | null>(null)
const NoteBox = ref<HTMLDivElement | null>(null)
useEventListener(document, 'click', (e: MouseEvent): void => {
  if (!(userList.value?.contains(e.target as HTMLElement) || userListBtn.value?.contains(e.target as HTMLElement))) {
    userListOpen.value = false
  }
  if (!(NoteBox.value?.contains(e.target as HTMLElement) || NoteBoxBtn.value?.contains(e.target as HTMLElement))) {
    NoteBoxOpen.value = false
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
const listNoteOffset = ref<number>(0)
const listNoteLimit = ref<number>(10)
const listNoteAll = ref<boolean>(false)
const listNote = ref<
  (schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
>([])
const listNoteCount = ref<number>(0)
const listNoteStatus = ref<'loading' | 'result' | 'error'>()
watch(isLogin, () => {
  if (isLogin.value === IsLogin.yes)
    fetchMore({
      variables: {
        offset: listNoteOffset.value,
        limit: listNoteLimit.value,
        listAll: listNoteAll.value,
      },
    })?.then((v) => {
      result.value = v.data
    })
})
const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int, $limit: Int, $listAll: Boolean) {
      listNotifications(para: { offset: $offset, limit: $limit, listAll: $listAll }) {
        notes {
          id
          ... on ReplyNotificationObject {
            cid
            repliedBy {
              id
              username
              image
            }
            time
            repliedObj
            repliedType
            content
          }
          ... on SystemNotificationObject {
            time
            title
            content
          }
        }
        count
      }
    }
  `,
  {
    offset: listNoteOffset.value,
    limit: listNoteLimit.value,
    listAll: listNoteAll.value,
  }
)
watchEffect(() => {
  if (loading.value) {
    listNoteStatus.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    listNoteStatus.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})
const resultData = useResult(result, null, (data) => data.listNotifications)
watchEffect(() => {
  if (resultData.value && props.fetchNote) {
    listNote.value = resultData.value.notes
    listNoteCount.value = resultData.value.count
  } else listNoteStatus.value = 'error'
})
onError((err) => {
  // errNote.value = err.message
  listNoteStatus.value = 'error'
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
