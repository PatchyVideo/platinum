<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <article class="prose" :class="{ 'prose-sm': sm }" v-html="html"></article>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import ParserWorker from '../lib/parser.worker?worker&inline'

const worker = new ParserWorker()

export default defineComponent({
  props: {
    text: {
      type: String,
      default: '',
    },
    sm: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const html = ref('Parsing...')
    const id = Math.random()
    watch(
      () => props.text,
      () => {
        const onMessage = (e: MessageEvent) => {
          if (e.data.id === id) {
            worker.removeEventListener('message', onMessage)
            html.value = e.data.text
          }
        }
        worker.addEventListener('message', onMessage)
        worker.postMessage({ id, text: props.text })
      },
      { immediate: true }
    )
    return {
      html,
    }
  },
})
</script>

<style lang="postcss" scoped>
@import 'highlight.js/styles/atom-one-light.css';
</style>

<style lang="postcss">
.dark .prose {
  @apply prose-light;
}
</style>
