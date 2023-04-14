<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  item: schema.RawTagHistoryItem
}>()

const addedTagsOpen = ref(false)
const removedTagsOpen = ref(false)
function openTagList(type: 'add' | 'remove') {
  if (type === 'add') {
    removedTagsOpen.value = false
    addedTagsOpen.value = !addedTagsOpen.value
  }
  if (type === 'remove') {
    addedTagsOpen.value = false
    removedTagsOpen.value = !removedTagsOpen.value
  }
}
</script>

<template>
  <div class="flex space-x-2 md:px-5 pb-4 md:mb-4 md:border-b-1 border-purple-200">
    <VideoCover :video="item.video" class="rounded-md w-1/3 md:w-1/8" />

    <div class="w-2/3 md:w-7/8 flex flex-col space-y-1">
      <div class="flex items-center space-x-2">
        <VideoSiteImage :url="item.video.item.url" class="w-5 h-5 flex-shrink-0" />
        <NuxtLink :to="`/video/${item.video.id}`" class="truncate font-bold">
          {{ item.video.item.title }}
        </NuxtLink>
      </div>

      <div class="flex flex-wrap items-center space-x-2 text-xs md:text-sm text-gray-300">
        <div class="flex items-center space-x-1">
          <div>编辑者:</div>
          <UserAvatar :gravatar="item.user.gravatar" :image="item.user.image" class="hidden md:inline-block w-6 h-6 rounded-full" />
          <NuxtLink v-if="item.user.id" :to="`/profile/${item.user.id}`" class="md:ml-1">
            {{ item.user.username }}
          </NuxtLink>
        </div>
        <DateRelative :date="item.time" />
      </div>

      <div class="flex flex-wrap space-x-2 md:hidden">
        <div
          v-if="item.addedTags.length"
          class="flex items-center space-x-0.5 bg-purple-100 text-purple-600 text-xs px-1 py-0.5 rounded-md"
          @click="openTagList('add')"
        >
          <div>{{ `添加${item.addedTags.length}个标签` }}</div>
          <div
            class="i-uil:angle-down w-5 h-5 transition-transform" :class="{ 'rotate-180': addedTagsOpen }"
          />
        </div>
        <div
          v-if="item.removedTags.length"
          class="flex items-center space-x-0.5 bg-purple-100 text-purple-600 text-xs px-1 py-0.5 rounded-md"
          @click="openTagList('remove')"
        >
          <div>{{ `删除${item.removedTags.length}个标签` }}</div>
          <div
            class="i-uil:angle-down w-5 h-5 transition-transform" :class="{ 'rotate-180': removedTagsOpen }"
          />
        </div>
      </div>

      <div class="relative md:space-y-1">
        <div
          v-if="item.addedTags.length"
          class="absolute z-51 top-0 md:static md:flex md:items-center md:flex-wrap p-1 md:p-0 md:space-x-2 text-gray-300 text-xs md:text-sm bg-white md:bg-opacity-0 rounded-md shadow md:shadow-none"
          :class="{ hidden: !addedTagsOpen }"
        >
          <div>添加标签:</div>
          <ToolbarTag v-for="addedTag in item.addedTags" :key="addedTag.id" :tag="addedTag" class="mr-1 mt-1 md:m-0" />
        </div>
        <div
          v-if="item.removedTags.length"
          class="absolute z-51 top-0 md:static md:flex md:items-center md:flex-wrap p-1 md:p-0 md:space-x-2 text-gray-300 text-xs md:text-sm bg-white md:bg-opacity-0 rounded-md shadow md:shadow-none"
          :class="{ hidden: !removedTagsOpen }"
        >
          <div>删除标签:</div>
          <ToolbarTag v-for="removedTag in item.removedTags" :key="removedTag.id" :tag="removedTag" class="mr-1 mt-1 md:m-0" />
        </div>
      </div>
    </div>
  </div>
</template>
