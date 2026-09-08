<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = defineProps<{
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
const getLeaderboard = computed(() => data.value!.getLeaderboard.items)
</script>

<template>
  <div>
    <LeaderboardContributorGrid v-for="(item, index) in getLeaderboard" :key="item.user.id" :item="item" :index="index + 1" />
  </div>
</template>
