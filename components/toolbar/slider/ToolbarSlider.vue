<script lang="ts" setup>
const props = defineProps<{
  show: boolean
}>()
const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
}>()
const show = useVModel(props, 'show', emit)

const route = useRoute()

watchEffect(() => {
  if (route.path)
    show.value = false
})
</script>

<template>
  <div>
    <div
      class="fixed left-0 inset-y-0 max-w-100vw overflow-auto z-50 pl-4 pr-10 py-1 bg-white shadow border-r border-purple-200 rounded-r-lg transform transition-transform duration-300 flex flex-col gap-4 dark:border-gray-700 bg-white dark:bg-gray-900"
      :class=" { '-translate-x-full translate-y-0': !show }"
    >
      <ToolbarLogo v-model:show-slider="show" class="flex-grow-0" />

      <ToolbarSliderGeneralLinks />

      <ToolbarSliderDarkModeSwitch />
    </div>
    <PMask v-model:show="show" />
  </div>
</template>
