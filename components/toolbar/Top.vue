<script lang="ts" setup>
const props = defineProps<{
  fetchNote: boolean
}>()

const route = useRoute()

const showSlider = ref(false)

const query = ref(pickFirstQuery(route.query.q) || '')
</script>

<template>
  <div class="z-49 fixed top-0 left-0 right-0 bg-white border border-b-2 border-gray-100 dark:border-gray-700 dark:bg-gray-900">
    <div class="flex px-2 lg:px-4 py-1 h-14 items-center">
      <!-- Start -->
      <ToolbarLogo v-model:show-slider="showSlider" />

      <!-- Center -->
      <div class="flex-auto max-w-xl min-w-0">
        <SearchCombo v-model:query="query" />
      </div>

      <!-- End -->
      <div class="flex-1 flex ml-auto pl-2 justify-end items-center">
        <ToolbarUser :fetch-note="props.fetchNote" class="mr-2" />
      </div>
    </div>
  </div>
  <ToolbarSlider v-model:show="showSlider" />
</template>
