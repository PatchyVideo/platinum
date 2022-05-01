<template>
  <div
    ref="NoteBox"
    class="z-50 absolute right-0 top-10 w-80 p-2 rounded overflow-hidden bg-white border border-gray-400 shadow overflow-visible dark:bg-gray-900 dark:border-black"
  >
    {{ t('user-notification.notification-navtop.title') }}
    <div v-if="listNoteStatus === 'loading'">
      {{ t('user-notification.notification-navtop.loading') }}
    </div>
    <div v-else-if="listNoteStatus === 'error'">
      {{ t('user-notification.notification-navtop.error', { error: errMsg }) }}
    </div>
    <div v-else-if="listNoteCountUnread === 0" class="divide-y-1">
      <div class="py-2">
        {{ t('user-notification.notification-navtop.no-message') }}
      </div>
      <RouterLink to="/user/notification" class="pt-1 text-center block">
        {{
          t('user-notification.notification-navtop.show-all')
        }}
      </RouterLink>
    </div>
    <div v-else>
      <div class="divide-y-2 max-h-110 overflow-auto">
        <div
          v-for="note in listNote"
          :key="note.id.id"
          class="hover:bg-gray-100 transition cursor-pointer dark:hover:bg-gray-500"
        >
          <div v-if="note.__typename === 'ReplyNotificationObject'" class="flex items-center space-x-2 p-2">
            <RouterLink class="w-1/6 cursor-pointer" :to="'/user/' + note.repliedBy.id.toHexString()">
              <UserAvatar
                :title="note.repliedBy.username"
                :image="note.repliedBy.image"
                :gravatar="note.repliedBy.gravatar"
                class="rounded-full ring-2 ring-white"
              />
            </RouterLink>
            <RouterLink
              v-slot="{ navigate }"
              :to="
                (note.repliedType === 'forum' ? '' : note.repliedType === 'video' ? '/video/' : '/playlist/') +
                  note.repliedObj
              "
              custom
            >
              <div
                class="w-5/6"
                @click="
                  () => {
                    markAsRead(note.type, [note.id.toHexString()])
                    navigate()
                  }
                "
              >
                <div>
                  {{ t('user-notification.notification-navtop.reply', { username: note.repliedBy.username }) }}
                </div>
                <div class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200">
                  {{ note.content }}
                </div>
                <div class="text-xs text-gray-600 text-right dark:text-white">
                  <RelativeDate :date="note.time" />
                </div>
              </div>
            </RouterLink>
          </div>
          <div v-else-if="note.__typename === 'SystemNotificationObject'" class="p-2">
            <RouterLink v-slot="{ navigate }" to="/user/notification?type=system_message" custom>
              <div class="flex items-center space-x-2" @click="navigate">
                <UserAvatar
                  :title="note.title"
                  current="packages/common/assets/systemNoitficationIcon.png"
                  class="w-1/6 rounded-full ring-2 ring-white"
                />
                <div class="w-5/6">
                  <div class="truncate">
                    {{ t('user-notification.notification-navtop.system', { title: note.title }) }}
                  </div>
                  <div class="text-xs bg-gray-100 text-gray-400 p-1 truncate dark:bg-gray-500 dark:text-gray-200">
                    {{ note.content }}
                  </div>
                  <div class="text-xs text-gray-600 text-right dark:text-white">
                    <RelativeDate :date="note.time" />
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
      <RouterLink to="/user/notification" class="pt-1 text-center block">
        {{
          t('user-notification.notification-navtop.show-all')
        }}
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { useVModel } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'
import { markAsReadMutationCount, markAsReadStatus } from '@/user-notification/lib/markAsRead'
import { gql, useMutation, useQuery, useResult } from '@/graphql'
import type { Mutation, Query, schema } from '@/graphql'
import { useUserData } from '@/user'

const { t } = useI18n()
const { isLogin } = useUserData()

const props = withDefaults(
  defineProps<{
    listNoteCountUnread?: number
  }>(),
  {
    listNoteCountUnread: 0,
  },
)
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
          type
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
    enabled: isLogin.value && markAsReadStatus.value !== 'loading',
    fetchPolicy: 'network-only',
  }),
)
watchEffect(() => {
  if (loading.value)
    listNoteStatus.value = 'loading'
  else
    listNoteStatus.value = 'result'
})
const listNotifications = useResult(result, null, data => data?.listNotifications)
watchEffect(() => {
  if (listNotifications.value) {
    listNote.value = listNotifications.value.notes
    listNoteCountUnread.value = listNotifications.value.countUnread
  }
  else { listNoteStatus.value = 'error' }
})
const errMsg = ref('')
onError((err) => {
  errMsg.value = err.message
  listNoteStatus.value = 'error'
})

/* Mutation for notifications read */
const {
  mutate,
  onDone,
  onError: markAsReadMutationError,
} = useMutation<Mutation>(
  gql`
    mutation ($markAll: Boolean, $noteType: String, $noteIds: [String!]) {
      markAsRead(para: { markAll: $markAll, noteType: $noteType, noteIds: $noteIds }) {
        empty
      }
    }
  `,
)
onDone(() => {
  markAsReadMutationCount.value--
})
markAsReadMutationError(() => {
  markAsReadMutationCount.value--
})
function markAsRead(noteType2: string, noteId: string[]): void {
  markAsReadMutationCount.value++
  mutate({ markAll: false, noteType: noteType2, noteIds: noteId })
}
</script>
