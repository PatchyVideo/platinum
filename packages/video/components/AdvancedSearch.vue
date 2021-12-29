<template>
  <div
    class="fixed max-h-full z-50 transform transition-transform duration-300 inset-x-0 bottom-0 sm:right-0 sm:inset-y-0 sm:left-auto sm:p-2"
    :class="{ ' sm:translate-x-full translate-y-full sm:translate-y-0': !open }"
  >
    <div class="w-full h-full border border-gray-400 shadow p-1 overflow-auto rounded bg-white dark:bg-gray-900">
      <div class="w-full border-b p-1 pb-1.5 flex items-center flex-nowrap">
        <div class="i-uil-search text-2xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"></div>
        <div class="text-lg mr-30">{{ '高级搜索' }}</div>
      </div>
      <div class="mt-4 space-y-2">
        <!-- Tag only or text and tag -->
        <div></div>
        <!-- AND or OR -->
        <div></div>
        <!-- NOT -->
        <div></div>
        <!-- Site -->
        <div></div>
        <!-- Date -->
        <div></div>
        <!-- Tags number -->
        <div></div>
      </div>
    </div>
  </div>
  <!-- Mask -->
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="bg-opacity-0"
    leave-active-class="transition-all duration-200"
    leave-to-class="bg-opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-49" @click="open = false" @touchmove.stop.prevent></div>
  </Transition>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'

const { t } = useI18n()
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
    requred: true,
  },
})

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const open = useVModel(props, 'open', emit)
</script>
