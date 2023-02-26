<!-- Overall arrangement for a single playlist in playlist-list page -->
<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  name?: string
  titleLinksTo?: RouteLocationRaw
  private?: boolean
  author?: string
  authorID?: string
  videos: schema.Video[]
  cover: string
  videoNum: number
}>()
</script>

<template>
  <div class="p-1">
    <PlaylistGridTitle
      :name="name"
      :title-links-to="titleLinksTo"
      :private="private"
      :author="author"
      :author-i-d="authorID"
    />

    <div class="relative">
      <div class="flex space-x-2 overflow-auto md:pb-3">
        <VideoCard
          v-for="video in videos"
          :key="video.id"
          :video="video"
        />
        <PlaylistCoverLink :title-links-to="titleLinksTo" :video-num="videoNum" :cover="cover" />
      </div>
      <div class="absolute bg-gradient-to-l from-light-100 to-transparent right-0 top-0 w-30 md:w-50 h-full pointer-events-none" />
    </div>
  </div>
</template>
