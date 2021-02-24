<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <article class="prose break-all" :class="{ 'prose-sm': sm }" v-html="html"></article>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import ParserWorker from '../lib/parser.worker?worker'
import parser from '../lib/parser'

const worker = (() => {
  try {
    return new ParserWorker()
  } catch (_) {}
})()
const render = (text: string) =>
  new Promise<string>((resolve) => {
    try {
      if (!worker) throw 'noworker'
      const id = Math.random()
      const onMessage = (e: MessageEvent) => {
        if (e.data.id === id) {
          worker.removeEventListener('message', onMessage)
          resolve(e.data.text)
        }
      }
      worker.addEventListener('message', onMessage)
      worker.postMessage({ id, text })
    } catch (_) {
      resolve(parser.render(text))
    }
  })

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
    watch(
      () => props.text,
      () => {
        render(props.text).then((text) => (html.value = text))
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
