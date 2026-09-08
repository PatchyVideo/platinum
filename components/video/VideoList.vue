<!-- List video in video list page -->
<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  name?: string
  titleLinksTo?: RouteLocationRaw
  videos: schema.Video[]
  isAdmin: boolean
}>()
const emit = defineEmits<{
  (event: 'refresh'): void
}>()
</script>

<template>
  <div>
    <VideoGridTitle :name="name" :title-links-to="titleLinksTo" />

    <div class="grid md:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-5">
      <VideoCard
        v-for="video in videos" :key="video.id"
        :video="video"
        horizontal
        op-type="video"
        :is-admin="props.isAdmin"
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
