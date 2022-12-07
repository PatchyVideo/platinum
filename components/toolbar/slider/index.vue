<script lang="ts" setup>
const props = defineProps<{
  show: boolean
}>()
const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
}>()
const show = useVModel(props, 'show', emit)
</script>

<template>
  <div
    class="fixed flex flex-col gap-4 max-w-100vw h-100vh z-50 pl-4 pr-10 py-1 bg-white rounded-r-lg shadow shadow-purple-600 transition duration-500 transition-all overflow-auto"
    :class="show ? 'left-0' : '-left-100'">
    <ToolbarLogo class="flex-grow-0" v-model:show-slider="show" />

    <ToolbarSliderGeneralLinks />
  </div>

  <PMask v-model:show="show" />
</template>
