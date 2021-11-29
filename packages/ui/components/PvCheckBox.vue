<template>
  <div class="inline-block">
    <input
      :checked="check"
      class="appearance-none outline-none rounded-full border border-solid border-gray-300 bg-gray-50 shadow-inner bg-clip-content align-middle w-14 h-8 inline-block relative transform transition-colors ease-out duration-200 before:absolute before:w-8 before:inset-y-0 before:left-0 before:rounded-full before:bg-white before:shadow before:transform before:transition-all before:duration-200 checked:bg-pink-300 checked:border-pink-200 checked:before:left-6"
      :class="{ 'h-6.5 w-10.5 before:w-6 checked:before:left-4': size === 'sm' }"
      type="checkbox"
      @change="check = !check"
    />
  </div>
</template>

<script lang="ts" setup>
import { useVModel } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    check: boolean
  }>(),
  {
    size: 'md',
  }
)

const emit = defineEmits<{
  (event: 'update:check', value: boolean): void
}>()

const check = useVModel(props, 'check', emit)
</script>
