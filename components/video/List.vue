<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  count: number
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
    <VideoGridTitle :name="name" :title-links-to="titleLinksTo" />

    <div class="flex flex-col md:flex-row md:justify-around md:flex-wrap">
      <VideoCardDetail
        v-for="video in videos" :key="video.id"
        :video="video"
        class="md:w-1/3 lg:w-1/4"
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
