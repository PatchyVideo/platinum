<script lang="ts" setup>
import type { schema } from '~~/composables/graphql'

const props = defineProps<{
  rating: schema.Rating | null
}>()
</script>

<template>
  <div>
    <div v-if="!rating">
      {{ '评分：暂无评分' }}
    </div>
    <div v-else>
      <div class="flex space-x-2 items-center">
        <slot />
        <div>{{ `评分：${rating.userRating || '暂无评分'} / ${rating.totalUser}评价` }}</div>
      </div>
    </div>
  </div>
</template>
