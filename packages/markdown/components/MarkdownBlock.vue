<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <article class="markdown-body" v-html="html"></article>
</template>

<script setup="props" lang="ts">
import { computed } from 'vue'
import parser from '../parser'

declare const props: {
  text: string
}

export const html = computed(() => parser.render(props.text))
</script>

<style lang="postcss" scoped>
@import '@primer/css-next/dist/markdown.css';
@import 'highlight.js/styles/atom-one-light.css';
</style>