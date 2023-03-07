<!-- Video grid in playlist detail page -->
<script lang="ts" setup>
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  videos: schema.Video[]
  page: number
  limit: number
  editable: boolean
}>()
const emit = defineEmits<{
  (event: 'refresh'): void
}>()
</script>

<template>
  <div>
    <div class="grid md:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-5">
      <VideoCard
        v-for="(video, index) in videos" :key="video.id"
        :video="video"
        :video-index="((page - 1) * limit) + (index + 1)"
        :op-type="editable ? 'playlist' : 'playlistEditor'"
        horizontal
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
