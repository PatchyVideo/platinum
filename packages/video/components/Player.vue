<template>
  <div ref="root" class="relative w-full bg-black" :style="{ height: height + 'px' }">
    <video class="w-full h-full" crossorigin="anonymous" playsinline preload="auto" :src="src"></video>
    <div v-if="!videoReady" class="absolute bottom-2 left-2 h-16 log overflow-y-scroll text-sm text-white">
      <p ref="logEl" class="whitespace-pre" v-text="log"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { gql, parseGraph, schema } from '@/graphql'
import { notify } from '@/notification'
import { FetchResult } from '@apollo/client/core'
import { computed, onMounted, onUnmounted, ref, defineComponent, watch } from 'vue'

type YouGetVideoData = YouGetGeneralVideoData | YouGetBilibiliVideoData
type YouGetBaseVideoData = {
  streams: YouGetVideoStreamData[]
}
type YouGetGeneralVideoData = YouGetBaseVideoData & {
  extractor: ''
}
type YouGetBilibiliVideoData = YouGetBaseVideoData & {
  extractor: 'BiliBili'
  extra: {
    cid: number
    danmaku: string
    duration_ms: number
  }
}
type YouGetVideoStreamData = {
  id: string
  container: string
  quality: string
  size: number
  src: string[]
}

export const graph = parseGraph({
  graphRaw: gql`
    fragment default on VideoItem @export {
      url
    }
  `,
})

console.log('hot17')

export default defineComponent({
  setup() {
    const root = ref(HTMLHtmlElement.prototype)
    const width = ref(0)
    const height = computed(() => (width.value / 16) * 9)
    const src = ref('')

    const log = ref('')
    const logEl = ref(HTMLHtmlElement.prototype)
    watch(log, () => {
      logEl.value.scroll({
        top: logEl.value.scrollHeight,
      })
    })
    const videoReady = ref(false)

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
    onMounted(() => {
      log.value += '正在获取视频信息……\n'
      graph.onFragmentData<schema.VideoItem>('default').then((data) => {
        url.value = data.url
        log.value += `视频URL：${url.value}\n`
        log.value += '正在解析视频地址……\n'
        fetch('http://localhost:4005/be/helper/get_video_stream', {
          method: 'POST',
          credentials: 'include',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            url: url.value,
          }),
        })
          .then((data) => data.json())
          .then((result: FetchResult<YouGetVideoData>) => {
            if (result.data) {
              switch (result.data.extractor) {
                case 'BiliBili': {
                  streams.value = result.data.streams
                  console.log(streams)
                  videoReady.value = true
                  break
                }
                default: {
                  log.value += '未知的视频源：' + result.data.extractor
                  break
                }
              }
            }
          })
          .catch((e: Error) => {
            notify('error', e.message, -1)
          })
      })
    })

    const streams = ref<YouGetVideoStreamData[]>([])

    return {
      url,
      log,
      streams,
      root,
      width,
      height,
      logEl,
      src,
      videoReady,
    }
  },
})
</script>

<style lang="postcss" scoped>
.log::-webkit-scrollbar {
  display: none;
  width: 0px;
  background: transparent;
}
</style>
