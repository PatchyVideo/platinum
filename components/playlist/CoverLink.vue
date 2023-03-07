<!-- Card which shows cover of playlist and number of video contented, alse as a link -->
<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  titleLinksTo: RouteLocationRaw
  count: number
  cover: string
}>()
</script>

<template>
  <!-- NuxtLink has no non-absolute element, using "aspect-ratio-16/10" to fill it -->
  <NuxtLink :to="titleLinksTo" class="relative inline-block w-full min-w-48 aspect-ratio-16/10">
    <!-- Every absolute element use "aspect-ratio-16/10" to fill themselves -->
    <div class="absolute top-5 left-0 w-9/10 aspect-ratio-16/10 rounded bg-gray-300" />
    <div class="absolute top-0 right-0 w-9/10 aspect-ratio-16/10 object-cover rounded-md bg-gray-300 dark:bg-gray-600 border-l-4 border-b-4 border-white">
      <img
        class="w-full h-full object-cover rounded-md bg-gray-300 dark:bg-gray-600"
        :src="`https://patchyvideo.com/images/covers/${cover}`"
      >
      <div class="absolute inset-0 grid place-items-center text-white text-6xl font-bold bg-black bg-opacity-50">
        {{ count }}
      </div>
    </div>
  </NuxtLink>
</template>
