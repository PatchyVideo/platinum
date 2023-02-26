<!-- Title link for a single playlist -->
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  private?: boolean
  name?: string
  titleLinksTo?: RouteLocationRaw
  author?: string
  authorID?: string
}>()
</script>

<template>
  <div class="w-full md:flex md:items-center md:justify-between">
    <div class="flex items-center space-x-2">
      <span v-if="private" class="bg-purple-400 text-white text-xs rounded px-1 py-0.5">Private</span>
      <VideoGridTitle :name="name" :title-links-to="titleLinksTo" />
    </div>
    <div v-if="author" class="items-center space-x-2 hidden md:flex">
      <span class="bg-purple-400 text-white text-xs rounded px-1 py-0.5">上传者</span>
      <NuxtLink v-if="authorID" :to="`/profile/${authorID}`" class="text-sm">
        {{ author }}
      </NuxtLink>
      <div v-else class="text-sm">
        {{ author }}
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
</style>
