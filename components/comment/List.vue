<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = defineProps<{
  tid: string
}>()

const { t } = useI18n()

const { data, refresh } = await useAsyncQuery<Query>(
  gql`
    query ($tid: String!) {
      getThread(para: { threadId: $tid }) {
        count
        comments {
          id
          content
          hidden
          deleted
          edited
          meta {
            createdAt
            createdBy {
              id
              username
              image
              gravatar
              desc
            }
          }
          children {
            id
            content
            hidden
            deleted
            edited
            meta {
              createdAt
              createdBy {
                id
                username
                image
                gravatar
                desc
              }
            }
          }
        }
      }
    }
  `,
  {
    tid: props.tid,
  },
)

const getThread = computed(() => data.value!.getThread)
</script>

<template>
  <div>
    <VideoDetailModuleTitle :text="`共 ${getThread.count} 条评论`" />
  </div>
</template>
