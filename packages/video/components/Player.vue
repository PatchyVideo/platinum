<template>
  <div ref="root" class="w-full bg-gray-200" :style="{ height: height + 'px' }">Player {{ url }}</div>
</template>

<script lang="ts">
import { computed, onMounted, onUnmounted, ref, defineComponent } from 'vue'

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup() {
    const root = ref(HTMLHtmlElement.prototype)
    const width = ref(0)
    const height = computed(() => (width.value / 16) * 9)

    const onResize = (): void => {
      width.value = root.value.clientWidth
    }

    onMounted(() => {
      onResize()
      window.addEventListener('resize', onResize)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
    })

    return {
      root,
      width,
      height,
    }
  },
})
</script>

<style lang="postcss" scoped>
</style>
