<template>
  <div ref="root" class="relative w-full bg-black" :style="{ height: height + 'px' }">
    <video
      ref="video"
      v-show="videoReady"
      controls
      class="w-full h-full focus:outline-none"
      crossorigin="anonymous"
      playsinline
      preload="auto"
    ></video>
    <div v-if="!videoReady" class="absolute bottom-2 left-2 log overflow-y-scroll text-sm text-white">
      <p ref="logEl" class="whitespace-pre" v-text="logText"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { gql, parseGraph, schema } from '@/graphql'
import { notify } from '@/notification'
import { FetchResult } from '@apollo/client/core'
import { templateRef, useElementSize } from '@vueuse/core'
import { computed, ref, defineComponent, nextTick, onMounted } from 'vue'

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

export default defineComponent({
  setup() {
    const root = templateRef('root')
    const { width } = useElementSize(root)
    const height = computed(() => (width.value / 16) * 9)

    const src = ref('')

    const logText = ref('')
    const logEl = templateRef('logEl')
    const log = (_log: string) => {
      console.log('[Player] > ' + _log)
      logText.value += _log
      nextTick(() => {
        if (logEl.value)
          logEl.value.scrollIntoView({
            block: 'end',
          })
      })
    }

    const video = templateRef<HTMLVideoElement>('video')
    const videoReady = ref(false)

    const url = ref('')
    onMounted(() => {
      log('正在获取视频信息……\n')
      graph.onFragmentData<schema.VideoItem>('default').then((data) => {
        url.value = data.url
        log(`视频URL：${url.value}\n`)
        log('正在解析视频地址……\n')
        fetch('https://patchyvideo.com/be/helper/get_video_stream', {
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
              console.log(result.data)
              switch (result.data.extractor) {
                case 'BiliBili': {
                  streams.value = result.data.streams
                  console.log(streams)
                  const stream = streams.value[0]
                  console.log(stream)
                  log(`视频源：BiliBili, 视频格式：${stream.container}, 视频清晰度：${stream.quality}\n`)

                  if (video.value) {
                    switch (stream.container) {
                      case 'flv': {
                        log('正在载入flv.js……\n')
                        import('flv.js').then((module) => {
                          const flvjs = module.default
                          log('正在创建flv解析器……\n')
                          if ('createPlayer' in flvjs) {
                            try {
                              const flvPlayer = flvjs.createPlayer({
                                type: 'flv',
                                url: stream.src[0],
                              })
                              flvPlayer.attachMediaElement(video.value)
                              log('正在加载视频源……\n')
                              flvPlayer.load()
                              flvPlayer.on('metadata_arrived', () => {
                                log('播放器加载完毕\n')
                                videoReady.value = true
                              })
                            } catch (e) {
                              log('flv解析器创建失败\n' + e + '\n')
                            }
                          }
                        })
                        break
                      }
                    }
                  }

                  console.log(video.value)
                  break
                }
                default: {
                  log('未知的视频源：' + result.data.extractor)
                  break
                }
              }
            }
          })
          .catch((e: Error) => {
            notify('error', e.message)
          })
      })
    })

    const streams = ref<YouGetVideoStreamData[]>([])

    return {
      url,
      logText,
      streams,
      width,
      height,
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
.log {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
