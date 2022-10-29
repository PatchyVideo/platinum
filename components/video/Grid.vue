<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import type { schema } from '@/composables/graphql'

defineProps<{
  rows: number
  cols: number
  name?: string
  titleLinksTo?: RouteLocationRaw
  videos: schema.Video[]
  videoShowTitle?: boolean
  videoShowDate?: boolean
}>()
</script>

<template>
  <div>
    <NuxtLink v-if="titleLinksTo" :to="titleLinksTo">
      <h4 class="title inline-block mb-2 text-xl">
        <span class="title-text">{{ name }}</span>
        <div
          class="title-arrow i-fluent:arrow-right-16-regular w-7 h-7 text-gray-600 dark:text-gray-300 transform opacity-25 transition-all duration-200"
        />
      </h4>
    </NuxtLink>
    <h4 v-else-if="name" class="inline-block mb-2 text-xl">
      {{ name }}
    </h4>

    <div
      class="grid grid-flow-row gap-4"
      :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
    >
      <NuxtLink
        v-for="video in videos"
        :key="video.id"
        :to="`/video/${video.id}`"
        class="rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-100"
      >
        <VideoCover
          :title="video.item.title"
          :cover-image="video.item.coverImage"
          class="rounded-md border border-gray-200 dark:border-gray-800"
        />
        <div
          v-if="videoShowTitle"
          class="w-full h-12 overflow-hidden line-clamp-2 overflow-ellipsis"
        >
          {{ video.item.title }}
        </div>
        <div v-if="videoShowDate" class="w-full text-sm truncate text-gray-600 dark:text-gray-300 font-light">
          <DateRelative :date="video.meta.createdAt" />&nbsp;
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.title {
  .title-text {
    display: inline-block;
    padding-bottom: 1px;
    background-image: linear-gradient(theme('colors.gray.300'), theme('colors.gray.300'));
    background-position: bottom left;
    background-size: 0% 1px;
    background-repeat: no-repeat;
    transition: background-size 140ms, background-position 0s 140ms;
  }
}

.title:hover {
  .title-text {
    background-position: bottom right;
    background-size: 100% 1px;
  }
  .title-arrow {
    /* TODO find a better way to do this */
    --un-translate-x: 0.25rem;
    opacity: 40%;
  }
}
</style>
