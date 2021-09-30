<template>
  <div class="relative w-full">
    <template v-if="type === 'richText'">
      <textarea v-model="localValue" class="input input-rich w-full" rows="4" :placeholder="placeholder" />
    </template>
    <template v-else-if="type === 'singleLine'">
      <input v-model="localValue" class="input input-single w-full" :placeholder="placeholder" />
      <div class="text-gray-300 absolute top-1/2 transform -translate-y-1/2 left-1">
        <slot name="prepend" />
      </div>
    </template>
    <template v-else-if="type === 'password'">
      <input v-model="localValue" class="input input-single w-full" type="password" :placeholder="placeholder" />
      <div class="text-gray-300 absolute top-1/2 transform -translate-y-1/2 left-1">
        <icon-jam-padlock />
      </div>
    </template>
    <template v-else-if="type === 'email'">
      <input v-model="localValue" class="input input-single w-full" type="email" :placeholder="placeholder" />
      <div class="text-gray-300 absolute top-1/2 transform -translate-y-1/2 left-1">
        <icon-jam-envelope />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<'singleLine' | 'richText' | 'password' | 'email'>,
    default: 'singleLine',
  },
  placeholder: {
    type: String,
    default: '请输入内容',
  },
})

const emit = defineEmits<{
  (event: 'update:value', value: string): void
}>()

const localValue = useVModel(props, 'value', emit)
</script>

<style lang="postcss" scoped>
.input {
  @apply border-gray-300 text-gray-500 dark:text-gray-200 border border-solid focus:outline-none bg-white dark:bg-opacity-5 rounded hover:border-gray-400 transition duration-300 focus:border-blue-300 placeholder-gray-300;
}
.input-single {
  @apply h-10 pl-7 pr-3 py-2;
}
.input-rich {
  @apply h-auto py-1 px-3;
}
</style>
