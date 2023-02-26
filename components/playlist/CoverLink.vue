<!-- Card shows cover of playlist and number of video contented, alse as a link -->
<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  titleLinksTo: RouteLocationRaw
  count: number
  cover: string
}>()
</script>

<template>
  <NuxtLink :to="titleLinksTo" class="relative">
    <img
      class="w-full object-cover rounded bg-gray-300 dark:bg-gray-600 aspect-ratio-16/10"
      :src="`https://patchyvideo.com/images/covers/${cover}`"
    >
    <div class="absolute -z-1 left-3 top-3 -bottom-3 -right-3 rounded bg-gray-300" />
    <div class="absolute inset-0 grid place-items-center text-white text-6xl font-bold">
      {{ count }}
    </div>
    <div class="absolute inset-0 bg-gradient-to-r from-transparent to-light-100" />
  </NuxtLink>
</template>
