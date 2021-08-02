<template>
  <LayoutDefault :fetch-note="false">
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']" class="w-full p-2 dark:bg-gray-700 dark:border-black">
      <div v-if="loading">加载中</div>
      <div v-else-if="listNoteCountAll == 0"></div>
      <div v-else-if="noteType === 'comment_reply'">
        <div class="border-b flex justify-between p-1">
          <div>回复我的</div>
          <div class="text-sm" :class="{ 'text-gray-500': !listNoteCountUnread }">全部标为已读</div>
        </div>
        <div v-for="note in listNote" :key="note.id.toHexString()">
          <div
            v-if="note.__typename === 'ReplyNotificationObject'"
            class="flex items-center m-1 p-2 shadow rounded-md"
            :class="{ 'bg-gray-100 dark:bg-gray-500': !note.read }"
          >
            <router-link class="w-1/6 cursor-pointer" to>
              <UserAvatar
                :title="note.repliedBy.username"
                :image="note.repliedBy.image"
                class="rounded-full ring-2 ring-white"
              ></UserAvatar>
            </router-link>
            <router-link
              :to="
                (note.repliedType === 'forum' ? '' : note.repliedType === 'video' ? '/video/' : '/playlist/') +
                note.repliedObj +
                '#' +
                note.cid
              "
              tag="div"
              class="w-5/6"
              @click="markAsRead(false, note.__typename, [note.id.toHexString()])"
              @click.middle="markAsRead(false, note.__typename, [note.id.toHexString()])"
            >
              <div>
                {{ note.repliedBy.username + ' 回复了你：' }}
              </div>
              <div class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200">
                {{ note.content }}
              </div>
              <div class="text-xs text-gray-600 dark:text-white">
                <RelativeDate :date="note.time" />
              </div>
            </router-link>
          </div>
        </div>
      </div>
      <div v-else-if="noteType === 'system_message'">
        <div class="border-b flex justify-between p-1">
          <div>系统通知</div>
          <div class="text-sm" :class="{ 'text-gray-500': !listNoteCountUnread }">全部标为已读</div>
        </div>
        <div class="divide-y-2">
          <div v-for="note in listNote" :key="note.id.toHexString()">
            <div
              v-if="note.__typename === 'SystemNotificationObject'"
              class="m-1 p-2 shadow rounded-md space-y-2"
              :class="{ 'bg-gray-100 dark:bg-gray-500': !note.read }"
            >
              <div>{{ note.title }}</div>
              <div class="text-sm">
                {{ note.content }}
              </div>
              <div class="text-xs text-gray-600 dark:text-white">
                <RelativeDate :date="note.time" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <PvPagination
        v-if="!loading"
        :page-count="Number(pageCount)"
        :page="page"
        @previous="jumpToPreviousPage"
        @next="jumpToNextPage"
        @change="jumpToSelectedPage"
      ></PvPagination>
      <!-- DrawerLayout -->
      <div
        class="shadow fixed bottom-20 right-5 bg-gray-50 select-none p-2 rounded-full dark:bg-gray-800"
        title="打开消息侧栏"
        @click="noteDrawerOpen = true"
      >
        <icon-uil-chat class="text-2xl" />
        <label
          v-if="listNoteCountUnread"
          class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1"
          >{{ listNoteCountUnread > 99 ? '99+' : listNoteCountUnread }}</label
        >
      </div>
      <div
        class="
          fixed
          inset-y-0
          p-1
          z-50
          right-0
          overflow-auto
          bg-white
          transform-gpu
          transition-transform
          duration-300
          w-9/12
          dark:bg-gray-700
        "
        :class="{ 'translate-x-full': !noteDrawerOpen }"
      >
        <div class="w-full border-b p-1 pb-1.5 flex items-center flex-nowrap">
          <icon-uil-telegram-alt class="text-2xl transition-colors hover:bg-gray-200 hover:dark:bg-gray-900" />
          <div class="text-lg ml-2">消息中心</div>
        </div>
        <div class="mt-4 space-y-2">
          <div
            class="flex align-middle p-2 rounded-md"
            :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': noteType === 'comment_reply' }"
            @click="changeNoteType('comment_reply')"
          >
            <icon-uil-comment-alt-dots class="inline align-middle w-7 text-lg text-center" />
            <div>
              回复我的<label
                v-if="listNoteCountTypes?.find((type) => type.msgtype === 'comment_reply')?.count"
                class="bg-red-500 text-white text-sm rounded-full px-2"
                >{{
                  listNoteCountTypes?.find((type) => type.msgtype === 'comment_reply')?.count
                    ? listNoteCountTypes?.find((type) => type.msgtype === 'comment_reply')?.count
                    : 0 > 99
                    ? '99+'
                    : listNoteCountTypes.find((type) => type.msgtype === 'comment_reply')?.count
                }}</label
              >
            </div>
          </div>
          <div
            class="flex align-middle p-2 rounded-md text-gray-500"
            :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': noteType === 'at' }"
          >
            <icon-uil-at class="inline align-middle w-7 text-lg text-center" />
            <div>艾特我的（建设中）</div>
          </div>
          <div
            class="flex align-middle p-2 rounded-md"
            :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': noteType === 'system_message' }"
            @click="changeNoteType('system_message')"
          >
            <icon-uil-volume class="inline align-middle w-7 text-lg text-center" />
            <div>
              系统通知<label
                v-if="listNoteCountTypes?.find((type) => type.msgtype === 'system_message')?.count"
                class="bg-red-500 text-white text-sm rounded-full px-2"
                >{{
                  listNoteCountTypes?.find((type) => type.msgtype === 'system_message')?.count
                    ? listNoteCountTypes?.find((type) => type.msgtype === 'system_message')?.count
                    : 0 > 99
                    ? '99+'
                    : listNoteCountTypes.find((type) => type.msgtype === 'system_message')?.count
                }}</label
              >
            </div>
          </div>
        </div>
      </div>
      <!-- Mask -->
      <Transition name="mask">
        <div
          v-if="noteDrawerOpen"
          class="fixed inset-0 bg-black bg-opacity-20 z-49"
          @click="noteDrawerOpen = false"
        ></div>
      </Transition>
    </div>
    <!-- Desktop View -->
    <div v-else class="p-5 flex space-x-3 min-h-screen w-9/10 m-auto xl:w-4/5">
      <div class="p-1 overflow-auto rounded-md shadow bg-white w-1/4 xl:w-1/5 dark:bg-gray-700">
        <div class="w-full border-b p-1 pb-1.5 flex items-center flex-nowrap">
          <icon-uil-telegram-alt class="text-2xl transition-colors hover:bg-gray-200 hover:dark:bg-gray-900" />
          <div class="text-lg ml-2">消息中心</div>
        </div>
        <div class="mt-4 space-y-2">
          <div
            class="flex align-middle p-2 rounded-md cursor-pointer"
            :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': noteType === 'comment_reply' }"
            @click="changeNoteType('comment_reply')"
          >
            <icon-uil-comment-alt-dots class="inline align-middle w-7 text-lg text-center" />
            <div>
              回复我的<label
                v-if="listNoteCountTypes?.find((type) => type.msgtype === 'comment_reply')?.count"
                class="bg-red-500 text-white text-sm rounded-full px-2"
                >{{
                  listNoteCountTypes?.find((type) => type.msgtype === 'comment_reply')?.count
                    ? listNoteCountTypes?.find((type) => type.msgtype === 'comment_reply')?.count
                    : 0 > 99
                    ? '99+'
                    : listNoteCountTypes.find((type) => type.msgtype === 'comment_reply')?.count
                }}</label
              >
            </div>
          </div>
          <div
            class="flex align-middle p-2 rounded-md text-gray-500 cursor-pointer"
            :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': noteType === 'at' }"
          >
            <icon-uil-at class="inline align-middle w-7 text-lg text-center" />
            <div>艾特我的（建设中）</div>
          </div>
          <div
            class="flex align-middle p-2 rounded-md cursor-pointer"
            :class="{ 'bg-gray-50 shadow-inner dark:bg-gray-500': noteType === 'system_message' }"
            @click="changeNoteType('system_message')"
          >
            <icon-uil-volume class="inline align-middle w-7 text-lg text-center" />
            <div>
              系统通知<label
                v-if="listNoteCountTypes?.find((type) => type.msgtype === 'system_message')?.count"
                class="bg-red-500 text-white text-sm rounded-full px-2"
                >{{
                  listNoteCountTypes?.find((type) => type.msgtype === 'system_message')?.count
                    ? listNoteCountTypes?.find((type) => type.msgtype === 'system_message')?.count
                    : 0 > 99
                    ? '99+'
                    : listNoteCountTypes.find((type) => type.msgtype === 'system_message')?.count
                }}</label
              >
            </div>
          </div>
        </div>
      </div>
      <div class="w-3/4 p-2 bg-white rounded-md shadow xl:4/5 dark:bg-gray-600">
        <div v-if="loading">加载中</div>
        <div v-else-if="listNoteCountAll == 0"></div>
        <div v-else-if="noteType === 'comment_reply'">
          <div class="border-b flex justify-between p-1">
            <div>回复我的</div>
            <div class="text-sm cursor-pointer" :class="{ 'text-gray-500': !listNoteCountUnread }">全部标为已读</div>
          </div>
          <div v-for="note in listNote" :key="note.id.toHexString()">
            <div
              v-if="note.__typename === 'ReplyNotificationObject'"
              class="flex items-center m-1 p-2 shadow rounded-md"
              :class="{ 'bg-gray-100 dark:bg-gray-500': !note.read }"
            >
              <router-link class="w-1/10 cursor-pointer xl:w-1/15" to>
                <UserAvatar
                  :title="note.repliedBy.username"
                  :image="note.repliedBy.image"
                  class="rounded-full ring-2 ring-white"
                ></UserAvatar>
              </router-link>
              <router-link
                :to="
                  (note.repliedType === 'forum' ? '' : note.repliedType === 'video' ? '/video/' : '/playlist/') +
                  note.repliedObj +
                  '#' +
                  note.cid
                "
                tag="div"
                class="w-9/10 xl:w-14/15"
                @click="markAsRead(false, note.__typename, [note.id.toHexString()])"
                @click.middle="markAsRead(false, note.__typename, [note.id.toHexString()])"
              >
                <div>
                  {{ note.repliedBy.username + ' 回复了你：' }}
                </div>
                <div class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200">
                  {{ note.content }}
                </div>
                <div class="text-xs text-gray-600 dark:text-white">
                  <RelativeDate :date="note.time" />
                </div>
              </router-link>
            </div>
          </div>
        </div>
        <div v-else-if="noteType === 'system_message'">
          <div class="border-b flex justify-between p-1">
            <div>系统通知</div>
            <div class="text-sm" :class="{ 'text-gray-500': !listNoteCountUnread }">全部标为已读</div>
          </div>
          <div class="divide-y-2">
            <div v-for="note in listNote" :key="note.id.toHexString()">
              <div
                v-if="note.__typename === 'SystemNotificationObject'"
                class="m-1 p-2 shadow rounded-md space-y-2 cursor-pointer"
                :class="{ 'bg-gray-100 dark:bg-gray-500': !note.read }"
              >
                <div>{{ note.title }}</div>
                <div class="text-sm">
                  {{ note.content }}
                </div>
                <div class="text-xs text-gray-600 dark:text-white">
                  <RelativeDate :date="note.time" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <PvPagination
          v-if="!loading"
          :page-count="Number(pageCount)"
          :page="page"
          @previous="jumpToPreviousPage"
          @next="jumpToNextPage"
          @change="jumpToSelectedPage"
        ></PvPagination>
      </div>
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import UserAvatar from '@/user/components/UserAvatar.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import { ref, watchEffect, computed, watch } from 'vue'
import { markAsReadStatus } from './lib/markAsRead'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { useQuery, useMutation, gql, useResult } from '@/graphql'
import type { schema, Query, Mutation } from '@/graphql'
import NProgress from 'nprogress'
import { screenSizes } from '@/tailwindcss'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
setSiteTitle('消息中心' + ' - PatchyVideo')

const noteDrawerOpen = ref<boolean | undefined>()
const listNoteAll = ref<boolean>(true)
const listNote = ref<
  (schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
>([])
const listNoteCountAll = ref<number>(0)
const listNoteCountUnread = ref<number>(0)
const listNoteCountTypes = ref<schema.ListUnreadNotificationCountGqlResultItem[] | undefined>([])
const pageCount = ref<schema.Maybe<number> | undefined>(0)
const listNoteStatus = ref<'loading' | 'result' | 'error'>()

/* Precess URL query */
const limit = computed(() => {
  return Number(route.query.limit ? (Array.isArray(route.query.limit) ? route.query.limit[0] : route.query.limit) : 10)
})
const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
)
const page = computed(() => offset.value + 1)
const noteType = computed(() => {
  return String(
    route.query.type ? (Array.isArray(route.query.type) ? route.query.type[0] : route.query.type) : 'comment_reply'
  )
})

/* Query for notifications */
const URLQuery = computed(() => route.query)
watch(URLQuery, async () => {
  await (() => {
    markAsReadStatus.value === 'result'
  })
  fetchMore({
    variables: {
      offset: offset.value * limit.value,
      limit: limit.value,
      listAll: listNoteAll.value,
      noteType: noteType.value,
    },
  })?.then((v) => {
    result.value = v.data
  })
})
const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int, $limit: Int, $listAll: Boolean, $noteType: String) {
      listNotifications(para: { offset: $offset, limit: $limit, listAll: $listAll, noteType: $noteType }) {
        notes {
          id
          read
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
        countAll
        countUnread
        pageCount
      }
      listUnreadNotificationsCount {
        list {
          msgtype
          count
        }
      }
    }
  `,
  {
    offset: offset.value * limit.value,
    limit: limit.value,
    listAll: listNoteAll.value,
    noteType: noteType.value,
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
const listNotifications = useResult(result, null, (data) => data?.listNotifications)
const listUnreadNotificationsCount = useResult(result, null, (data) => data?.listUnreadNotificationsCount)
watchEffect(() => {
  if (listNotifications.value) {
    listNote.value = listNotifications.value.notes
    listNoteCountAll.value = listNotifications.value.countAll
    listNoteCountUnread.value = listNotifications.value.countUnread
    listNoteCountTypes.value = listUnreadNotificationsCount.value?.list
    pageCount.value = listNotifications.value.pageCount
  } else listNoteStatus.value = 'error'
})
onError((err) => {
  // errNote.value = err.message
  listNoteStatus.value = 'error'
})

/* Mutation for notifications read */
const { mutate } = useMutation<Mutation>(
  gql`
    mutation ($markAll: Boolean, $noteType: String, $noteIds: [String!]) {
      markAsRead(para: { markAll: $markAll, noteType: $noteType, noteIds: $noteIds }) {
        empty
      }
    }
  `
)
function markAsRead(markAll = false, noteType: string, noteId: string[]): void {
  // Because it doesn't matter wether it returns successful or not, we just assume that it returns success
  // So that to avoid two 'loading' variables
  // listNote.value.find((note) => note.id.toHexString() === noteId)!.read = true
  mutate({ markAll: markAll, noteType: noteType, noteIds: noteId })
  if (markAll) location.reload
}

/* Change the router query to trigger the search function */
function jumpToPreviousPage(): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = offset.value - 1
  router.push({ path: route.path, query })
}
function jumpToNextPage(): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = offset.value + 1
  router.push({ path: route.path, query })
}
function jumpToSelectedPage(page: number): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = page - 1
  router.push({ path: route.path, query })
}
function changeNoteType(type: string): void {
  const query = JSON.parse(JSON.stringify(route.query))
  if (query.type === type) return
  noteDrawerOpen.value = false
  query.page = 0
  query.type = type
  router.push({ path: route.path, query })
}
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
</style>
