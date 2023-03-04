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
</script>

<template>
  <!-- eslint-disable-next-line -->
  <div class="inline-block px-2 border rounded-full" :class="catogoryMap[tagComp.category]">
    {{ tagComp.name }}
  </div>
</template>
