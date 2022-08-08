<template>
  <div class="background absolute w-full h-full grid place-content-center bg-gray-800">
    <div class="my-auto text-white text-center">
      <div class="relative">
        <h1 class="sm:text-xl lg:text-3xl" v-text="codeHint" />
        <span class="text-xs lg:text-base text-gray-200"><template v-if="fetching">Fetching
          <div class="i-uil:spinner inline animate-spin" /></template><template v-else>Last fetched at {{ last.toLocaleTimeString('en-US') }}</template></span>
      </div>
      <p class="mt-2 text-xs lg:text-sm text-left whitespace-pre text-gray-400" v-text="text" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useIntervalFn, useThrottleFn } from '@vueuse/core'
import { stopProgress } from '@/nprogress'

stopProgress()

const code = ref(0)
const text = ref('')

const codeHint = computed<string>(() => {
  switch (code.value) {
    case 502:
      return '巴瓦鲁魔法服务器正在跃迁中'
    case 500:
      return '巴瓦鲁魔法服务器哮喘犯了'
    case 503:
      return '巴瓦鲁魔法服务器正在睡觉'
    case 403:
      return '你被帕秋莉禁止进入巴瓦鲁魔法服务器'
    default:
      return '巴瓦鲁魔法服务器被隙间了'
  }
})

const fetching = ref(true)
const last = ref(new Date())
const setFetching = useThrottleFn((v: boolean) => {
  fetching.value = v
}, 600, true)

const refetch = async () => {
  last.value = new Date()
  setFetching(true)
  try {
    const res = await fetch('https://patchyvideo.com/be/alive.txt')
    if (res.ok) {
      window.location.reload()
      return
    }
    code.value = res.status
    text.value = res.statusText
  }
  catch (e) {
    code.value = 502
    text.value = e instanceof Error ? e.stack ?? e.message : String(e)
  }
  finally {
    setFetching(false)
  }
}

useIntervalFn(refetch, 5000)
refetch()
</script>
