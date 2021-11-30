<template>
  <LayoutDefault :fetch-note="false">
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']" class="w-full p-2 dark:bg-gray-900 dark:border-black">
      <div v-if="noteType === 'comment_reply'">
        <NoteBoxReplyComment v-model:limit="limit" v-model:offset="offset" v-model:pageCount="pageCount" />
      </div>
      <div v-else-if="noteType === 'system_message'">
        <NoteBoxSystemMessage v-model:limit="limit" v-model:offset="offset" v-model:pageCount="pageCount" />
      </div>
      <PvPagination
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
        class="fixed inset-y-0 p-1 z-50 right-0 overflow-auto bg-white transform transition-transform duration-300 w-3/4 dark:bg-gray-900"
        :class="{ 'translate-x-full': !noteDrawerOpen }"
      >
        <div class="w-full border-b p-1 pb-1.5 flex items-center flex-nowrap">
          <icon-uil-telegram-alt class="text-2xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" />
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
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="bg-opacity-0"
        leave-active-class="transition-all duration-200"
        leave-to-class="bg-opacity-0"
      >
        <div
          v-if="noteDrawerOpen"
          class="fixed inset-0 bg-black bg-opacity-20 z-49"
          @click="noteDrawerOpen = false"
        ></div>
      </Transition>
    </div>
    <!-- Desktop View -->
    <div v-else class="p-5 flex space-x-3 min-h-screen w-9/10 m-auto xl:w-4/5">
      <!-- Nav Left -->
      <div class="p-1 overflow-auto rounded-md shadow bg-white w-1/4 xl:w-1/5 dark:bg-gray-900">
        <div class="w-full border-b p-1 pb-1.5 flex items-center flex-nowrap">
          <icon-uil-telegram-alt class="text-2xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" />
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
        <div v-if="noteType === 'comment_reply'">
          <NoteBoxReplyComment v-model:limit="limit" v-model:offset="offset" v-model:pageCount="pageCount" />
        </div>
        <div v-else-if="noteType === 'system_message'">
          <NoteBoxSystemMessage v-model:limit="limit" v-model:offset="offset" v-model:pageCount="pageCount" />
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
import PvPagination from '@/ui/components/PvPagination.vue'
import NoteBoxReplyComment from './components/NoteBoxReplyComment.vue'
import NoteBoxSystemMessage from './components/NoteBoxSystemMessage.vue'
import { ref, watchEffect, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import NProgress from 'nprogress'
import { screenSizes } from '@/css'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
setSiteTitle('消息中心' + ' - PatchyVideo')

const noteDrawerOpen = ref<boolean | undefined>()
const listAll = ref(true)
const listNoteCountAll = ref<number>(0)
const listNoteCountUnread = ref<number>(0)
const listNoteCountTypes = ref<schema.ListUnreadNotificationCountGqlResultItem[] | undefined>([])
const listNoteCountStatus = ref<'loading' | 'result' | 'error'>()
const pageCount = ref<schema.Maybe<number> | undefined>(0)

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
watch(URLQuery, () => {
  fetchMore({
    variables: {
      offset: offset.value * limit.value,
      limit: limit.value,
      listAll: listAll.value,
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
    listAll: listAll.value,
    noteType: noteType.value,
  }
)
watchEffect(() => {
  if (loading.value) {
    listNoteCountStatus.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    listNoteCountStatus.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})
const listNotifications = useResult(result, null, (data) => data?.listNotifications)
const listUnreadNotificationsCount = useResult(result, null, (data) => data?.listUnreadNotificationsCount)
watchEffect(() => {
  if (listNotifications.value) {
    listNoteCountAll.value = listNotifications.value.countAll
    listNoteCountUnread.value = listNotifications.value.countUnread
    listNoteCountTypes.value = listUnreadNotificationsCount.value?.list
    pageCount.value = listNotifications.value.pageCount
  } else listNoteCountStatus.value = 'error'
})
onError((err) => {
  // errNote.value = err.message
  listNoteCountStatus.value = 'error'
})

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
