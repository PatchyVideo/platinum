<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <article class="markdown-body" v-html="html"></article>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import parser from '../parser'

const props = defineProps<{
  text: string
}>()

const html = computed(() => parser.render(props.text))
</script>

<style lang="postcss" scoped>
@import '@primer/css-next/dist/markdown.css';
@import 'highlight.js/styles/atom-one-light.css';
</style>