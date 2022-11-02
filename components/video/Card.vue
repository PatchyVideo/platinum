<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  video: schema.Video
}>()
</script>

<template>
  <div class="relative">
    <NuxtLink :to="`/video/${video.id}`" class="rounded-md">
      <VideoCover
        :title="video.item.title"
        :cover-image="video.item.coverImage"
        class="rounded-md border border-gray-200 dark:border-gray-800"
      />

      <div class="flex justify-between">
        <div>
          <div class="h-12 overflow-hidden line-clamp-2 overflow-ellipsis">
            {{ video.item.title }}
          </div>
          <div class="text-sm truncate text-gray-600 dark:text-gray-300 font-light">
            <DateRelative :date="video.meta.createdAt" />&nbsp;
          </div>
        </div>

        <div class="flex-none w-7 h-7" />
      </div>
    </NuxtLink>

    <div class="absolute bottom-0 right-0">
      <PPopoverDown class="ml-1 my-1 -mr-1">
        <template #button>
          <div class="p-1 text-sm rounded-full text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 transition-color duration-75">
            <div class="i-uil:ellipsis-v w-5 h-5" />
          </div>
        </template>

        <div class="flex flex-col">
          <a
            class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
            target="_blank"
            rel="noreferrer noopener"
            :href="video.item.url"
          >
            <div class="i-uil:external-link-alt text-lg" />
            打开源站
          </a>

        <!-- <div class="w-full border-b-1 border-purple-200 border-dashed dark:border-gray-700" /> -->
        </div>
      </PPopoverDown>
    </div>
  </div>
</template>
