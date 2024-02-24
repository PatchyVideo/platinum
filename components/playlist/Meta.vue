<!-- Meta messages of playlist in playlist detail page -->
<script lang="ts" setup>
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  pid: string
  title: string
  private: boolean
  author?: schema.User
  tags: schema.TagObject[]
  rating?: schema.Rating
  cover: string
  desc: string
}>()
</script>

<template>
  <div class="w-full rounded-md md:rounded-none overflow-hidden relative grid grid-cols-1 md:grid-rows-1 md:grid-cols-3 text-gray-400">
    <div class="absolute z-1 top-2 left-2 md:left-auto p-1 md:p-3 bg-black bg-opacity-30 md:bg-opacity-0 text-white md:text-black text-lg md:text-4xl md:font-bold" :class="{ '-ml-2': title.startsWith('【') }">
      {{ title }}
    </div>

    <div class="relative aspect-ratio-3/1 md:aspect-ratio-16/9 md:order-last md:h-full">
      <img
        class="w-full h-full object-cover bg-gray-300 dark:bg-gray-600"
        :src="`https://patchyvideo.com/images/covers/${cover}`"
      >
      <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-light-200 to-transparent" />
    </div>

    <div class="text-sm md:col-span-2 bg-light-200 p-1 md:p-5 md:pt-18 flex flex-col gap-2">
      <UserMeta
        v-if="author"
        :id="author.id"
        :image="author.image"
        :gravatar="author.gravatar ?? undefined"
        status="上传者"
        :username="author.username"
        :desc="author.desc"
      />

      <div v-if="!tags.length">
        {{ '标签：暂无标签' }}
      </div>
      <div v-else>
        <ToolbarTag v-for="tag in tags" :key="tag.id" :tag="tag" class="my-0.5 mr-0.5" />
      </div>

      <ToolbarRank :rating="rating || null" />

      <MarkdownCommentBlock :text="desc" size="sm" class="order-first md:order-none" />
    </div>
  </div>
</template>
