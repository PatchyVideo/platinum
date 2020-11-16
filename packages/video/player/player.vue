<template>
  <div ref="root" class="w-full bg-gray-200" :style="{ height: height + 'px' }">Player {{ url }}</div>
</template>

<script setup="props" lang="ts">
import { computed, onMounted, onUnmounted, Ref, ref } from 'vue'

declare const props: {
  url: string
}

export const url = ref(props.url)

export const root = (ref(null) as unknown) as Ref<HTMLHtmlElement>
export const width = ref(0)
export const height = computed(() => (width.value / 16) * 9)

export const onResize = (): void => {
  width.value = root.value.clientWidth
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="postcss" scoped>
</style>
