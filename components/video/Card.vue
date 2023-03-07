<!-- Video card only with titlte, date and img -->
<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = withDefaults(defineProps<{
  video: schema.Video
  videoIndex?: number
  opType?: 'none' | 'playlist' | 'playlistEditor'
  // Become horizontal to fit mobile view
  horizontal?: boolean
}>(), {
  videoIndex: 0,
  opType: 'none',
  horizontal: false,
})
const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-md relative min-w-48">
    <NuxtLink :to="`/video/${video.id}`" :class="{ 'grid grid-cols-3 gap-2 md:grid-cols-none': horizontal }">
      <div v-if="videoIndex" class="absolute left-0 top-0 z-1 h-7 w-7 md:w-10 md:h-10 grid place-items-center bg-black bg-opacity-50 text-lg text-white rounded-rb-md rounded-lt-md">
        {{ videoIndex }}
      </div>

      <VideoCover class="w-full rounded-md border border-gray-200 dark:border-gray-800" :video="video" />

      <div class="flex justify-between" :class="{ 'col-span-2 md:col-auto': horizontal }">
        <div>
          <div class="h-12 overflow-hidden line-clamp-2 overflow-ellipsis transition transition-colors hover:text-purple-600">
            {{ video.item.title }}
          </div>

          <div class="text-xs truncate text-gray-500 dark:text-gray-300 font-light">
            <DateRelative :date="video.meta.createdAt" />
          </div>
        </div>

        <div v-if="opType !== 'none'" class="flex-none w-7" />
      </div>
    </NuxtLink>

    <div v-if="opType !== 'none'" class="absolute bottom-0 right-0">
      <VideoCardOps
        :video="video"
        :op-type="opType"
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
