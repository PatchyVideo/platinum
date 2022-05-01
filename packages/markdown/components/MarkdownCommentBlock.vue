<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="overflow-hidden">
    <div class="-my-24">
      <article
        ref="root"
        class="prose dark:prose-invert break-all my-24"
        :class="{ 'text-sm': size === 'sm', 'text-lg': size === 'lg', 'text-xl': size === 'xl' }"
        v-html="html"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, shallowRef, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { render } from '../libs/parserComment'

const props = withDefaults(
  defineProps<{
    text: string
    size?: string
  }>(),
  {
    size: '',
  },
)
const emit = defineEmits<{
  (event: 'htmlChanged'): void
}>()

const html = ref('')
const waitingForRender = ref(true)
watch(props, (p, op) => {
  if (p.text !== op.text)
    waitingForRender.value = true
})
const root = shallowRef<HTMLElement | null>(null)
useIntersectionObserver(
  root,
  ([{ isIntersecting }]) => {
    if (isIntersecting && waitingForRender.value) {
      html.value = render(props.text)
      nextTick(() => emit('htmlChanged'))
      waitingForRender.value = false
    }
  },
  { rootMargin: '400px 400px 400px 400px' },
)
</script>

<style lang="postcss" scoped>
@import 'highlight.js/styles/github.css';
.prose {
  max-width: inherit;
}
</style>
