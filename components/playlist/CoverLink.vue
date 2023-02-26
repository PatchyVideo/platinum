<!-- Card shows cover of playlist and number of video contented, alse as a link -->
<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  titleLinksTo?: RouteLocationRaw
  videoNum: number
  cover: string
}>()
</script>

<template>
  <NuxtLink :to="titleLinksTo || '/playlist/5d3afaa2446f4e85bd7222ab'" class="relative inline-block flex-grow-0 flex-shrink-0 w-48 md:w-64">
    <div class="absolute left-0 bottom-15 bg-gray-300 rounded w-9/10 aspect-ratio-16/10" />
    <div class="absolute right-0 top-0 rounded w-9/10 aspect-ratio-16/10 border-l-4 border-b-4 border-white">
      <img
        class="w-full h-full object-cover rounded bg-gray-300 dark:bg-gray-600"
        :src="`https://patchyvideo.com/images/covers/${cover}`"
      >
      <div class="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
        {{ videoNum }}
      </div>
    </div>
  </NuxtLink>
</template>
