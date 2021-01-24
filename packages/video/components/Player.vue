<template>
  <div ref="root" class="w-full bg-gray-200" :style="{ height: height + 'px' }">Player {{ url }}</div>
</template>

<script lang="ts">
import { gql, parseGraph, schema } from '@/graphql'
import { computed, onMounted, onUnmounted, ref, defineComponent } from 'vue'

export const graph = parseGraph({
  graphRaw: gql`
    fragment default on VideoItem @export {
      url
    }
  `,
})

export default defineComponent({
  async setup() {
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

    const url = ref('')
    url.value = (
      await new Promise<schema.VideoItem>((resolve) => {
        graph.onFragmentData<schema.VideoItem>('default', resolve)
      })
    ).url

    console.log(url)

    return {
      url,
      root,
      width,
      height,
    }
  },
})
</script>

<style lang="postcss" scoped>
</style>
