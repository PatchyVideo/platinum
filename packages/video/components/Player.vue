<template>
  <div ref="root" class="root relative w-full bg-black overflow-hidden" :style="{ height: height + 'px' }">
    <video
      ref="video"
      v-show="videoReady"
      class="video w-full h-full focus:outline-none"
      crossorigin="anonymous"
      playsinline
      preload="auto"
    ></video>
    <div
      v-show="videoReady"
      class="controlbar absolute transform translate-y-full bottom-0 left-0 right-0 bg-black bg-opacity-75 transition-all"
    >
      <div class="h-full m-0 align-middle">
        <div ref="progressbar" class="w-full h-1 bg-gray-600 transition-all ease-in-out">
          <div class="relative h-full left-0 bottom-0 bg-pink-600" :style="{ width: progress * 100 + '%' }">
            <span class="absolute right-0 top-0 w-3 h-3 -mt-1 -mr-1.5 bg-white rounded-full cursor-pointer"></span>
          </div>
        </div>
      </div>
      <div class="flex flex-row items-center h-6 mx-6 my-1 text-white">
        <span @click="onPlayPause"
          ><i v-if="playing" class="fas fa-fw fa-pause"></i><i v-else class="fas fa-fw fa-play"></i></span
        ><span class="px-1"></span>
        <div class="volume flex flex-row items-center">
          <i class="fas fa-fw fa-lg fa-volume-down"></i>
          <div class="h-full m-0 align-middle">
            <div ref="volumebar" class="volumebar w-0 h-1 bg-gray-600 transition-all ease-in-out">
              <div class="relative h-full left-0 bottom-0 bg-pink-600" :style="{ width: volume * 100 + '%' }">
                <span
                  class="volumedot absolute right-0 top-0 w-3 h-3 -mt-1 -mr-1.5 bg-white rounded-full transform scale-0 cursor-pointer"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!videoReady" class="absolute bottom-2 left-2 log overflow-y-scroll text-sm text-white">
      <p ref="logEl" class="whitespace-pre" v-text="logText"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { gql, parseGraph, schema } from '@/graphql'
import { notify } from '@/notification'
import { FetchResult } from '@apollo/client/core'
import { templateRef, useElementSize, useEventListener, useIntervalFn } from '@vueuse/core'
import { computed, ref, defineComponent, nextTick, onMounted, watch } from 'vue'

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
    const playing = ref(false)
    const onPlayPause = () => (playing.value = !playing.value)
    onMounted(() => {
      watch(playing, () => {
        try {
          playing.value ? video.value.play() : video.value.pause()
        } catch (_) {}
      })
    })
    const progressbar = templateRef<HTMLDivElement>('progressbar')
    const currentTime = ref(0)
    onMounted(() => {
      const { pause, resume } = useIntervalFn(
        () => {
          currentTime.value = video.value.currentTime
        },
        100,
        false
      )
      useEventListener(video.value, 'play', () => {
        resume()
      })
      useEventListener(video.value, 'pause', () => {
        pause()
      })
      useEventListener(progressbar.value, 'click', (e: MouseEvent) => {
        let percentage = (e.clientX - progressbar.value.getBoundingClientRect().left) / progressbar.value.clientWidth
        percentage = Math.max(0, Math.min(1, percentage))
        currentTime.value = video.value.currentTime = percentage * duration.value
      })
      useEventListener(progressbar.value, 'mousedown', (e: DragEvent) => {
        const stopMouseMove = useEventListener('mousemove', (e: DragEvent) => {
          let percentage = (e.clientX - progressbar.value.getBoundingClientRect().left) / progressbar.value.clientWidth
          percentage = Math.max(0, Math.min(1, percentage))
          currentTime.value = percentage * duration.value
        })
        const stopMouseUp = useEventListener('mouseup', (e: DragEvent) => {
          video.value.currentTime = currentTime.value
          stopMouseMove()
          stopMouseUp()
        })
      })
    })
    const duration = ref(0)
    onMounted(() => {
      useEventListener(video.value, 'durationchange', () => {
        duration.value = video.value.duration
      })
    })
    const progress = computed(() => currentTime.value / duration.value)
    const volume = ref(0.5)
    onMounted(() => {
      watch(volume, () => {
        video.value.volume = volume.value
      })
    })
    const volumebar = templateRef<HTMLDivElement>('volumebar')
    onMounted(() => {
      useEventListener(volumebar.value, 'click', (e: MouseEvent) => {
        let percentage = (e.clientX - volumebar.value.getBoundingClientRect().left) / volumebar.value.clientWidth
        percentage = Math.max(0, Math.min(1, percentage))
        volume.value = percentage
      })
      useEventListener(volumebar.value, 'mousedown', (e: DragEvent) => {
        const stopMouseMove = useEventListener('mousemove', (e: DragEvent) => {
          let percentage = (e.clientX - volumebar.value.getBoundingClientRect().left) / volumebar.value.clientWidth
          percentage = Math.max(0, Math.min(1, percentage))
          volume.value = percentage
        })
        const stopMouseUp = useEventListener('mouseup', (e: DragEvent) => {
          stopMouseMove()
          stopMouseUp()
        })
      })
    })
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
                                url: stream.src[0].replace(/^http:/, 'https:'),
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
      volume,
      playing,
      onPlayPause,
      currentTime,
      progress,
      duration,
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
.root:hover {
  .controlbar {
    @apply translate-y-0;
  }
}
.volume:hover {
  .volumebar {
    @apply w-16;
  }
  .volumedot {
    @apply scale-100;
  }
}
</style>
