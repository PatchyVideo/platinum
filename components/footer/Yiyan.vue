<script lang="ts" setup>
import Typed from 'typed.js'

const typedEl = shallowRef<HTMLSpanElement | null>(null)

let typed: Typed | undefined
onMounted(() => {
  if (typedEl.value) {
    typed = new Typed(typedEl.value, {
      strings: useYiyanArray({
        short: true,
        random: true,
      }),
      typeSpeed: 30,
      backSpeed: 10,
      backDelay: 1600,
      loop: true,
      smartBackspace: false,
    })
  }
})
onUnmounted(() => {
  if (typed?.destroy)
    typed.destroy()
})
</script>

<template>
  <div class="text-center text-sm font-light font-sans whitespace-nowrap overflow-hidden">
    <span ref="typedEl" />
  </div>
</template>
