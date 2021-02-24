<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <article class="prose" :class="{ 'prose-sm': sm }" v-html="html"></article>
</template>

<script lang="ts">
import { ObjectId } from 'bson'
import { defineComponent, inject, provide, ref, watch } from 'vue'

const _webworker = window.Worker
  ? import('../lib/parser.worker?worker').then((worker) => new worker.default() as Worker)
  : undefined
const _parser = !window.Worker ? import('../lib/parser') : undefined

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
    const render = () => {
      if (_webworker) {
        _webworker.then((worker) => {
          const onMessage = (e: MessageEvent) => {
            if (e.data.id === id) {
              worker.removeEventListener('message', onMessage)
              html.value = e.data.text
            }
          }
          worker.addEventListener('message', onMessage)
          worker.postMessage({ id, text: props.text })
          return worker
        })
      } else if (_parser) {
        _parser.then((parser) => {
          html.value = parser.default.render(props.text)
          return parser
        })
      }
    }
    watch(
      () => props.text,
      () => {
        render()
      },
      {
        immediate: true,
      }
    )
    return {
      html,
    }
  },
})
</script>

<style lang="postcss" scoped>
@import 'highlight.js/styles/atom-one-light.css';
.dark .prose {
  @apply prose-light;
}
</style>
