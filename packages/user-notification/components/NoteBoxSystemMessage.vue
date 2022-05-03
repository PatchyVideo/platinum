<template>
  <div class="border-b flex justify-between p-1">
    <div>{{ t('user-notification.notification-system.title') }}</div>
    <div
      class="text-sm cursor-pointer transition transition-colors hover:text-purple-300"
      :class="{ 'text-gray-500': !listNoteCountUnread }"
      @click="markAsRead(true, (noteType = 'system_message'), [])"
    >
      {{ t('user-notification.notification-system.mark-all-as-read') }}
    </div>
  </div>
  <div v-if="listNoteStatus === 'loading'">
    {{ t('user-notification.notification-system.loading') }}
  </div>
  <div v-else-if="listNoteStatus === 'error'" />
  <div v-else-if="listNoteCountAll === 0">
    {{ t('user-notification.notification-system.no-message') }}
  </div>
  <div v-else class="space-y-2">
    <div v-for="(note, index) in listNote" :key="note.id.toHexString()">
      <div
        v-if="note.__typename === 'SystemNotificationObject'"
        class="m-1 p-2 shadow rounded-md space-y-2"
        :class="{ 'bg-gray-100 dark:bg-gray-500': !listNoteRead[index] }"
      >
        <div>{{ note.title }}</div>
        <div class="relative overflow-hidden">
          <div
            class="transform transition-all duration-200 text-sm"
            :style="{ marginTop: note.id.toHexString() === listNoteOpenID ? '0' : '-100%' }"
          >
            {{ note.content }}
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-600 dark:text-white">
          <RelativeDate :date="note.time" />
          <div
            class="cursor-pointer text-purple-300"
            @click="markAsRead(false, note.type, [note.id.toHexString()], listNoteRead[index])"
          >
            {{
              note.id.toHexString() === listNoteOpenID
                ? t('user-notification.notification-system.fold')
                : t('user-notification.notification-system.unfold')
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue'
import { useVModels } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import { markAsReadMutationCount } from '@/user-notification/libs/markAsRead'
import { listNoteCountTypes } from '@/user-notification/libs/listNoteCountTypes'
import { gql, useMutation, useQuery, useResult } from '@/graphql'
import type { Mutation, Query, schema } from '@/graphql'
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

const noteType = ref('system_message')
const listAll = ref(true)
const { limit, offset, pageCount } = useVModels(props, emit)
const listNoteStatus = ref<'loading' | 'result' | 'error'>()
const listNote = ref<
(schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
  >([])
// Unknown bug: listNote.value canoot be changed, so use listNoteRead to present wether the note is read or not
const listNoteRead = ref<boolean[]>([])
const listNoteOpenID = ref<string>()
const listNoteCountAll = ref(0)
const listNoteCountUnread = ref(0)

const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int, $limit: Int, $listAll: Boolean, $noteType: String) {
      listNotifications(para: { offset: $offset, limit: $limit, listAll: $listAll, noteType: $noteType }) {
        notes {
          id
          read
          type
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
    listNoteRead.value = listNotifications.value.notes.map(item => item.read)
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
  listNoteCountTypes.value.systemMessage--
})
markAsReadError(() => {
  // console.log(error)
  markAsReadMutationCount.value--
})
function markAsRead(markAll = false, noteType2 = noteType.value, noteId: string[], noteIsRead = false): void {
  listNoteOpenID.value === noteId[0] ? (listNoteOpenID.value = undefined) : (listNoteOpenID.value = noteId[0])
  if (!listNoteCountUnread.value || noteIsRead)
    return
  if (noteId[0])
    listNoteRead.value[listNote.value.findIndex(note => note.id.toHexString() === noteId[0])] = true
  isMarkAll = markAll
  mutate({ markAll, noteType: noteType2, noteIds: noteId })
}
</script>
