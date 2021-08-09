<template>
  <div class="inline-block">
    <input
      :checked="check"
      class="
        appearance-none
        outline-none
        rounded-full
        border border-solid border-gray-300
        bg-gray-50
        shadow-inner
        bg-clip-content
        align-middle
        w-14
        h-8
        inline-block
        relative
        transform-gpu
        transition-colors
        ease-out
        duration-200
        before:content
        before:absolute
        before:w-8
        before:inset-y-0
        before:left-0
        before:rounded-full
        before:bg-white
        before:shadow
        before:transform-gpu
        before:transition-all
        before:duration-200
        checked:bg-pink-300 checked:border-pink-200 checked:before:left-6
      "
      :class="{ 'h-6 w-12 before:content before:w-6': size === 'sm' }"
      type="checkbox"
      @change="check = !check"
    />
  </div>
</template>

<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'

const props = defineProps({
  size: {
    type: String as PropType<'sm' | 'md'>,
    default: 'md',
    validator: (value: string) => ['sm', 'md'].indexOf(value) !== -1,
  },
  check: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits<{
  (event: 'update:check', value: boolean): void
}>()

const check = useVModel(props, 'check', emit)
</script>
