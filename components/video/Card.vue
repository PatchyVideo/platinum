<!-- Video card only with titlte, date and img -->
<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  video: schema.Video
}>()
const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="relative">
    <NuxtLink :to="`/video/${video.id}`" class="rounded-md">
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

        <div class="flex-none w-7 h-9" />
      </div>
    </NuxtLink>

    <div class="absolute bottom-0 right-0">
      <VideoCardOps
        :video="video"
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
