<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    ref="root"
    class="prose dark:prose-dark break-all"
    :class="{ 'prose-sm': size === 'sm', 'prose-lg': size === 'lg', 'prose-xl': size === 'xl' }"
    v-html="html"
  ></article>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { render } from '../lib/parser'

const props = withDefaults(
  defineProps<{
    text: string
    size?: string
  }>(),
  {
    size: '',
  }
)

const html = ref('')
const waitingForRender = ref(true)
watch(props, (p, op) => {
  if (p.text !== op.text) waitingForRender.value = true
})
const root = shallowRef<HTMLElement | null>(null)
useIntersectionObserver(
  root,
  ([{ isIntersecting }]) => {
    if (isIntersecting && waitingForRender.value) {
      html.value = render(props.text)
      waitingForRender.value = false
    }
  },
  { rootMargin: '400px 400px 400px 400px' }
)
</script>

<style lang="postcss" scoped>
@import 'highlight.js/styles/github.css';
.prose {
  max-width: inherit;
}
</style>
