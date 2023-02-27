<!-- Video card only with titlte, date and img -->
<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  video: schema.Video
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLink :to="`/video/${video.id}`" class="inline-block min-w-48">
    <VideoCover class="w-full rounded-md border border-gray-200 dark:border-gray-800" :video="video" />

    <div class="flex justify-between items-end">
      <div>
        <div class="h-12 overflow-hidden line-clamp-2 overflow-ellipsis transition transition-colors hover:text-purple-600">
          {{ video.item.title }}
        </div>

        <div class="text-sm truncate text-gray-600 dark:text-gray-300 font-light">
          <DateRelative :date="video.meta.createdAt" />&nbsp;
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
