import { useQuery, gql, useResult } from '@/graphql'
import { ref, computed, watchEffect, getCurrentInstance } from 'vue'
import type { schema, Query } from '@/graphql'
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(getCurrentInstance())

const listNoteAll = ref<boolean>(true)
export const listNote = ref<
  (schema.ReplyNotificationObject | schema.BaseNotificationObject | schema.SystemNotificationObject)[]
>([])
export const listNoteCountAll = ref<number>(0)
export const listNoteCountUnread = ref<number>(0)
export const listNoteCountTypes = ref<schema.ListUnreadNotificationCountGqlResultItem[] | undefined>([])
export const pageCount = ref<schema.Maybe<number> | undefined>(0)
export const listNoteStatus = ref<'loading' | 'result' | 'error'>()

/* Precess URL query */
const limit = computed(() => {
  return Number(route.query.limit ? (Array.isArray(route.query.limit) ? route.query.limit[0] : route.query.limit) : 10)
})
const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
)
export const page = computed(() => offset.value + 1)
const noteType = computed(() => {
  return String(
    route.query.type ? (Array.isArray(route.query.type) ? route.query.type[0] : route.query.type) : 'comment_reply'
  )
})

export const { result, loading, onError, fetchMore } = useQuery<Query>(
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
  } else {
    listNoteStatus.value = 'result'
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

export function fetchNotifications(listAll = false): void {
  if (listAll) {
    listNoteAll.value = true
  } else {
    listNoteAll.value = false
  }
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
}
