<!-- Single playlist display in playlist-list page -->
<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  name?: string
  titleLinksTo: RouteLocationRaw
  private?: boolean
  author?: schema.User
  videos: schema.Video[]
  cover: string
  count: number
}>()
</script>

<template>
  <div>
    <PlaylistGridTitle
      v-if="name" :name="name"
      :title-links-to="titleLinksTo"
      :private="private"
      :author="author"
    />

    <!-- This div makes mask⬇️ do not move -->
    <div class="relative">
      <div class="flex overflow-auto space-x-2 md:pb-5 px-2">
        <!-- This div is used to set the width of VideoCard -->
        <div v-for="video in videos" :key="video.id" class="flex-grow-0 flex-shrink-0 w-48 md:w-64">
          <VideoCard
            :video="video"
          />
        </div>

        <div class="flex-grow-0 flex-shrink-0 w-48 md:w-64">
          <PlaylistCoverLink :title-links-to="titleLinksTo" :count="count" :cover="cover" />
        </div>
      </div>

      <!-- Mask⬆️ for more video, "-1" position is adjusted for screen larger than 1920px, for mysterious no covering the video -->
      <div class="absolute bg-gradient-to-l from-light-100 to-transparent -right-1 -top-1 -bottom-1 w-30 md:w-50 pointer-events-none" />
    </div>
  </div>
</template>
