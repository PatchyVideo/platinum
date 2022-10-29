<script lang="ts" setup>
defineProps<{
  rows: number
  cols: number
}>()
</script>

<template>
  <h4 class="text-xl w-64 rounded-md bg-gray-300 dark:bg-gray-700">
    &nbsp;
  </h4>
  <div
    class="grid mt-2 grid-flow-row gap-4"
    :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
  >
    <div v-for="index in rows * cols" :key="index" class="rounded-md">
      <VideoCoverPlaceholder class="rounded-md" />
      <div class="w-4/5 h-10 my-1 rounded-md bg-gray-300 dark:bg-gray-700">
        &nbsp;
      </div>
      <div class="w-3/5 text-sm rounded-md bg-gray-300 dark:bg-gray-700">
        &nbsp;
      </div>
    </div>
  </div>
</template>
