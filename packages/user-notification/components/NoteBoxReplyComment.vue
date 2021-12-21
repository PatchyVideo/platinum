<template>
  <div class="border-b flex justify-between p-1">
    <div>回复我的</div>
    <div
      class="text-sm cursor-pointer"
      :class="{ 'text-gray-500': !listNoteCountUnread }"
      @click="markAsRead(true, (noteType = 'comment_reply'), [])"
    >
      全部标为已读
    </div>
  </div>
  <div v-if="listNoteStatus === 'loading'">加载中</div>
  <div v-else-if="listNoteStatus === 'error'"></div>
  <div v-else-if="listNoteCountAll == 0">您还没有收到过回复消息哦</div>
  <div v-else>
    <div v-for="note in listNote" :key="note.id.toHexString()">
      <div
        v-if="note.__typename === 'ReplyNotificationObject'"
        class="flex items-center m-1 p-2 shadow rounded-md"
        :class="{ 'bg-gray-100 dark:bg-gray-500': !note.read }"
      >
        <router-link class="w-1/6 md:w-1/15 mr-2 cursor-pointer" :to="'/user/' + note.repliedBy.id.toHexString()">
          <UserAvatar
            :title="note.repliedBy.username"
            :image="note.repliedBy.image"
            :gravatar="note.repliedBy.gravatar"
            class="rounded-full ring-2 ring-white"
          ></UserAvatar>
        </router-link>
        <router-link
          v-slot="{ href, navigate }"
          :to="
            (note.repliedType === 'forum' ? '' : note.repliedType === 'video' ? '/video/' : '/playlist/') +
            note.repliedObj +
            '#' +
            note.cid
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
              {{ note.repliedBy.username + ' 回复了你：' }}
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
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import { markAsReadMutationCount } from '@/user-notification/lib/markAsRead'
import { useQuery, useMutation, gql, useResult } from '@/graphql'
import { ref, watch, watchEffect } from 'vue'
import { useVModels } from '@vueuse/core'
import type { schema, Query, Mutation } from '@/graphql'
import NProgress from 'nprogress'
import { useI18n } from 'vue-i18n'
import { openInNewTab } from '@/common/lib/link'

const { t } = useI18n()

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

const noteType = ref('comment_reply')
const listAll = ref(true)
const { limit, offset, pageCount } = useVModels(props, emit)
const listNoteStatus = ref<'loading' | 'result' | 'error'>()
const listNote = ref<
  (schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
>([])
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
              gravatar
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

/* Mutation for notifications read */
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
  if (!listNoteCountUnread.value || noteIsRead) return
  mutate({ markAll: markAll, noteType: noteType, noteIds: noteId })
  if (markAll) location.reload
}
</script>
