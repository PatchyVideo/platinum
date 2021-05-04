<template>
  <div ref="root" class="root relative w-full bg-black overflow-hidden" :style="{ height: height + 'px' }">
    <video
      v-show="videoElementReady && !useIframe"
      ref="video"
      class="video w-full h-full focus:outline-none"
      playsinline
      preload="auto"
    ></video>
    <audio v-show="false" ref="audio"></audio>
    <iframe
      v-if="useIframe && iframeUrl"
      title="Video Player"
      class="block w-full h-full"
      :src="iframeUrl"
      allow="fullscreen"
      sandbox="allow-scripts allow-popups-to-escape-sandbox allow-same-origin"
    ></iframe>
    <!-- top -->
    <div
      v-show="videoElementReady && !useIframe"
      class="absolute transform-gpu ease-in-out duration-300 top-0 left-0 right-0 bg-black bg-opacity-75 transition-all"
      :class="{ '-translate-y-3/2': !showSettings && !showControlBar && userClickedPlaying }"
    >
      <div class="mt-2 mx-2 flex justify-between">
        <div
          class="flex-nowrap text-white whitespace-nowrap overflow-hidden"
          :class="{ 'ml-2': !item.title.startsWith('【') }"
          v-text="item.title"
        ></div>
        <div @click="showSettings = true"><icon-uil-setting class="text-white text-xl" /></div>
      </div>
    </div>
    <!-- bottom -->
    <div
      v-show="videoElementReady && !useIframe"
      class="absolute transform-gpu ease-in-out duration-300 bottom-0 left-0 right-0 bg-black bg-opacity-75 transition-all"
      :class="{ 'translate-y-3/2': !showSettings && !showControlBar && userClickedPlaying }"
    >
      <div class="h-full m-0 align-middle">
        <div ref="progressbar" class="relative w-full h-1 bg-gray-600 transition-all ease-in-out">
          <div class="absolute h-full w-full overflow-hidden">
            <div v-if="hasAudioStream" class="h-1/2 w-full">
              <div
                v-for="(l, i) in videoLoadedRanges"
                :key="i"
                class="absolute h-1/2"
                :class="{ 'bg-orange-200': l.isBuffer }"
                :style="{ width: (l.end - l.start) * 100 + '%', left: l.start * 100 + '%' }"
              ></div>
            </div>
            <div v-if="hasAudioStream" class="h-1/2 w-full">
              <div
                v-for="(l, i) in audioLoadedRanges"
                :key="i"
                class="absolute h-1/2"
                :class="{ 'bg-purple-400': l.isBuffer }"
                :style="{ width: (l.end - l.start) * 100 + '%', left: l.start * 100 + '%' }"
              ></div>
            </div>
            <div v-else class="h-full w-full">
              <div
                v-for="(l, i) in videoLoadedRanges"
                :key="i"
                class="absolute h-full"
                :class="{ 'bg-orange-200': l.isBuffer }"
                :style="{ width: (l.end - l.start) * 100 + '%', left: l.start * 100 + '%' }"
              ></div>
            </div>
          </div>
          <div class="absolute h-full bg-pink-600" :style="{ width: progress * 100 + '%' }">
            <span class="absolute right-0 top-0 w-3 h-3 -mt-1 -mr-1.5 bg-white rounded-full cursor-pointer"></span>
          </div>
        </div>
      </div>
      <div class="flex flex-row items-center h-6 mx-6 my-1 text-white">
        <span class="text-xl" @click="onPlayPause"
          ><icon-uil-spinner-alt v-if="!streamsReady" class="animate-spin" /><icon-uil-pause
            v-else-if="playing" /><icon-uil-play v-else /></span
        ><span class="px-1"></span>
        <div class="volume flex flex-row items-center">
          <icon-uil-volume class="mr-0.5 text-xl" />
          <div class="inline-block h-full m-0 align-middle">
            <div ref="volumebar" class="volumebar w-0 h-1 bg-gray-600 rounded-full transition-all ease-in-out">
              <div
                class="relative h-full left-0 bottom-0 bg-pink-600 rounded-l-full"
                :style="{ width: volume * 100 + '%' }"
              >
                <span
                  class="volumedot absolute right-0 top-0 w-3 h-3 -mt-1 -mr-1.5 bg-white rounded-full transform-gpu scale-0 cursor-pointer"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- side -->
    <div
      v-show="videoElementReady && !useIframe && showSettings"
      class="absolute top-0 bottom-0 left-0 right-0"
      @click="showSettings = false"
    ></div>
    <div
      v-show="videoElementReady && !useIframe"
      class="absolute top-0 bottom-0 left-auto right-0 bg-black transform-gpu duration-300 ease-in-out transition-all overflow-hidden"
      :class="{ 'translate-x-full': !showSettings }"
    >
      <transition :name="transToParent ? 'setting-left' : 'setting-right'">
        <div :key="activeSettingsItemName" class="text-white w-72 overflow-x-hidden divide-y-1 divide-gray-600">
          <div class="px-2 pt-3 pb-2 font-medium">
            <icon-uil-arrow-left
              v-if="activeSettingsItem.parent && activeSettingsItem.parent in settings"
              class="absolute w-6 h-6 align-middle"
              @click="toSettingsParent"
            />
            <div class="text-center" v-text="activeSettingsItem.name ?? activeSettingsItemName"></div>
          </div>
          <div
            v-for="(item, index) in activeSettingsItem.items"
            :key="index"
            class="px-2 py-1 whitespace-pre hover:bg-gray-700 transform-gpu transition-all duration-100"
          >
            <div v-if="item.type === 'text'" :class="item.class" @click="item.onClick" v-text="item.text"></div>
            <div v-else-if="item.type === 'sub' && item.to in settings" @click="activeSettingsItemName = item.to">
              <div class="inline-block" v-text="item.text"></div>
              <div class="inline-block float-right">
                <span v-if="item.rightText" class="text-gray-300" v-text="item.rightText"></span
                ><icon-uil-arrow-right class="inline" />
              </div>
            </div>
            <div v-else-if="item.type === 'check'" class="flex justify-between">
              <span v-text="item.text"></span><PvCheckBox v-model:check="item.checked.value" size="sm" />
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div
      v-if="!videoElementReady && !useIframe"
      class="absolute bottom-2 left-2 log overflow-y-scroll text-sm text-white"
    >
      <p ref="logEl" class="whitespace-pre" v-text="logText"></p>
    </div>
  </div>
</template>

<script lang="ts">
import PvCheckBox from '@/ui/components/PvCheckBox.vue'
import { schema } from '@/graphql'
import { FetchResult } from '@apollo/client/core'
import {
  Fn,
  GeneralEventListener,
  templateRef,
  useElementSize,
  useEventListener,
  useLocalStorage,
  useTimeoutFn,
} from '@vueuse/core'
import { computed, ref, defineComponent, nextTick, onMounted, watch, PropType, Ref } from 'vue'

type VideoData = GeneralVideoData | BilibiliVideoData | YoutubeVideoData
type BaseVideoData = {
  streams: VideoStreamData[]
}
type GeneralVideoData = BaseVideoData & {
  extractor: ''
}
type BilibiliVideoData = BaseVideoData & {
  extractor: 'BiliBili'
  extra: {
    cid: number
    danmaku: string
    duration_ms: number
  }
}
type YoutubeVideoData = BaseVideoData & {
  extractor: 'Youtube'
  // eslint-disable-next-line @typescript-eslint/ban-types
  extra: {}
}
type VideoStreamData = {
  id: string
  container: string
  vcodec?: string
  acodec?: string
  quality: 'tiny' | '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | '2880p' | '4320p'
  size?: number
  tbr?: number
  src: string[]
}
type VideoStream = {
  id: string
  container: string
  vcodec?: string
  quality: '144p' | '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | '2880p' | '4320p'
  size?: number
  tbr?: number
  src: string[]
  audioStreams?: AudioStream[]
}
type AudioStream = {
  id: string
  container: string
  acodec?: string
  quality: 'tiny'
  size?: number
  tbr?: number
  src: string[]
}
type SettingMenu = {
  id: string
  name?: string
  parent?: string
  items: SettingItem[]
}
type SettingItem = SettingText | SettingSub | SettingsCheck
type SettingText = {
  type: 'text'
  class?: string[]
  text: string
  rightText?: string
  onClick?: GeneralEventListener<Event>
}
type SettingSub = {
  type: 'sub'
  to: string
  text: string
  rightText?: string
  onClick?: GeneralEventListener<Event>
}
type SettingsCheck = {
  type: 'check'
  text: string
  checked: Ref<boolean>
}

const qualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p', '2880p', '4320p'].reverse()
const formats = ['webm_dash', 'mp4_dash', 'flv']

export default defineComponent({
  components: {
    PvCheckBox,
  },
  props: {
    item: {
      type: Object as PropType<schema.VideoItem>,
      default: () => ({}),
    },
  },
  setup(props) {
    const root = templateRef('root')
    const { width } = useElementSize(root)
    const height = computed(() => (width.value / 16) * 9)

    const showControlBar = ref(true)
    onMounted(() => {
      let _stop: Fn
      useEventListener(root, 'mouseover', () => {
        if (_stop) _stop()
        showControlBar.value = true
      })
      useEventListener(root, 'mouseleave', () => {
        const { stop } = useTimeoutFn(
          () => {
            showControlBar.value = false
          },
          200,
          true
        )
        _stop = stop
      })
    })

    const showSettings = ref(false)

    const activeSettingsItemName = ref('default')
    const activeSettingsItem = computed(() => settings.value[activeSettingsItemName.value])
    const settings = computed<Record<string, SettingMenu>>(() => ({
      default: {
        id: 'default',
        name: '视频设置',
        items: [
          {
            type: 'sub',
            to: 'quality',
            text: '清晰度',
            rightText: streamQuality.value,
          },
          {
            type: 'check',
            text: '同步音频',
            checked: syncAudio,
          },
        ],
      },
      quality: {
        id: 'quality',
        name: '清晰度',
        parent: 'default',
        items: [
          ...(() => {
            const qualities: string[] = []
            streams.value.forEach((stream) => {
              if (!qualities.includes(stream.quality)) qualities.push(stream.quality)
            })
            return <SettingText[]>qualities.map((quality) => ({
              type: 'text',
              text: `${streamQuality.value === quality ? '·' : ' '} ${quality}`,
              onClick: () => playStream(quality),
            }))
          })(),
        ],
      },
    }))
    const transToParent = ref(false)
    watch(activeSettingsItemName, (n, o) => {
      transToParent.value = n === settings.value[o].parent
    })
    const toSettingsParent = () => {
      activeSettingsItemName.value = <string>activeSettingsItem.value.parent
    }

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
    const userClickedPlaying = ref(false)
    const onPlayPause = () => {
      if (!userClickedPlaying.value) userClickedPlaying.value = true
      playing.value = !playing.value
    }
    onMounted(() => {
      watch(playing, () => {
        try {
          if (video.value.currentTime === video.value.duration) {
            video.value.currentTime = 0
            audio.value.currentTime = 0
          }
          playing.value ? video.value.play() : video.value.pause()
        } catch (_) {
          //
        }
      })
      video.value.addEventListener('ended', () => {
        playing.value = false
      })
    })
    onMounted(() => {
      // for (const i of [
      //   'audioprocess',
      //   'canplay',
      //   'canplaythrough',
      //   'complete',
      //   'durationchange',
      //   'emptied',
      //   'ended',
      //   'loadeddata',
      //   'loadedmetadata',
      //   'pause',
      //   'play',
      //   'playing',
      //   'progress',
      //   'ratechange',
      //   'seeked',
      //   'seeking',
      //   'stalled',
      //   'suspend',
      //   'timeupdate',
      //   'volumechange',
      //   'waiting',
      // ]) {
      //   video.value.addEventListener(i, (e) => {
      //     console.log('video', i, e)
      //   })
      //   audio.value.addEventListener(i, (e) => {
      //     console.log('audio', i, e)
      //   })
      // }
      useEventListener(video.value, 'play', () => {
        if (hasAudioStream.value) {
          audio.value.currentTime = video.value.currentTime
          audio.value.play()
        }
      })
      useEventListener(video.value, 'pause', () => {
        if (hasAudioStream.value) {
          audio.value.currentTime = video.value.currentTime
          audio.value.pause()
        }
      })
    })
    const duration = ref(0)
    onMounted(() => {
      useEventListener(video.value, 'durationchange', () => {
        duration.value = video.value.duration
      })
    })
    const videoElementReady = ref(false)

    const audio = templateRef<HTMLAudioElement>('audio')
    onMounted(() => {
      useEventListener(audio.value, 'timeupdate', () => {
        if (!audio.value.paused && audioReady.value && (video.value.paused || !videoReady.value)) audio.value.pause()
      })
    })

    const audioReady = ref(false)
    const videoReady = ref(false)
    const streamsReady = computed(() => audioReady.value && videoReady.value)
    onMounted(() => {
      useEventListener(video.value, 'waiting', () => {
        videoReady.value = false
      })
      useEventListener(video.value, 'canplay', () => {
        videoReady.value = true
      })
      useEventListener(audio.value, 'waiting', () => {
        audioReady.value = false
      })
      useEventListener(audio.value, 'canplay', () => {
        audioReady.value = true
      })
    })

    const currentTime = ref(0)
    const videoLoadedAmount = ref<TimeRanges | null>(null)
    const videoLoadedRanges = computed(() => computeLoadedRanges(videoLoadedAmount.value))
    const audioLoadedAmount = ref<TimeRanges | null>(null)
    const audioLoadedRanges = computed(() => computeLoadedRanges(audioLoadedAmount.value))
    const computeLoadedRanges = (amount: TimeRanges | null) => {
      if (amount) {
        const ranges = []
        let last = 0
        for (let i = 0; i < amount.length; i++) {
          if (last < amount.start(i))
            ranges.push({
              isBuffer: false,
              start: last,
              end: amount.start(i),
            })
          ranges.push({
            isBuffer: true,
            start: amount.start(i),
            end: amount.end(i),
          })
          last = amount.end(i)
        }
        if (last < duration.value) {
          ranges.push({
            isBuffer: false,
            start: last,
            end: duration.value,
          })
        }
        return ranges.map((v) => ({
          isBuffer: v.isBuffer,
          start: v.start / duration.value,
          end: v.end / duration.value,
        }))
      } else {
        return [
          {
            isBuffer: false,
            start: 0,
            end: 1,
          },
        ]
      }
    }
    // watch(videoLoadedRanges, () => console.log(videoLoadedRanges.value))
    const progress = computed(() => currentTime.value / duration.value)
    const progressbar = templateRef<HTMLDivElement>('progressbar')
    const syncAudio = useLocalStorage('player_settings_sync_audio', false)
    onMounted(() => {
      useEventListener(video.value, 'timeupdate', () => {
        currentTime.value = video.value.currentTime
        if (hasAudioStream.value) {
          if (videoReady.value && audioReady.value) {
            // console.log(
            //   'diff',
            //   audio.value.currentTime,
            //   video.value.currentTime,
            //   audio.value.currentTime - video.value.currentTime
            // )
            if (syncAudio.value && Math.abs(audio.value.currentTime - currentTime.value) > 0.1) {
              audio.value.currentTime = video.value.currentTime + (audio.value.currentTime - currentTime.value)
              audio.value.play()
            }
            if (audio.value.paused && !video.value.paused) audio.value.play()
            if (!audio.value.paused && video.value.paused) audio.value.pause()
          } else {
            video.value.pause()
            watch(
              audioReady,
              () => {
                if (audioReady.value && playing.value) {
                  video.value.play()
                }
              },
              { flush: 'post' }
            )
          }
        }
        videoLoadedAmount.value = video.value.buffered
        audioLoadedAmount.value = audio.value.buffered
      })
      // useEventListener(video.value, 'progress', () => {
      //   videoLoadedAmount.value = video.value.buffered
      // })
      // useEventListener(audio.value, 'progress', () => {
      //   audioLoadedAmount.value = audio.value.buffered
      // })
      useEventListener(progressbar.value, 'click', (e: MouseEvent) => {
        let percentage = (e.clientX - progressbar.value.getBoundingClientRect().left) / progressbar.value.clientWidth
        percentage = Math.max(0, Math.min(1, percentage))
        currentTime.value = audio.value.currentTime = video.value.currentTime = percentage * duration.value
      })
      useEventListener(progressbar.value, 'mousedown', (e: DragEvent) => {
        const stopMouseMove = useEventListener('mousemove', (e: DragEvent) => {
          let percentage = (e.clientX - progressbar.value.getBoundingClientRect().left) / progressbar.value.clientWidth
          percentage = Math.max(0, Math.min(1, percentage))
          currentTime.value = percentage * duration.value
        })
        const stopMouseUp = useEventListener('mouseup', (e: DragEvent) => {
          stopMouseMove()
          stopMouseUp()
        })
      })
    })

    const volume = useLocalStorage('player_settings_volume', 0.5, { listenToStorageChanges: false })
    onMounted(() => {
      watch(
        volume,
        () => {
          video.value.volume = volume.value
          audio.value.volume = volume.value
        },
        { immediate: true }
      )
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

    const useIframe = ref(false)
    const iframeUrl = computed(() => {
      if (url.value) {
        let regBili = /(https:\/\/|http:\/\/)www.bilibili.com\/video\/av(\S+)\?p=(\S+)/
        let regNico = /(https:\/\/|http:\/\/)www.nicovideo.jp\/watch\/sm(\S+)/
        let regYtb = /(https:\/\/|http:\/\/)www.youtube.com\/watch\?v=(\S+)/
        let regAcf = /(https:\/\/|http:\/\/)www.acfun.cn\/v\/ac(\S+)/
        let r: RegExpExecArray | null
        if ((r = regBili.exec(url.value))) return `//player.bilibili.com/player.html?aid=${r[2]}&page=${r[3]}`
        if ((r = regNico.exec(url.value))) return `//embed.nicovideo.jp/watch/sm${r[2]}`
        if ((r = regYtb.exec(url.value))) return `https://www.youtube.com/embed/${r[2]}`
        if ((r = regAcf.exec(url.value)) !== null) return `https://www.acfun.cn/player/ac${r[2]}`
      }
      return ''
    })
    const enableIframe = () => {
      log('切换视频播放至内嵌')
      useIframe.value = true
    }

    const isContainerSupported = (container: string, codecs?: string, isAudio = false) => {
      if (['flv'].includes(container)) return true
      return window.MediaSource.isTypeSupported(getMIME(container, codecs, isAudio))
    }
    const getMIME = (container: string, codecs?: string, isAudio = false) =>
      `${isAudio ? 'audio' : 'video'}/${container.replace(/_dash$/, '')}${codecs ? `; codecs="${codecs}"` : ''}`
    const hasAudioStream = ref(false)
    const streamQuality = ref('')
    const playStream = (quality: string) => {
      streamQuality.value = quality
      if (video.value) {
        log('正在切换视频源\n')
        useIframe.value = false
        const stream =
          streams.value.filter((v) => v.quality === quality).find((s) => isContainerSupported(s.container, s.vcodec)) ??
          streams.value.find((s) => isContainerSupported(s.container, s.vcodec))
        if (!stream) {
          log('无可支持视频源\n')
          enableIframe()
          return
        }
        const audioStream = stream.audioStreams
          ? stream.audioStreams
              .sort((a, b) => formats.indexOf(a.container) - formats.indexOf(b.container))
              .sort((a, b) => (a.tbr ?? 0) - (b.tbr ?? 0))
              .reverse()
              .find((s) => isContainerSupported(s.container, s.acodec, true))
          : undefined
        if (stream.audioStreams && !audioStream) {
          log('无可支持音频源\n')
          enableIframe()
          return
        }
        console.log(stream, audioStream)
        try {
          switch (stream.container) {
            case 'flv': {
              log('正在载入flv.js\n')
              import('flv.js')
                .then((module) => {
                  const flvjs = module.default
                  log('正在创建flv解析器\n')
                  if ('createPlayer' in flvjs) {
                    const flvPlayer = flvjs.createPlayer({
                      type: 'flv',
                      url: stream.src[0].replace(/^http:/, 'https:'),
                    })
                    flvPlayer.attachMediaElement(video.value)
                    log('正在加载视频源\n')
                    flvPlayer.load()
                    flvPlayer.on('metadata_arrived', () => {
                      log('播放器加载完毕\n')
                      videoElementReady.value = true
                    })
                    hasAudioStream.value = false
                  }
                })
                .catch((e) => {
                  log('flv解析器创建失败\n' + e + '\n')
                  enableIframe()
                })
              break
            }
            case 'webm_dash':
            case 'mp4_dash': {
              log('正在加载视频源\n')
              video.value.src = stream.src[0]
              const onCanplay = () => {
                log('播放器加载完毕\n')
                videoElementReady.value = true
                video.value.removeEventListener('canplay', onCanplay)
              }
              video.value.addEventListener('canplay', onCanplay)
              if (stream.audioStreams) {
                audio.value.src = stream.audioStreams[0].src[0]
                audio.value.currentTime = video.value.currentTime
                audio.value.load()
                hasAudioStream.value = true
              }
              video.value.load()
              break
            }
          }
        } catch (e) {
          log('视频源解析失败\n' + e + '\n')
          enableIframe()
        }
      }
    }

    const url = ref('')
    onMounted(() => {
      watch(
        () => props.item.url,
        () => {
          if (!props.item.url) return
          log('正在获取视频信息\n')
          url.value = props.item.url
          log(`视频URL：${url.value}\n`)
          log('正在解析视频地址\n')
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
            .then((result: FetchResult<VideoData>) => {
              if (result.data) {
                console.log(result.data)
                switch (result.data.extractor) {
                  case 'BiliBili': {
                    streams.value = <VideoStream[]>result.data.streams
                    const stream = streams.value[0]
                    log(`视频源：BiliBili, 视频格式：${stream.container}, 视频清晰度：${stream.quality}\n`)
                    playStream(stream.quality)
                    break
                  }
                  case 'Youtube': {
                    let videoStreams: VideoStream[] = []
                    const audioStreams: AudioStream[] = []
                    result.data.streams.forEach((s) => {
                      if (s.quality === 'tiny') {
                        audioStreams.push(<AudioStream>s)
                      } else {
                        videoStreams.push(<VideoStream>s)
                      }
                    })
                    videoStreams = videoStreams
                      .map((v) => ({ ...v, audioStreams: audioStreams }))
                      .sort((a, b) => formats.indexOf(a.container) - formats.indexOf(b.container))
                      .sort((a, b) => qualities.indexOf(a.quality) - qualities.indexOf(b.quality))
                    streams.value = videoStreams
                    const stream = streams.value[0]
                    log(`视频源：Youtube, 视频格式：${stream.container}, 视频清晰度：${stream.quality}\n`)
                    console.log(streams)
                    playStream(stream.quality)
                    break
                  }
                  default: {
                    log('未知的视频源：' + result.data.extractor)
                    throw 'unknown extractor'
                  }
                }
              } else {
                throw 'no data'
              }
            })
            .catch(() => {
              enableIframe()
            })
        },
        {
          immediate: true,
        }
      )
    })

    const streams = ref<VideoStream[]>([])

    return {
      url,
      logText,
      streams,
      width,
      height,
      src,
      videoElementReady,
      volume,
      playing,
      onPlayPause,
      currentTime,
      progress,
      duration,
      useIframe,
      iframeUrl,
      videoLoadedRanges,
      audioLoadedRanges,
      hasAudioStream,
      showControlBar,
      userClickedPlaying,
      showSettings,
      settings,
      activeSettingsItemName,
      activeSettingsItem,
      transToParent,
      toSettingsParent,
      streamsReady,
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

.volume:hover {
  .volumebar {
    @apply w-16;
  }
  .volumedot {
    @apply scale-100;
  }
}

.setting-right-enter-active,
.setting-left-leave-active {
  @apply absolute top-0 transition-all duration-300 transform-gpu;
}
.setting-right-leave-active,
.setting-left-enter-active {
  @apply transition-all duration-300 transform-gpu;
}
.setting-right-leave-to,
.setting-left-enter-from {
  @apply -translate-x-full;
}
.setting-right-enter-from,
.setting-left-leave-to {
  @apply translate-x-full;
}
</style>
