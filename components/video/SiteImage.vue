<script setup lang="ts">
const props = defineProps<{
  url: string
}>()

const domain = computed(() => new URL(props.url).hostname)
</script>

<template>
  <img
    :src="`https://icons.duckduckgo.com/ip3/${domain}.ico`"
    :alt="domain"
    class="inline-block object-cover overflow-hidden"
  >
</template>
