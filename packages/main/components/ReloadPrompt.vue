<template>
  <Transition :css="false" @leave="(_, done) => motion.leave(done)">
    <div
      v-if="needRefresh"
      ref="el"
      v-motion
      :initial="{ y: 100 }"
      :enter="{ y: 0 }"
      class="z-10000 fixed bottom-0 right-0 left-0 sm:bottom-4 sm:right-3 sm:left-auto px-3 py-2 sm:px-6 sm:py-4 rounded-md bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-800 shadow-lg"
    >
      <div class="font-light">
        {{ t('main.reload-prompt.tips') }}
      </div>
      <button class="font-light border-b border-blue-600 dark:border-blue-400" @click="() => updateServiceWorker()">
        {{ t('main.reload-prompt.reload') }}
      </button>
      <button class="font-light ml-2 border-b border-purple-600 dark:border-purple-400" @click="close">
        {{ t('main.reload-prompt.dismiss') }}
      </button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useMotion } from '@vueuse/motion'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { needRefresh, updateServiceWorker } = useRegisterSW()

const close = () => {
  needRefresh.value = false
}

const el = shallowRef<HTMLElement | null>(null)
const motion = useMotion(el, {
  initial: { y: 100 },
  enter: { y: 0 },
})
</script>
