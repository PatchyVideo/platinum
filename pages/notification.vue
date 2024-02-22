<script setup lang="ts">
import type { Query } from '@/composables/graphql'

definePageMeta({
  key: route => JSON.stringify([
    route.query.page,
    route.query.limit,
    route.query.noteType,
  ]),
  layout: false,
  requiresAuth: true
})

const route = useRoute()

useHead({
  title: '消息中心',
})

const listAll = ref(true)

/* Precess URL query */
const page = computed(() => Number(pickFirstQuery(route.query.page)) || 1)
const limit = computed(() => Number(pickFirstQuery(route.query.limit)) || 20)
const noteType = computed<'comment_reply' | 'system_message' | 'at'>(() => {
  const type = String(pickFirstQuery(route.query.noteType))
  if (type !== 'comment_reply' && type !== 'system_message' && type !== 'at')
    return 'comment_reply'
  else return type
})

const { data } = await useAsyncQuery<Query>(
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
    offset: (page.value - 1) * limit.value,
    limit: limit.value,
    listAll: listAll.value,
    noteType: noteType.value,
  },
)
const listNotifications = computed(() => data.value!.listNotifications)
const listUnreadNotificationsCount = computed(() => data.value!.listUnreadNotificationsCount)
const listNoteCountTypesCommentReply = computed(() => listUnreadNotificationsCount.value.list.find(item => item.msgtype === 'comment_reply')?.count || 0)
const listNoteCountTypesSystemMessage = computed(() => listUnreadNotificationsCount.value.list.find(item => item.msgtype === 'system_message')?.count || 0)

function updatePage(page: number) {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page } })
}
</script>

<template>
  <div>
    <NuxtLayout name="default" :fetch-note="false">
      <div class="flex justify-between">
        <NotificationSlider :note-type="noteType" :list-note-count-unread="listNotifications.countUnread" :list-note-count-types-comment-reply="listNoteCountTypesCommentReply" :list-note-count-types-system-message="listNoteCountTypesSystemMessage" />
        <div class="flex-grow flex flex-col md:shadow">
          <NotificationList :limit="limit" :page="page" :note-type="noteType" />
          <PPagination
            class="mt-4"
            :page="page"
            :total="Math.ceil((listNotifications.pageCount || 1) / limit)"
            @update:page="updatePage"
          />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
