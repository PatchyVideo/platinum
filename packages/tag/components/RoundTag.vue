<template>
  <div
    class="inline-flex px-2.5 text-base flex-row items-center gap-1 whitespace-nowrap rounded-full border-1 border-gray-400 dark:border-gray-600"
  >
    <span class="inline-block w-2 h-2 rounded-full" :class="catogoryMap[tagComp.category]" />
    <span v-text="tagComp.name" />
    <button
      v-if="removeable"
      class="inline i-uil:times text-gray-600 dark:text-gray-400 hover:text-black"
      title="删除标签"
      @click="() => emit('remove')"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { schema } from '@/graphql'
import { behMostMatch } from '@/locales'

const props = defineProps<{
  tag: Pick<schema.TagObject, 'category' | 'languages'>
  removeable?: boolean
}>()
const emit = defineEmits<{
  (event: 'remove'): void
}>()

const tagComp = computed(() => {
  return {
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
