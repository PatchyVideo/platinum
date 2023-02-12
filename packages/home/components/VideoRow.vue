<template>
  <RouterLink v-if="titleLinksTo" :to="titleLinksTo" target="_blank">
    <h4 class="title inline-block text-xl">
      <span class="title-text" v-text="name" />
      <div
        class="title-arrow i-uil:arrow-right inline-block w-8 h-8 align-top text-gray-600 dark:text-gray-300 transform -translate-x-1 opacity-25 transition-all duration-200"
      />
    </h4>
  </RouterLink>
  <h4 v-else class="inline-block text-xl" v-text="name" />
  <div
    class="grid mt-2 grid-flow-row gap-4"
    :style="{ gridTemplateColumns: `repeat(${count / (rows ?? 1)}, minmax(0, 1fr))` }"
  >
    <RouterLink
      v-for="video in videos.slice(0, count)"
      :key="video.id.toHexString()"
      :to="`/video/${video.id.toHexString()}`"
      target="_blank"
      class="rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-100"
    >
      <Cover
        :title="video.item.title"
        :cover-image="video.item.coverImage"
        class="rounded-md border border-gray-200 dark:border-gray-800"
      />
      <a
        v-if="videoShowTitle"
        class="w-full overflow-hidden line-clamp-2 overflow-ellipsis"
        v-text="video.item.title"
      />
      <div v-if="videoShowDate" class="w-full text-sm truncate text-gray-600 dark:text-gray-300 font-light">
        <Suspense><RelativeDate :date="video.meta.createdAt" /></Suspense>&nbsp;
      </div>
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import Cover from '@/video/components/Cover.vue'
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import type { schema } from '@/graphql'

defineProps<{
  name: string
  titleLinksTo?: RouteLocationRaw
  count: number
  rows?: number
  videos: schema.Video[]
  videoShowTitle?: boolean
  videoShowDate?: boolean
}>()
</script>

<style lang="postcss" scoped>
.title {
  .title-text {
    display: inline-block;
    padding-bottom: 1px;
    /* background-image: linear-gradient(theme('colors.gray.400'), theme('colors.gray.400')); */
    background-image: linear-gradient(#9ca3af, #9ca3af);
    background-position: bottom left;
    background-size: 0% 1px;
    background-repeat: no-repeat;
    transition: background-size 200ms, background-position 0s 200ms;
  }
}

.title:hover {
  .title-text {
    background-position: bottom right;
    background-size: 100% 1px;
  }
  .title-arrow {
    /* TODO find a better way to do this */
    --un-translate-x: 0;
    opacity: 40%;
  }
}
</style>
