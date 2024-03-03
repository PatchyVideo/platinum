<!-- Video card which shows meta message of the video, as well as some options -->
<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = withDefaults(defineProps<{
  video: schema.Video
  videoIndex?: number
  opType?: 'none' | 'video' | 'playlist' | 'playlistEditor'
  isAdmin?: boolean
  // Become horizontal to fit mobile view
  horizontal?: boolean
  responsive?: boolean
}>(), {
  videoIndex: 0,
  opType: 'none',
  isAdmin: false,
  horizontal: false,
  responsive: true,
})
const emit = defineEmits<{
  (event: 'refresh'): void
}>()

const { t } = useI18n()

const biliVideoPart = computed(() => {
  const url = new URL(props.video.item.url)
  const searchParams = new URLSearchParams(url.search)
  return Number(searchParams.get('p')) || 0
})

// If part needed to show (when partname is same as title, partname has no meaning, etc.)
const biliVideoPartNeeded = computed(() => props.video.item.partName && props.video.item.partName !== props.video.item.title && !props.video.item.partName?.match(/.mp4/))
</script>

<template>
  <div class="rounded-md relative min-w-48">
    <NuxtLink :to="`/video/${video.id}`" :class="{ 'grid grid-cols-3 gap-2': horizontal, 'md:grid-cols-none': responsive }">
      <div v-if="videoIndex" class="absolute left-0 top-0 z-1 h-7 w-7 md:w-10 md:h-10 grid place-items-center bg-black bg-opacity-50 text-lg text-white rounded-rb-md rounded-lt-md">
        {{ videoIndex }}
      </div>

      <VideoCover class="w-full rounded-md border border-gray-200 dark:border-gray-800" :video="video" />

      <div class="flex justify-between" :class="{ 'col-span-2': horizontal, 'md:col-auto': responsive }">
        <div>
          <div class="overflow-ellipsis transition transition-colors hover:text-purple-600" :class="biliVideoPart && biliVideoPartNeeded ? 'h-5 md:h-6 line-clamp-1' : 'h-10 md:h-12 line-clamp-2'">
            {{ video.item.title }}
          </div>

          <div
            v-if="biliVideoPart && biliVideoPartNeeded"
            class="h-6 leading-6 line-clamp-1 overflow-ellipsis text-xs text-gray-500"
            :title="video.item.partName || video.item.title"
          >
            {{ `P${biliVideoPart}: ${video.item.partName}` }}
          </div>

          <div class="flex items-center space-x-1 ">
            <VideoSiteImage class="m-px w-4 h-4" :url="video.item.url" />
            <DateRelative class="text-xs text-gray-500 dark:text-gray-300 font-light" :date="video.meta.createdAt" />
          </div>
        </div>

        <div v-if="opType !== 'none'" class="flex-none w-7" />
      </div>
    </NuxtLink>

    <div v-if="opType !== 'none'" class="absolute bottom-0 right-0">
      <VideoCardOps
        :video="video"
        :op-type="opType"
        :is-admin="props.isAdmin"
        @refresh="() => emit('refresh')"
      />
    </div>
  </div>
</template>
