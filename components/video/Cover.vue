<script lang="ts" setup>
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  video: schema.Video
}>()

const { t } = useI18n()
const filter = useThemeDarkCoverFilter()
</script>

<template>
  <div class="aspect-ratio-16/10 relative overflow-hidden">
    <img
      class="w-full h-full object-cover bg-gray-300 dark:bg-gray-600"
      :class="{ 'dark:filter dark:brightness-75': filter }"
      :alt="t('image.cover.alt', { title: video.item.title.slice(0, 40) })"
      :src="`https://patchyvideo.com/images/covers/${video.item.coverImage}`"
    >

    <div
      v-if="video.clearence === 0"
      class="absolute flex flex-col justify-center items-center inset-0 bg-gray-200 bg-opacity-60 hover:opacity-10 hover:bg-opacity-10 transition-all"
    >
      <div class="i-fluent:eye-off-20-regular text-6xl" />
      <div class="text-2xl">
        {{ t('search.search-result.video.video.hidden') }}
      </div>
    </div>
  </div>
</template>
