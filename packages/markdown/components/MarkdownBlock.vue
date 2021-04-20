<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    class="prose break-all"
    :class="{ 'prose-sm': size === 'sm', 'prose-lg': size === 'lg', 'prose-xl': size === 'xl' }"
    v-html="html"
  ></article>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { asyncComputed } from '@vueuse/core'
import ParserWorker from '../lib/parser.worker?worker'
import parser from '../lib/parser'

const worker = (() => {
  try {
    const worker = new ParserWorker()
    worker.addEventListener('error', () => {
      isWorkerWorking.value = false
    })
    return worker
  } catch (_) {
    // ignore
  }
})()
let isWorkerWorking = ref(true)
const render = (text: string) =>
  new Promise<string>((resolve) => {
    try {
      if (!worker || !isWorkerWorking.value) throw 'noworker'
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
    size: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const html = asyncComputed(async () => {
      return await render(props.text)
    }, 'Parsing...')
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
