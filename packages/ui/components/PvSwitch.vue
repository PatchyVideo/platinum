<template>
  <Switch
    v-model="modelValue"
    class="focus:outline-none relative inline-flex flex-shrink-0 rounded-full shadow-inner border-1 border-transparent transition-colors duration-200 ease-in-out cursor-pointer focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-opacity-75"
    :class="{
      'h-5.5 w-10': size === 'sm',
      'w-12 h-6.5': size === 'md',
      'bg-purple-300 dark:bg-indigo-800': !modelValue,
      'bg-purple-400 dark:bg-indigo-600': modelValue,
    }"
  >
    <span
      class="inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out pointer-events-none"
      :class="{
        'w-5': size === 'sm',
        'w-6': size === 'md',
        'translate-x-4.5': modelValue && size === 'sm',
        'translate-x-5.5': modelValue && size === 'md',
      }"
    />
  </Switch>
</template>

<script lang="ts" setup>
import { Switch } from '@headlessui/vue'
import { useVModel } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    modelValue: boolean
  }>(),
  {
    size: 'md',
  },
)
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const modelValue = useVModel(props, 'modelValue', emit)
</script>
