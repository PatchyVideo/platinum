<template>
  <div>{{ test }}</div>
  <button @click="test++">Click</button>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import { debouncedWatch } from '@vueuse/core'

const test = ref(0)
debouncedWatch(test, () => nextTick(() => console.log('hi')), { debounce: 500 })
</script>
