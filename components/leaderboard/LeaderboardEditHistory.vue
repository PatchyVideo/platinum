<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = defineProps<{
  page: number
  limit: number
}>()

const route = useRoute()

const { data } = await useAsyncQuery<Query>(
  gql`
    query ($offset: Int!, $limit: Int!) {
      getRawTagHistory(offset: $offset, limit: $limit) {
        items {
          time
          addedTags {
            id
            category
            languages {
              lang
              value
            }
          }
          removedTags {
            id
            category
            languages {
              lang
              value
            }
          }
          user {
            id
            username
            image
            gravatar
          }
          video {
            id
            clearence
            item {
              coverImage
              title
              site
              url
              partName
            }
          }
        }
      }
    }
  `,
  {
    offset: (props.page - 1) * props.limit,
    limit: props.limit,
  },
)
const getRawTagHistory = computed(() => data.value!.getRawTagHistory.items)

function updatePage(page: number) {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page } })
}
</script>

<template>
  <div>
    <LeaderboardEditHistoryGrid v-for="item in getRawTagHistory" :key="item.time" :item="item" />

    <PPagination
      class="mt-4"
      :page="page"
      :total="50"
      @update:page="updatePage"
    />
  </div>
</template>
