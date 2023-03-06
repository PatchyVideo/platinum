<script lang="ts" setup>
import type { schema } from '~~/composables/graphql'

const props = defineProps<{
  tag: schema.TagObject
}>()

// TODO: support muti languages
const tagComp = computed(() => {
  return {
    category: props.tag.category.toLowerCase(),
    name: props.tag.languages.find(item => item.lang === 'CHS' || item.lang === 'JPN')?.value.replace(/_/g, ' ') || 'null',
  }
})
const catogoryMap: {
  [propName: string]: any
} = {
  copyright: 'bg-copyright',
  language: 'bg-language',
  character: 'bg-character',
  author: 'bg-author',
  general: 'bg-general',
  meta: 'bg-meta',
  soundtrack: 'bg-soundtrack',
}

// TODO: complete this
function search() {}
</script>

<template>
  <div class="inline-block px-2 border border-2 border-purple-200 rounded-full cursor-pointer" @click="search()">
    <div class="flex items-center space-x-1">
      <div class="w-1 h-1 rounded-full inline-block" :class="catogoryMap[tagComp.category]" />
      <div>{{ tagComp.name }}</div>
    </div>
  </div>
</template>
