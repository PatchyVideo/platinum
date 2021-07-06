<template>
  <div class="noti">
    <div
      v-for="(noti, index) of notis"
      :key="index"
      :class="{
        'w-72 h-16 border rounded-lg p-1 m-2': true,
        'border-blue-600 bg-blue-50': noti.type === 'info',
        'border-yellow-600 bg-yellow-50': noti.type === 'warn',
        'border-red-600 bg-red-50': noti.type === 'error',
      }"
    >
      {{ noti.message }}<span v-if="noti.endtime">({{ Math.round((+noti.endtime - now) / 100) / 10 }}s)</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { notis } from '../index'

const now = ref(Date.now())

let interval = 0
onMounted(() => {
  interval = window.setInterval(() => {
    now.value = Date.now()
  }, 100)
})
onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style lang="postcss" scoped>
.noti {
  @apply absolute top-0 right-0;
  z-index: 10000;
}
</style>
