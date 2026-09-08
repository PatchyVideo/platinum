<script setup lang="ts">
const props = defineProps<{
  url: string
}>()

const domain = computed(() => new URL(props.url).hostname)
</script>

<template>
  <img
    :src="`https://cravatar.com/favicon/api/index.php?url=${domain}`"
    :alt="domain"
    class="inline-block object-cover overflow-hidden"
  >
</template>
