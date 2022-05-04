<template>
  <div v-if="pageCount - 1 && pageCount" class="xs:text-xs">
    <div class="border-t pt-1 flex-1 flex justify-between items-center">
      <a
        v-if="page !== 1"
        class="inline-flex items-center px-2 py-1 border border-purple-300 text-sm font-medium rounded-lg hover:text-gray-500 dark:bg-gray-600 dark:border-purple-900 dark:hover:bg-black md:px-4 md:py-2"
        @click="$emit('previous')"
        v-text="t('ui.pv-pagination.page-previous')"
      />
      <a
        v-else
        disabled
        class="inline-flex items-center px-2 py-1 border border-purple-300 text-sm font-medium rounded-lg dark:bg-gray-600 dark:border-purple-900 md:px-4 md:py-2"
        v-text="t('ui.pv-pagination.page-previous')"
      />
      <i18n-t keypath="ui.pv-pagination.page-number" tag="div" :places="{ count: pageCount }">
        <template #count>
          <input
            v-model.number="currentPage"
            class="w-12 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
            @keydown.enter="change"
            @blur="change"
          >
        </template>
        <template #total>
          <span>{{ pageCount }}</span>
        </template>
      </i18n-t>
      <a
        v-if="page !== pageCount"
        class="inline-flex items-center px-2 py-1 border border-purple-300 text-sm font-medium rounded-lg hover:text-gray-500 dark:bg-gray-600 dark:border-purple-900 dark:hover:bg-black md:px-4 md:py-2"
        @click="$emit('next')"
        v-text="t('ui.pv-pagination.page-next')"
      />
      <a
        v-else
        disabled
        class="inline-flex items-center px-2 py-1 border border-purple-300 text-sm font-medium rounded-lg dark:bg-gray-600 dark:border-purple-900 md:px-4 md:py-2"
        v-text="t('ui.pv-pagination.page-next')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref, watchEffect } from 'vue'
import { useVModel } from '@vueuse/core'
import { MessageType, PvMessage } from '../libs/PvMessage'

const props = withDefaults(
  defineProps<{
    page?: number
    pageCount?: number
  }>(),
  {
    page: 1,
    pageCount: 1,
  },
)
const emit = defineEmits<{
  (event: 'previous'): void
  (event: 'next'): void
  (event: 'change', value: number): void
  (event: 'update:page', value: number): void
  (event: 'update:pageCount', value: number): void
}>()
const { t } = useI18n()
const page = useVModel(props, 'page', emit)
const currentPage = ref(page.value)
function change(): void {
  if (
    // page must not be NaN-like
    isNaN(currentPage.value)
    // page must be a integer
    || !Number.isSafeInteger(currentPage.value)
    // page must be greater than 0
    || currentPage.value <= 0
    // page must be lesser than page count
    || currentPage.value > props.pageCount
  ) {
    PvMessage({ message: t('ui.pv-pagination.alert'), type: MessageType.warning })
    return
  }
  // change page only if currentPage really changed
  if (page.value !== currentPage.value) {
    page.value = currentPage.value
    emit('change', currentPage.value)
  }
}
watchEffect(() => {
  currentPage.value = page.value
})
</script>
