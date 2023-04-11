<script lang="ts" setup>
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  index: number
  item: schema.LeaderboardResultItem
}>()
</script>

<template>
  <div class="flex justify-between items-center md:px-5 pb-4 md:mb-4 md:border-b-1 border-purple-200">
    <div class="w-1/10 aspect-ratio-1/1 relative flex justify-center items-top">
      <div class="absolute z-1 inset-0 flex justify-center items-center md:text-xl lg:text-5xl font-extrabold text-white">
        {{ index }}
      </div>
      <LeaderboardContributorLogoTop v-if="index <= 3" :color-type="index" />
      <LeaderboardContributorLogo v-else />
    </div>
    <UserAvatar
      class="w-1/6 md:w-1/10 rounded-full cursor-pointer"
      openable
      hide-title
      :alt="item.user.username"
      :image="item.user.image"
      :gravatar="item.user.gravatar"
    />
    <div class="w-2/3 flex justify-between md:items-center flex-col md:flex-row">
      <NuxtLink :to="`/profile/${item.user.id}`" class="md:w-1/6 lg:text-2xl text-gray-900 text-opacity-50 break-words" :class="{ 'font-bold': index <= 3, 'text-yellow-400': index === 1, 'text-gray-400': index === 2, 'text-orange-400': index === 3 }" :title="item.user.username">
        {{ item.user.username }}
      </NuxtLink>
      <div class="md:w-1/4 text-xs lg:text-xl text-gray-300 truncate md:line-clamp-3 md:overflow-ellipsis">
        {{ item.user.desc }}
      </div>
      <div class="md:w-45 lg:w-60 text-xs lg:text-2xl text-gray-900 text-opacity-50 break-words" :class="{ 'font-bold': index <= 3, 'text-yellow-400': index === 1, 'text-gray-400': index === 2, 'text-orange-400': index === 3 }">
        {{ `编辑次数: ${item.count}` }}
      </div>
    </div>
  </div>
</template>
