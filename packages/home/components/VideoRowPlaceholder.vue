<template>
  <h4 class="text-xl w-64 rounded-md bg-gray-300 dark:bg-gray-700">
&nbsp;
  </h4>
  <div
    class="grid mt-2 grid-flow-row gap-4"
    :style="{ gridTemplateColumns: `repeat(${count / (rows ?? 1)}, minmax(0, 1fr))` }"
  >
    <div v-for="index in count" :key="index" class="rounded-md">
      <CoverPlaceholder class="rounded-md" />
      <div class="w-4/5 h-4 mt-1 rounded-md bg-gray-300 dark:bg-gray-700">
&nbsp;
      </div>
      <div class="w-3/5 h-3.5 mt-1 rounded-md bg-gray-300 dark:bg-gray-700">
&nbsp;
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CoverPlaceholder from '@/video/components/CoverPlaceholder.vue'

defineProps<{
  count: number
  rows?: number
}>()
</script>
