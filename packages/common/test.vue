<template>
  <div>{{ test }}</div>
  <button @click="test++">Click</button>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

const test = ref(0)
watchDebounced(test, () => nextTick(() => console.log('hi')), { debounce: 500 })
</script>
