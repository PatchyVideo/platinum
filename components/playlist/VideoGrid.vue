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
const emit = defineEmits<{
  (event: 'refresh'): void
}>()
</script>

<template>
  <div>
    <PlaylistVideoGridTitle
      v-if="name" :name="name"
      :title-links-to="titleLinksTo"
      :private="private"
      :author="author"
    />

    <div class="grid grid-flow-row grid-cols-11 lg:grid-cols-15 2xl:grid-cols-19 3xl:grid-cols-23 justify-center gap-2 xl:gap-4">
      <VideoCard
        v-for="(video, index) in videos" :key="video.id"
        :video="video"
        class="col-span-4"
        :class="{
          'hidden lg:block': index === 2,
          'hidden 2xl:block': index === 3,
          'hidden 3xl:block': index === 4,
        }"
        @refresh="() => emit('refresh')"
      />

      <div class="col-span-3 overflow-hidden">
        <div class="w-4/3 h-full">
          <PlaylistCoverLink :title-links-to="titleLinksTo" :count="count" :cover="cover" />
        </div>
      </div>
    </div>
  </div>
</template>
