<template>
  <div class="border-b flex justify-between p-1">
    <div>{{ t('user-notification.notification-reply.title') }}</div>
    <div
      class="text-sm cursor-pointer transition transition-colors hover:text-purple-300"
      :class="{ 'text-gray-500': !listNoteCountUnread }"
      @click="markAsRead(true, (noteType = 'comment_reply'), [])"
    >
      {{ t('user-notification.notification-reply.mark-all-as-read') }}
    </div>
  </div>
  <div v-if="listNoteStatus === 'loading'">
    {{ t('user-notification.notification-reply.loading') }}
  </div>
  <div v-else-if="listNoteStatus === 'error'" />
  <div v-else-if="listNoteCountAll === 0">
    {{ t('user-notification.notification-reply.no-message') }}
  </div>
  <div v-else>
    <div v-for="note in listNote" :key="note.id.toHexString()">
      <div
        v-if="note.__typename === 'ReplyNotificationObject'"
        class="flex items-center m-1 p-2 shadow rounded-md"
        :class="{ 'bg-gray-100 dark:bg-gray-500': !note.read }"
      >
        <router-link class="w-1/6 md:w-1/15 mr-2 cursor-pointer" :to="`/user/${note.repliedBy.id.toHexString()}`">
          <UserAvatar
            :title="note.repliedBy.username"
            :image="note.repliedBy.image"
            :gravatar="note.repliedBy.gravatar"
            class="rounded-full ring-2 ring-white"
          />
        </router-link>
        <router-link
          v-slot="{ href, navigate }"
          :to="
            `${(note.repliedType === 'forum' ? '' : note.repliedType === 'video' ? '/video/' : '/playlist/')
              + note.repliedObj
            }#${
              note.cid}`
          "
          custom
        >
          <div
            class="w-5/6 md:w-14/15"
            @click="
              () => {
                markAsRead(false, note.__typename, [note.id.toHexString()], note.read)
                navigate()
              }
            "
            @click.middle="
              () => {
                markAsRead(false, note.__typename, [note.id.toHexString()], note.read)
                openInNewTab(href)
              }
            "
          >
            <div>
              {{ t('user-notification.notification-reply.reply', { username: note.repliedBy.username }) }}
            </div>
            <div class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200">
              {{ note.content }}
            </div>
            <div class="text-xs text-gray-600 dark:text-white">
              <RelativeDate :date="note.time" />
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue'
import { useVModels } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import { markAsReadMutationCount } from '@/user-notification/libs/markAsRead'
import { gql, useMutation, useQuery, useResult } from '@/graphql'
import type { Mutation, Query, schema } from '@/graphql'
import { openInNewTab } from '@/common/libs/link'
import { startProgress, stopProgress } from '@/nprogress'

const props = defineProps<{
  limit: number
  offset: number
  pageCount: schema.Maybe<number> | undefined
}>()

const emit = defineEmits<{
  (event: 'update:limit', value: number): void
  (event: 'update:offset', value: number): void
  (event: 'update:pageCount', value: number): void
}>()

const { t } = useI18n()

const noteType = ref('comment_reply')
const listAll = ref(true)
const { limit, offset, pageCount } = useVModels(props, emit)
const listNoteStatus = ref<'loading' | 'result' | 'error'>()
const listNote = ref<
(schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
  >([])
const listNoteCountAll = ref(0)
const listNoteCountUnread = ref(0)

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
              gravatar
            }
            time
            repliedObj
            repliedType
            content
          }
        }
        countAll
        countUnread
        pageCount
      }
    }
  `,
  {
    offset: offset.value * limit.value,
    limit: limit.value,
    listAll: listAll.value,
    noteType: noteType.value,
  },
  {
    notifyOnNetworkStatusChange: true,
  },
)
watchEffect(() => {
  if (loading.value) {
    listNoteStatus.value = 'loading'
    startProgress()
  }
  else {
    listNoteStatus.value = 'result'
    stopProgress()
  }
})

const listNotifications = useResult(result, null, data => data?.listNotifications)
watchEffect(() => {
  if (listNotifications.value) {
    listNote.value = listNotifications.value.notes
    listNoteCountAll.value = listNotifications.value.countAll
    listNoteCountUnread.value = listNotifications.value.countUnread
    pageCount.value = listNotifications.value.pageCount
  }
  else { listNoteStatus.value = 'error' }
})

const errMsg = ref('')
onError((err) => {
  errMsg.value = err.message
  listNoteStatus.value = 'error'
})

// Refresh query result for URL query change
watch(
  props,
  () => {
    fetchMore({
      variables: {
        offset: offset.value * limit.value,
        limit: limit.value,
        listAll: listAll.value,
        noteType: noteType.value,
      },
      updateQuery(previousQueryResult, { fetchMoreResult }) {
        if (!fetchMoreResult)
          return previousQueryResult
        return fetchMoreResult
      },
    })
  },
  { deep: true },
)

/* Mutation for notifications read */
const {
  mutate,
  loading: markAsReadLoading,
  onDone,
  onError: markAsReadError,
} = useMutation<Mutation>(
  gql`
    mutation ($markAll: Boolean, $noteType: String, $noteIds: [String!]) {
      markAsRead(para: { markAll: $markAll, noteType: $noteType, noteIds: $noteIds }) {
        empty
      }
    }
  `,
)
watchEffect(() => {
  if (markAsReadLoading.value)
    markAsReadMutationCount.value++
})
let isMarkAll = false
onDone(() => {
  markAsReadMutationCount.value--
  if (isMarkAll)
    location.reload()
})
markAsReadError(() => {
  markAsReadMutationCount.value--
})
function markAsRead(markAll = false, noteType = 'comment_reply', noteId: string[], noteIsRead = false): void {
  if (!listNoteCountUnread.value || noteIsRead)
    return
  isMarkAll = markAll
  mutate({ markAll, noteType, noteIds: noteId })
}
</script>
