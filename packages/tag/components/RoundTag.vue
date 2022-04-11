<template>
  <div class="inline-flex px-2.5 text-base items-center gap-1 whitespace-nowrap rounded-full border-1 border-gray-400 dark:border-gray-600">
    <span class="inline-block w-2 h-2 rounded-full" :class="catogoryMap[tagComp.category]"></span>
    <span v-text="tagComp.name"></span>
  </div>
</template>

<script lang="ts" setup>
import type { schema } from '@/graphql'
import { behMostMatch } from '@/locales'
import { computed } from 'vue'

const props = defineProps<{
  tag: schema.TagObject
}>()

const tagComp = computed(() => {
  return {
    id: props.tag.id,
    category: props.tag.category.toLowerCase(),
    name: behMostMatch(props.tag.languages).replace(/_/g, ' '),
  }
})
const catogoryMap = {
  copyright: 'bg-copyright',
  language: 'bg-language',
  character: 'bg-character',
  author: 'bg-author',
  general: 'bg-general',
  meta: 'bg-meta',
  soundtrack: 'bg-soundtrack',
}
</script>
