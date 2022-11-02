<script lang="ts" setup>
const props = defineProps<{
  rows: number
}>()
</script>

<template>
  <h4 class="text-xl w-64 rounded-md bg-gray-300 dark:bg-gray-700">
    &nbsp;
  </h4>
  <div class="grid grid-flow-row grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 justify-center gap-2 xl:gap-4">
    <VideoCardPlaceholder
      v-for="index in rows * 6" :key="index"
      :class="{
        'hidden md:block lg:hidden 2xl:block': index >= rows * 4 && index < rows * 5,
        'hidden md:block lg:hidden 3xl:block': index >= rows * 5,
      }"
    />
  </div>
</template>
