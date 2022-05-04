<template>
  <div class="fixed text-center min-w-70 md:min-w-100 top-0 right-0 z-10000">
    <transition-group name="notiList" tag="div">
      <div
        v-for="(noti, index) of notis"
        :key="index"
        class="border rounded-lg p-5 m-2 transition transition-all duration-200 " :class="{
          'border-blue-600 bg-blue-50': noti.type === 'info',
          'border-yellow-600 bg-yellow-50': noti.type === 'warn',
          'border-red-600 bg-red-50': noti.type === 'error',
        }"
      >
        {{ noti.message }}
      <!-- <span v-if="noti.endtime">({{ Math.round((+noti.endtime - now) / 100) / 10 }}s)</span> -->
      </div>
    </transition-group>
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
  if (interval)
    clearInterval(interval)
})
</script>

<style  lang="postcss" scoped>
.notiList-enter,
.notiList-leave-to {
  @apply opacity-0  -translate-x-2;
}
</style>
