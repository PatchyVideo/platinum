<script lang="ts" setup>
withDefaults(
  defineProps<{
    fetchNote?: boolean
  }>(),
  {
    fetchNote: true,
  },
)
</script>

<template>
  <div>
    <!-- Top Bar -->
    <ToolbarTop :fetch-note="fetchNote" />

    <!-- Top Bar Padding -->
    <div class="h-14" />
  </div>
</template>
