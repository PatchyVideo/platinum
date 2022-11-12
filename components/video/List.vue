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

    <div class="flex flex-col gap-2 xl:gap-4">
      <VideoCardDetail
        v-for="video in videos" :key="video.id"
        :video="video"
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
