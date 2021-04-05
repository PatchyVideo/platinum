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
    const worker = new ParserWorker()
    worker.addEventListener('error', (e) => {
      isWorkerWorking = false
    })
    return worker
  } catch (_) {}
})()
let isWorkerWorking = true
const render = (text: string) =>
  new Promise<string>((resolve) => {
    try {
      if (!worker || !isWorkerWorking) throw 'noworker'
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
.prose {
  max-width: inherit;
}
.dark .prose :deep() {
  @apply text-gray-200;
  [class~='lead'] {
    @apply text-gray-100;
  }
  a {
    @apply text-white;
  }
  strong {
    @apply text-white;
  }
  ol > li::before {
    @apply text-gray-200;
  }
  ul > li::before {
    @apply bg-gray-600;
  }
  hr {
    @apply border-gray-200;
  }
  blockquote {
    @apply text-gray-50;
    border-left-color: theme('colors.gray.200');
  }
  h1,
  h2,
  h3,
  h4 {
    @apply text-white;
  }
  figure figcaption {
    @apply text-gray-200;
  }
  code {
    @apply text-white;
  }
  a code {
    @apply text-white;
  }
  pre {
    @apply text-gray-100 bg-gray-800;
  }
  thead {
    @apply text-white;
    border-bottom-color: theme('colors.gray.400');
  }
  tbody tr {
    border-bottom-color: theme('colors.gray.600');
  }
}
</style>
