<template>
  <div class="background absolute w-full h-full grid place-content-center bg-gray-900">
    <div class="my-auto text-white text-center">
      <div class="relative">
        <h1 class="sm:text-lg lg:text-2xl">网络连接不可用，请检查网络设置</h1>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'

useEventListener('online', () => {
  window.location.reload()
})
</script>
