<template>
  <div class="border-b flex justify-between p-1">
    <div>系统通知</div>
    <div class="text-sm" :class="{ 'text-gray-500': !listNoteCountUnread }">全部标为已读</div>
  </div>
  <div v-if="listNoteStatus === 'loading'">加载中</div>
  <div v-else-if="listNoteStatus === 'error'"></div>
  <div v-else-if="listNoteCountAll == 0">您还没有收到过回复消息哦</div>
  <div v-else class="space-y-2">
    <div v-for="note in listNote" :key="note.id.toHexString()">
      <div
        v-if="note.__typename === 'SystemNotificationObject'"
        class="m-1 p-2 shadow rounded-md space-y-2"
        :class="{ 'bg-gray-100 dark:bg-gray-500': !note.read }"
      >
        <div>{{ note.title }}</div>
        <div class="relative overflow-hidden">
          <div
            class="transform-gpu transition-all duration-200 text-sm"
            :style="{ marginTop: note.id.toHexString() === listNoteOpenID ? '0' : '-100%' }"
          >
            {{ note.content }}
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-600 dark:text-white">
          <RelativeDate :date="note.time" />
          <div
            class="cursor-pointer text-pink-300"
            @click="markAsRead(false, note.type, [note.id.toHexString()], note.read)"
          >
            {{ note.id.toHexString() === listNoteOpenID ? '折叠' : '展开' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import { markAsReadMutationCount } from '@/user-notification/lib/markAsRead'
import { useQuery, useMutation, gql, useResult } from '@/graphql'
import { ref, watch, watchEffect, defineProps, defineEmits } from 'vue'
import type { PropType } from 'vue'
import { useVModels } from '@vueuse/core'
import type { schema, Query, Mutation } from '@/graphql'
import NProgress from 'nprogress'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  limit: { type: Number, required: true },
  offset: { type: Number, required: true },
  pageCount: { type: Number as PropType<schema.Maybe<number> | undefined>, required: true },
})
const emit = defineEmits<{
  (event: 'update:limit', value: number): void
  (event: 'update:offset', value: number): void
  (event: 'update:pageCount', value: number): void
}>()

const noteType = ref('system_message')
const listAll = ref(true)
const { limit, offset, pageCount } = useVModels(props, emit)
const listNoteStatus = ref<'loading' | 'result' | 'error'>()
const listNote = ref<
  (schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
>([])
const listNoteOpenID = ref<string>()
const listNoteCountAll = ref(0)
const listNoteCountUnread = ref(0)

/* Refresh query result for URL query change */
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
    })?.then((v) => {
      result.value = v.data
    })
  },
  { deep: true }
)
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
    listNoteStatus.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    listNoteStatus.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})
const listNotifications = useResult(result, null, (data) => data?.listNotifications)
watchEffect(() => {
  if (listNotifications.value) {
    listNote.value = listNotifications.value.notes
    listNoteCountAll.value = listNotifications.value.countAll
    listNoteCountUnread.value = listNotifications.value.countUnread
    pageCount.value = listNotifications.value.pageCount
  } else listNoteStatus.value = 'error'
})
const errMsg = ref('')
onError((err) => {
  errMsg.value = err.message
  listNoteStatus.value = 'error'
})

const {
  mutate,
  loading: markAsReadLoading,
  onDone,
} = useMutation<Mutation>(
  gql`
    mutation ($markAll: Boolean, $noteType: String, $noteIds: [String!]) {
      markAsRead(para: { markAll: $markAll, noteType: $noteType, noteIds: $noteIds }) {
        empty
      }
    }
  `
)
watchEffect(() => {
  if (markAsReadLoading.value) markAsReadMutationCount.value++
})
onDone(() => {
  markAsReadMutationCount.value--
})
function markAsRead(markAll = false, noteType = 'comment_reply', noteId: string[], noteIsRead = false): void {
  listNoteOpenID.value === noteId[0] ? (listNoteOpenID.value = undefined) : (listNoteOpenID.value = noteId[0])
  if (!listNoteCountUnread.value || noteIsRead) return
  listNote.value[listNote.value.findIndex((note) => note.id.toHexString() === noteId[0])].read = true
  return
  mutate({ markAll: markAll, noteType: noteType, noteIds: noteId })
  if (markAll) location.reload
}
</script>