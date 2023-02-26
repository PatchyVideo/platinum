<!-- Video Card with full information -->
<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  video: schema.Video
}>()
const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const { t } = useI18n()

const biliVideoPart = computed(() => {
  const url = new URL(props.video.item.url)
  const searchParams = new URLSearchParams(url.search)
  return Number(searchParams.get('p')) || 0
})
</script>

<template>
  <div class="md:p-3 relative rounded-md md:max-w-64">
    <NuxtLink :to="`/video/${video.id}`" class="flex gap-2 md:flex-col">
      <VideoCover
        class="flex-none basis-1/3 w-full max-w-64 rounded-md border border-gray-200 dark:border-gray-800"
        :video="video"
      />

      <div class="flex flex-1 min-w-0 justify-between items-start md:px-3 md:pb-3">
        <div class="h-full min-w-0">
          <div class="sm:text-lg font-medium truncate" :class="{ '-ml-2': video.item.title.startsWith('【') }">
            {{ video.item.title }}
          </div>

          <div class="flex items-center gap-1">
            <VideoSiteImage class="m-px w-4 h-4" :url="video.item.url" />

            <div
              v-if="biliVideoPart"
              class="h-fit px-1 sm:px-1.5 text-xs sm:text-sm text-gray-700 border border-gray-300 rounded-full"
              :title="video.item.partName || video.item.title"
            >
              P{{ biliVideoPart }}
            </div>

            <div class="flex-1 min-w-0 text-sm text-gray-600 dark:text-gray-300 font-light">
              <DateRelative :date="video.meta.createdAt" />&nbsp;
            </div>
          </div>

          <div class="mt-2 text-sm text-gray-700 dark:text-gray-200 line-clamp-2 sm:line-clamp-3 md:mr-7">
            {{ video.item.desc.replace(/\s+/g, ' ') }}
          </div>
        </div>

        <div class="flex-none w-7 h-9 md:hidden" />
      </div>
    </NuxtLink>

    <div class="absolute top-0 md:top-auto md:bottom-5 right-0 md:right-3">
      <VideoCardOps :video="video" @refresh="() => emit('refresh')" />
    </div>
  </div>
</template>
