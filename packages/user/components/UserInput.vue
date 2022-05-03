<template>
  <div class="relative w-full">
    <template v-if="type === 'richText'">
      <textarea v-model="value" class="input input-rich w-full" rows="4" :placeholder="placeholder" />
    </template>
    <template v-else-if="type === 'singleLine'">
      <input v-model="value" class="input input-single w-full" :placeholder="placeholder">
      <div class="text-gray-300 absolute top-1/2 transform -translate-y-1/2 left-1">
        <slot name="prepend" />
      </div>
    </template>
    <template v-else-if="type === 'password'">
      <input v-model="value" class="input input-single w-full" type="password" :placeholder="placeholder">
      <div class="i-uil:padlock text-gray-300 absolute top-1/2 transform -translate-y-1/2 left-1" />
    </template>
    <template v-else-if="type === 'email'">
      <input v-model="value" class="input input-single w-full" type="email" :placeholder="placeholder">
      <div class="i-uil:envelope text-gray-300 absolute top-1/2 transform -translate-y-1/2 left-1" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useVModel } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    type?: 'richText' | 'singleLine' | 'password' | 'email'
    placeholder?: string
  }>(),
  {
    type: 'singleLine',
  },
)

const emit = defineEmits<{
  (event: 'update:value', value: string): void
}>()

const { t } = useI18n()

const value = useVModel(props, 'value', emit)

const placeholder = computed(() => props.placeholder ?? t('user.input.placeholder'))
</script>

<style lang="postcss" scoped>
.input {
  @apply border-purple-300 text-gray-500 dark:text-gray-200 border border-solid focus:outline-none bg-white dark:bg-opacity-5 rounded hover:border-purple-400 transition duration-300 focus:border-blue-300 placeholder-gray-300;
}
.input-single {
  @apply h-10 pl-7 pr-3 py-2;
}
.input-rich {
  @apply h-auto py-1 px-3;
}
</style>
