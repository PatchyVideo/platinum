<!-- Playlist-list root page -->
<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = defineProps<{
  showAutoPost: boolean
  dateRangeNumber: number
}>()

const { data } = await useAsyncQuery<Query>(
  gql`
    query ($dateRangeNumber: Int!) {
      getLeaderboard(hrs: $dateRangeNumber, k: 30) {
        items {
          count
          user {
            id
            username
            desc
            image
          }
        }
      }
    }
  `,
  {
    dateRangeNumber: props.dateRangeNumber,
  },
)
const getLeaderboard = computed(() => {
  if (props.showAutoPost)
    return data.value!.getLeaderboard.items
  else return data.value!.getLeaderboard.items.slice((data.value!.getLeaderboard.items.findIndex(item => item.user.id === '5e82074a0ff53a3a1acee0c0') + 1) || 0)
})
</script>

<template>
  <div>
    <LeaderboardContributorGrid v-for="(item, index) in getLeaderboard" :key="item.user.id" :item="item" :index="index + 1" />
  </div>
</template>
