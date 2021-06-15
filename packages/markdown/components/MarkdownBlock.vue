<!-- eslint-disable vue/no-v-html -->
<template>
  <article
    class="prose break-all"
    :class="{ 'prose-sm': size === 'sm', 'prose-lg': size === 'lg', 'prose-xl': size === 'xl' }"
    v-html="html"
  ></article>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { render } from '../lib/parser'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
  },
})

const html = computed(() => render(props.text))
</script>

<style lang="postcss" scoped>
@import 'highlight.js/styles/github.css';
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
