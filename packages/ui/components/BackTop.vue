<template>
  <div
    class="fixed bottom-5 right-5 p-2 cursor-pointer select-none bg-gray-50 dark:bg-gray-800 shadow transition-opacity rounded-full"
    :class="{ 'opacity-50': !top }"
    :title="t('ui.back-top.back-top')"
    @click="backUp()"
  >
    <div class="i-uil:top-arrow-to-top text-3xl" />
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
  }, 10, true),
)

function backUp(): void {
  if (top.value > 0) {
    window.requestAnimationFrame(backUp)
    window.scrollTo(0, top.value - top.value / 5)
  }
}
</script>
