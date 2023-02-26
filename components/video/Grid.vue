<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  rows: number
  name?: string
  titleLinksTo?: RouteLocationRaw
  videos: schema.Video[]
}>()
const emit = defineEmits<{
  (event: 'refresh'): void
}>()
</script>

<template>
  <div>
    <VideoGridTitle v-if="name" :name="name" :title-links-to="titleLinksTo" />

    <div class="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 justify-center gap-2 xl:gap-4">
      <VideoCard
        v-for="(video, index) in videos" :key="video.id"
        :video="video"
        :class="{
          'hidden md:block lg:hidden 2xl:block': index >= rows * 4 && index < rows * 5,
          'hidden md:block lg:hidden 3xl:block': index >= rows * 5,
        }"
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
