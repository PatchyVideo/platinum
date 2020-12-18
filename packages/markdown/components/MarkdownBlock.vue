<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <article class="markdown-body" v-html="html"></article>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import parser from '../parser'

export default defineComponent({
  props: {
    text: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const html = computed(() => parser.render(props.text))
    return {
      html,
    }
  },
})
</script>

<style lang="postcss" scoped>
@import '@primer/css/dist/markdown.css';
@import 'highlight.js/styles/atom-one-light.css';
</style>