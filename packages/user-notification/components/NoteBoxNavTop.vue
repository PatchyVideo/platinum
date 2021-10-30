<template>
  <div
    ref="NoteBox"
    class="
      z-[999]
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
    <div v-if="listNoteStatus === 'loading'">加载中</div>
    <div v-else-if="listNoteStatus === 'error'">{{ '加载出错了QAQ，错误原因：' + errMsg }}</div>
    <div v-else-if="listNoteCountUnread === 0">没有新消息哦</div>
    <div v-else>
      <div class="divide-y-2 max-h-110 overflow-auto">
        <div v-for="Note in listNote" :key="Note.id.id" class="hover:bg-gray-50 transition dark:hover:bg-gray-500">
          <div v-if="Note.__typename === 'ReplyNotificationObject'" class="flex items-center space-x-2 p-2">
            <router-link class="w-1/6 cursor-pointer" :to="'/user/' + Note.repliedBy.id.toHexString()">
              <UserAvatar
                :title="Note.repliedBy.username"
                :image="Note.repliedBy.image"
                :gravatar="Note.repliedBy.gravatar"
                class="rounded-full ring-2 ring-white"
              ></UserAvatar>
            </router-link>
            <router-link
              :to="
                (Note.repliedType === 'forum' ? '' : Note.repliedType === 'video' ? '/video/' : '/playlist/') +
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
              <UserAvatar :title="Note.title" class="w-1/6 rounded-full ring-2 ring-white"></UserAvatar>
              <div class="w-5/6">
                <div class="truncate">
                  {{ '系统通知：' + Note.title }}
                </div>
                <div class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200">
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
</template>

<script lang="ts" setup>
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import { isLogin, IsLogin } from '@/user'
import { markAsReadStatus } from '@/user-notification/lib/markAsRead'
import { useQuery, gql, useResult } from '@/graphql'
import { ref, watchEffect } from 'vue'
import { useVModel } from '@vueuse/core'
import type { schema, Query } from '@/graphql'

const props = defineProps({
  listNoteCountUnread: {
    type: Number,
    default: 0,
  },
})
const emit = defineEmits<{
  (event: 'update:listNoteCountUnread', value: number): void
}>()

const listNoteCountUnread = useVModel(props, 'listNoteCountUnread', emit)

const listNoteAll = ref<boolean>(false)
const listNote = ref<
  (schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
>([])
const listNoteStatus = ref<'loading' | 'result' | 'error'>()

/* Precess URL query */
const limit = ref(5)
const offset = ref(0)
const noteType = ref('all')
const { result, loading, onError } = useQuery<Query>(
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
        countUnread
      }
    }
  `,
  {
    offset: offset.value * limit.value,
    limit: limit.value,
    listAll: listNoteAll.value,
    noteType: noteType.value,
  },
  () => ({
    enabled: isLogin.value === IsLogin.yes && markAsReadStatus.value != 'loading',
  })
)
watchEffect(() => {
  if (loading.value) {
    listNoteStatus.value = 'loading'
  } else {
    listNoteStatus.value = 'result'
  }
})
const listNotifications = useResult(result, null, (data) => data?.listNotifications)
watchEffect(() => {
  if (listNotifications.value) {
    listNote.value = listNotifications.value.notes
    listNoteCountUnread.value = listNotifications.value.countUnread
  } else listNoteStatus.value = 'error'
})
const errMsg = ref('')
onError((err) => {
  errMsg.value = err.message
  listNoteStatus.value = 'error'
})
</script>
