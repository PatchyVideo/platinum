<script lang="ts" setup>
import type { Mutation, Query } from '@/composables/graphql'

const props = defineProps<{
  limit: number
  page: number
  noteType: 'comment_reply' | 'system_message' | 'at'
}>()

const { t } = useI18n()

const title = {
  comment_reply: t('user-notification.notification-reply.title'),
  system_message: t('user-notification.notification-system.title'),
  at: t('user-notification.notification.at'),
}
const noMessageTips = {
  comment_reply: t('user-notification.notification-reply.no-message'),
  system_message: t('user-notification.notification-system.no-message'),
  at: '您还没有被艾特过哦',
}

const listAll = ref(true)

// fetch unread messages
const { data } = await useAsyncQuery<Query>(
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
    offset: (props.page - 1) * props.limit,
    limit: props.limit,
    listAll: listAll.value,
    noteType: props.noteType,
  },
)
const listNotifications = computed(() => data.value!.listNotifications)

const { mutate } = useMutation<Mutation>(
  gql`
    mutation ($markAll: Boolean, $noteType: String, $noteIds: [String!]) {
      markAsRead(para: { markAll: $markAll, noteType: $noteType, noteIds: $noteIds }) {
        empty
      }
    }
  `,
)
function markAsRead(): void {
  mutate({ markAll: true, noteType: props.noteType, noteIds: [] })
}
markAsRead()
</script>

<template>
  <div>
    <div class="border-b flex justify-between p-1">
      <div>{{ title[noteType] }}</div>
    </div>
    <div>
      <div v-if="listNotifications.countAll === 0">
        {{ noMessageTips[noteType] }}
      </div>
      <div v-for="note in listNotifications.notes" v-else :key="note.id.toString()">
        <NotificationCardCommentReply v-if="note.__typename === 'ReplyNotificationObject'" :note="note" />
        <NotificationCardSystemMessage v-else-if="note.__typename === 'SystemNotificationObject'" :note="note" />
      </div>
    </div>
  </div>
</template>
