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
        before:(content
        absolute
        w-8
        inset-y-0
        left-0
        rounded-full
        bg-white
        shadow
        transform-gpu
        transition-all
        duration-200)
        checked:(bg-pink-300
        border-pink-200)
        checked:before:left-6
      "
      :class="{ 'h-6 w-12 before:(content w-6)': size === 'sm' }"
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
