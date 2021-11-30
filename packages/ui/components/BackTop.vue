<template>
  <div
    class="shadow fixed bottom-5 right-5 bg-gray-50 cursor-pointer select-none p-2 transition-opacity rounded-full dark:bg-gray-800"
    :class="{ 'opacity-50': !top }"
    :title="t('ui.back-top.back-top')"
    @click="backUp()"
  >
    <icon-uil-top-arrow-to-top class="text-2xl" />
  </div>
</template>

<script lang="ts" setup>
import { useEventListener, useThrottleFn } from '@vueuse/core'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const top = ref<number>(document.body.scrollTop || document.documentElement.scrollTop)

useEventListener(
  document,
  'scroll',
  useThrottleFn(() => {
    top.value = document.body.scrollTop || document.documentElement.scrollTop
  }, 10)
)

function backUp(): void {
  if (top.value > 0) {
    window.requestAnimationFrame(backUp)
    window.scrollTo(0, top.value - top.value / 5)
  }
}
</script>
