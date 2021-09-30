<template>
  <div ref="el" class="w-full">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from '@vueuse/core'
import { useMotion } from '@vueuse/motion'
import { ref, watch } from 'vue'

const props = defineProps<{
  index: number
  drawerOpen: boolean
}>()

const el = ref<HTMLElement>()

const motion = useMotion(el, {
  enter: {
    opacity: 0.7,
    x: -20,
  },
})

const { drawerOpen, index } = toRefs(props)

watch(drawerOpen, (n, o) => {
  if (n) {
    motion.apply({
      opacity: 1,
      x: 0,
      transition: {
        delay: 100 + index.value * 20,
      },
    })
  } else {
    motion.apply('enter')
  }
})
</script>
