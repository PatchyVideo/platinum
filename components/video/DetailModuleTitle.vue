<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <div>
    <div class="border-t border-purple-100 lg:border-t-0 lg:border-b -mb-2 lg:mb-0 lg:text-lg lg:font-semibold">
      {{ props.text }}
    </div>
  </div>
</template>
