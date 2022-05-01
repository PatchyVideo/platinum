<template>
  <div class="background absolute w-full h-full grid place-content-center bg-gray-800">
    <div class="my-auto text-white text-center">
      <div class="relative">
        <h1 class="sm:text-lg lg:text-2xl">
          {{ t('main.browser-offline') }}
        </h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useEventListener } from '@vueuse/core'
import { stopProgress } from '@/nprogress'

stopProgress()

const { t } = useI18n()

useEventListener('online', () => {
  window.location.reload()
})
</script>
