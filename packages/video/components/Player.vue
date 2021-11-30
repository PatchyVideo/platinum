<template>
  <div
    ref="root"
    class="root relative w-full bg-black overflow-hidden"
    :class="{ 'h-full': fullHeight }"
    :style="{ height: fullHeight ? undefined : height + 'px' }"
  >
    <video
      v-show="videoElementReady && (usePlayer === 'video' || (usePlayer === 'canvas' && canvasTransparent))"
      ref="video"
      class="video w-full h-full focus:outline-none"
      playsinline
      preload="auto"
      :crossorigin="crossorigin ? '' : undefined"
    ></video>
    <audio v-show="false" ref="audio" :crossorigin="crossorigin ? '' : undefined"></audio>
    <iframe
      v-if="usePlayer === 'iframe' && iframeUrl"
      title="Video Player"
      class="block w-full h-full"
      :src="iframeUrl"
      allow="fullscreen"
      sandbox="allow-scripts allow-popups-to-escape-sandbox allow-same-origin"
    ></iframe>
    <canvas v-show="usePlayer === 'canvas'" ref="canvas" class="absolute top-0 w-full h-full"></canvas>
    <!-- top -->
    <div
      v-show="videoElementReady && !(usePlayer === 'iframe')"
      class="absolute top-0 left-0 right-0 bg-black bg-opcity-75 transform transition-all ease-in-out duration-300"
      :class="{ '-translate-y-3/2': !showSettings && !showControlBar && userClickedPlaying }"
    >
      <div class="m-2 flex justify-between">
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
      v-show="videoElementReady && !(usePlayer === 'iframe')"
      class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 transform transition-all ease-in-out duration-300"
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
      <div class="flex flex-row justify-between flex-nowrap h-6 mx-6 my-1 text-white overflow-hidden">
        <div class="flex-grow-0 flex flex-row items-center">
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
                    class="volumedot absolute right-0 top-0 w-3 h-3 -mt-1 -mr-1.5 bg-white rounded-full transform scale-0 cursor-pointer"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-grow-0">
          <span v-if="!disableFullscreen" class="text-xl" @click="onFullscreen"
            ><icon-uil-expand-arrows-alt v-if="!isFullscreen" /><icon-uil-compress-arrows v-else /></span
          ><span class="px-1"></span>
        </div>
      </div>
    </div>
    <!-- side -->
    <div
      v-show="videoElementReady && !(usePlayer === 'iframe') && showSettings"
      class="absolute top-0 bottom-0 left-0 right-0"
      @click="showSettings = false"
    ></div>
    <div
      v-show="videoElementReady && !(usePlayer === 'iframe')"
      class="absolute top-0 bottom-0 right-0 bg-black transform transition-all duration-300 ease-in-out overflow-hidden"
      :class="{ 'translate-x-full': !showSettings }"
    >
      <Transition
        :enter-active-class="
          transToParent
            ? 'transition-all duration-250 transform'
            : 'absolute top-0 transform transition-all duration-250'
        "
        :leave-active-class="
          transToParent
            ? 'absolute top-0 transform transition-all duration-250'
            : 'transition-all duration-250 transform'
        "
        :enter-from-class="transToParent ? '-translate-x-full' : 'translate-x-full'"
        :leave-to-class="transToParent ? 'translate-x-full' : '-translate-x-full'"
      >
        <div :key="activeSettingsItemName" class="text-white w-72 overflow-x-hidden divide-y-1 divide-gray-600">
          <div class="px-2 pt-3 pb-2 font-medium">
            <icon-uil-arrow-left
              v-if="activeSettingsItem.parent && activeSettingsItem.parent in settings"
              class="absolute w-6 h-6 align-middle"
              @click="toSettingsParent"
            />
            <div class="text-center select-none" v-text="activeSettingsItem.name ?? activeSettingsItemName"></div>
          </div>
          <div
            v-for="(settingsItem, index) in activeSettingsItem.items"
            :key="index"
            class="px-2 py-1 whitespace-pre transform transition-all ease-in-out duration-100"
            :class="{
              'hover:bg-gray-900 cursor-pointer':
                'onClick' in settingsItem || 'to' in settingsItem || settingsItem.type === 'check',
            }"
          >
            <div
              v-if="settingsItem.type === 'text'"
              :class="settingsItem.class"
              @click="settingsItem.onClick"
              v-text="settingsItem.text"
            ></div>
            <div
              v-else-if="settingsItem.type === 'sub' && settingsItem.to in settings"
              @click="activeSettingsItemName = settingsItem.to"
            >
              <div class="inline-block" v-text="settingsItem.text"></div>
              <div class="inline-block float-right">
                <span v-if="settingsItem.rightText" class="text-gray-300" v-text="settingsItem.rightText"></span
                ><icon-uil-arrow-right class="inline" />
              </div>
            </div>
            <div
              v-else-if="settingsItem.type === 'check'"
              class="flex justify-between"
              @click="settingsItem.checked.value = !settingsItem.checked.value"
            >
              <span v-text="settingsItem.text"></span><PvCheckBox :check="settingsItem.checked.value" size="sm" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <div
      v-if="!videoElementReady && !(usePlayer === 'iframe')"
      class="absolute bottom-2 left-2 log overflow-y-scroll text-sm text-white"
    >
      <p ref="logEl" class="whitespace-pre" v-text="logText"></p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PvCheckBox from '@/ui/components/PvCheckBox.vue'
import { computed, ref, nextTick, onMounted, watch, watchEffect, onUnmounted, shallowRef } from 'vue'
import {
  useElementBounding,
  useEventListener,
  useFullscreen,
  useIntervalFn,
  useLocalStorage,
  useRafFn,
  useThrottleFn,
  useTimeoutFn,
} from '@vueuse/core'
import type { Fn, GeneralEventListener } from '@vueuse/core'
import type { PropType, Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FetchResult } from '@apollo/client/core'
import { extensionTweaks } from '@/main/extension'
import type FlvJs from 'flv.js'

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
type VideoItem = {
  title: string
  url: string
  site: string
}

const qualities = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p', '2880p', '4320p'].reverse()
const formats = ['webm_dash', 'mp4_dash', 'flv']

const props = withDefaults(
  defineProps<{
    item: VideoItem
    fullHeight?: boolean
    disableFullscreen?: boolean
  }>(),
  {
    fullHeight: false,
    disableFullscreen: false,
  }
)

const { t } = useI18n()

const root = shallowRef<HTMLDivElement | null>(null)
const { width } = useElementBounding(root)
const height = computed(() =>
  video.value && video.value.videoWidth > 0 && video.value.videoHeight > 0
    ? (width.value / video.value.videoWidth) * video.value.videoHeight
    : (width.value / 16) * 9
)

const usePlayer = ref<'video' | 'iframe' | 'canvas'>('video')
const video = shallowRef<HTMLVideoElement | null>(null)

const videoHasCors = ref(false)
const crossorigin = computed(() => videoHasCors.value || extensionTweaks.value.includes('enable_cors_requests'))

/* control bar */
const showControlBar = ref(true)
let stopHideControlBar: Fn
const delayedHideControlBar = useThrottleFn((delay = 200) => {
  if (stopHideControlBar) stopHideControlBar()
  const { stop } = useTimeoutFn(
    () => {
      showControlBar.value = false
    },
    delay,
    { immediate: true }
  )
  stopHideControlBar = stop
})
useEventListener(root, 'mousemove', () => {
  if (stopHideControlBar) stopHideControlBar()
  showControlBar.value = true
  if (isFullscreen.value) delayedHideControlBar(800)
})
useEventListener(root, 'mouseleave', () => {
  delayedHideControlBar()
})

/* video settings */
const showSettings = ref(false)
const activeSettingsItemName = ref('default')
const activeSettingsItem = computed(() => settings.value[activeSettingsItemName.value])

const syncAudio = useLocalStorage('player_settings_sync_audio', false)
const useCanvas = ref(false)
const canvasTransparent = ref(false)

const settings = computed<Record<string, SettingMenu>>(() => ({
  default: {
    id: 'default',
    name: t('video.player.settings.default.name'),
    items: [
      {
        type: 'sub',
        to: 'quality',
        text: t('video.player.settings.default.items.quality'),
        rightText: streamQuality.value,
      },
      {
        type: 'check',
        text: t('video.player.settings.default.items.audio'),
        checked: syncAudio,
      },
      ...(() =>
        crossorigin.value
          ? ([
              {
                type: 'check',
                text: 'Canvas',
                checked: useCanvas,
              },
              {
                type: 'check',
                text: 'Canvas 透明',
                checked: canvasTransparent,
              },
            ] as SettingItem[])
          : [])(),
    ],
  },
  quality: {
    id: 'quality',
    name: t('video.player.settings.quality.name'),
    parent: 'default',
    items: [
      ...(() => {
        return currentStream.value
          ? ([
              {
                type: 'text',
                text: t('video.player.settings.quality.items.current-codec', {
                  container: currentStream.value.container.replace(/_dash$/, ''),
                  codec: currentStream.value.vcodec || 'unknown',
                }),
              },
            ] as [SettingText])
          : []
      })(),
      ...(() => {
        const qualities: string[] = []
        streams.value.forEach((stream) => {
          if (!qualities.includes(stream.quality)) qualities.push(stream.quality)
        })
        return qualities.map((quality) => ({
          type: 'text',
          text: `${streamQuality.value === quality ? '·' : ' '} ${quality}`,
          onClick: () => playStream(quality),
        })) as SettingText[]
      })(),
    ],
  },
}))
const transToParent = ref(false)
watch(activeSettingsItemName, (n, o) => {
  transToParent.value = n === settings.value[o].parent
})
const toSettingsParent = () => {
  activeSettingsItemName.value = activeSettingsItem.value.parent as string
}

/* loading log */
const logText = ref('')
const logEl = shallowRef<HTMLParagraphElement | null>(null)
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

/* play & pause */
const playing = ref(false)
const userClickedPlaying = ref(false)
const onPlayPause = () => {
  if (!userClickedPlaying.value) userClickedPlaying.value = true
  playing.value = !playing.value
}
const updatePlaying = () => {
  if (video.value && videoReady.value && (!hasAudioStream.value || (audio.value && audioReady.value))) {
    try {
      if (video.value.currentTime === video.value.duration) {
        video.value.currentTime = 0
        if (audio.value) audio.value.currentTime = 0
      }
      if (playing.value && video.value.paused) video.value.play()
      if (!playing.value && !video.value.paused) video.value.pause()
    } catch (_) {
      //
    }
  }
}
useIntervalFn(updatePlaying, 500)
watch(playing, updatePlaying)
useEventListener(video, 'ended', () => {
  playing.value = false
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
  useEventListener(video, 'play', () => {
    if (hasAudioStream.value && audio.value) {
      audio.value.currentTime = video.value!.currentTime
      audio.value.play()
    }
  })
  useEventListener(video, 'pause', () => {
    if (hasAudioStream.value && audio.value) {
      audio.value.currentTime = video.value!.currentTime
      audio.value.pause()
    }
  })
})
const duration = ref(0)
useEventListener(video, 'durationchange', () => {
  duration.value = video.value!.duration
})
const videoElementReady = ref(false)

/* dedicated audio track */
const audio = shallowRef<HTMLAudioElement | null>(null)
useEventListener(audio, 'timeupdate', () => {
  if (!audio.value!.paused && audioReady.value && (!video.value || !videoReady.value || video.value.paused))
    audio.value!.pause()
})

/* video ready state */
const audioReady = ref(false)
const videoReady = ref(false)
const streamsReady = computed(() => videoReady.value && (!hasAudioStream.value || audioReady.value))
let stopVideoWait: Fn | undefined
useEventListener(video, 'waiting', () => {
  const { stop } = useTimeoutFn(() => {
    videoReady.value = false
  }, 200)
  stopVideoWait = stop
})
useEventListener(video, 'canplay', () => {
  if (stopVideoWait) {
    stopVideoWait()
    stopVideoWait = undefined
  }
  videoReady.value = true
})
let stopAudioWait: Fn | undefined
useEventListener(audio, 'waiting', () => {
  const { stop } = useTimeoutFn(() => {
    audioReady.value = false
  }, 200)
  stopAudioWait = stop
})
useEventListener(audio, 'canplay', () => {
  if (stopAudioWait) {
    stopAudioWait()
    stopAudioWait = undefined
  }
  audioReady.value = true
})

/* progress bar */
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
const progressbar = shallowRef<HTMLDivElement | null>(null)
useEventListener(video, 'timeupdate', () => {
  currentTime.value = video.value!.currentTime
  if (hasAudioStream.value) {
    if (videoReady.value && audioReady.value) {
      // console.log(
      //   'diff',
      //   audio.value.currentTime,
      //   video.value.currentTime,
      //   audio.value.currentTime - video.value.currentTime
      // )
      if (audio.value && syncAudio.value && Math.abs(audio.value.currentTime - currentTime.value) > 0.1) {
        audio.value.currentTime = video.value!.currentTime + (audio.value.currentTime - currentTime.value)
        audio.value.play()
      }
      if (audio.value && audio.value.paused && !video.value!.paused) audio.value.play()
      if (audio.value && !audio.value.paused && video.value!.paused) audio.value.pause()
    } else {
      video.value!.pause()
      watch(
        audioReady,
        () => {
          if (audioReady.value && playing.value) {
            video.value!.play()
          }
        },
        { flush: 'post' }
      )
    }
  }
  if (video.value) videoLoadedAmount.value = video.value.buffered
  if (audio.value) audioLoadedAmount.value = audio.value.buffered
})
// useEventListener(video, 'progress', () => {
//   videoLoadedAmount.value = video.value.buffered
// })
// useEventListener(audio, 'progress', () => {
//   audioLoadedAmount.value = audio.value.buffered
// })
useEventListener(progressbar, 'click', (e: MouseEvent) => {
  let percentage = (e.clientX - progressbar.value!.getBoundingClientRect().left) / progressbar.value!.clientWidth
  percentage = Math.max(0, Math.min(1, percentage))
  currentTime.value = percentage * duration.value
  updateCurrentTime()
})
useEventListener(progressbar, 'mousedown', (e: DragEvent) => {
  const stopMouseMove = useEventListener('mousemove', (e: MouseEvent) => {
    let percentage = (e.clientX - progressbar.value!.getBoundingClientRect().left) / progressbar.value!.clientWidth
    percentage = Math.max(0, Math.min(1, percentage))
    currentTime.value = percentage * duration.value
  })
  const stopMouseUp = useEventListener('mouseup', (e: MouseEvent) => {
    stopMouseMove()
    stopMouseUp()
    updateCurrentTime()
  })
})
const updateCurrentTime = () => {
  if (video.value) video.value.currentTime = currentTime.value
  if (audio.value) audio.value.currentTime = currentTime.value
}

/* volume bar */
const volume = useLocalStorage('player_settings_volume', 0.5, { listenToStorageChanges: false })
const keepElementVolume = ref(false)
watch([volume, video, audio, keepElementVolume], () => {
  let target = volume.value
  if (keepElementVolume.value) target = 1
  if (video.value && video.value.volume !== target) video.value.volume = target
  if (audio.value && audio.value.volume !== target) audio.value.volume = target
})
const volumebar = shallowRef<HTMLDivElement | null>(null)
useEventListener(volumebar, 'click', (e: MouseEvent) => {
  let percentage = (e.clientX - volumebar.value!.getBoundingClientRect().left) / volumebar.value!.clientWidth
  percentage = Math.max(0, Math.min(1, percentage))
  volume.value = percentage
})
useEventListener(volumebar, 'mousedown', (e: DragEvent) => {
  const stopMouseMove = useEventListener('mousemove', (e: MouseEvent) => {
    let percentage = (e.clientX - volumebar.value!.getBoundingClientRect().left) / volumebar.value!.clientWidth
    percentage = Math.max(0, Math.min(1, percentage))
    volume.value = percentage
  })
  const stopMouseUp = useEventListener('mouseup', (e: MouseEvent) => {
    stopMouseMove()
    stopMouseUp()
  })
})

/* full screen */
const { isFullscreen, toggle: onFullscreen } = useFullscreen(root)

/* iframe mode */
const iframeUrl = ref('')
function getIframeUrl(url: string) {
  let regBili = /(https:\/\/|http:\/\/)www.bilibili.com\/video\/av(\S+)\?p=(\S+)/
  let regNico = /(https:\/\/|http:\/\/)www.nicovideo.jp\/watch\/sm(\S+)/
  let regYtb = /(https:\/\/|http:\/\/)www.youtube.com\/watch\?v=(\S+)/
  let regAcf = /(https:\/\/|http:\/\/)www.acfun.cn\/v\/ac(\S+)/
  let r: RegExpExecArray | null
  if ((r = regBili.exec(url))) return `//player.bilibili.com/player.html?aid=${r[2]}&page=${r[3]}`
  if ((r = regNico.exec(url))) return `//embed.nicovideo.jp/watch/sm${r[2]}`
  if ((r = regYtb.exec(url))) return `https://www.youtube.com/embed/${r[2]}`
  if ((r = regAcf.exec(url))) return `https://www.acfun.cn/player/ac${r[2]}`
  return
}
function loadIframe(url: string) {
  log(t('video.player.iframe.enable') + '\n')
  const iurl = getIframeUrl(url)
  if (!iurl) {
    log(t('video.player.iframe.failed') + '\n')
    return false
  }
  iframeUrl.value = iurl
  usePlayer.value = 'iframe'
  return true
}

/* stream mode */
const isContainerSupported = (container: string, codecs?: string, isAudio = false) => {
  if (['flv'].includes(container)) return true
  return window.MediaSource.isTypeSupported(getMIME(container, codecs, isAudio))
}
const getMIME = (container: string, codecs?: string, isAudio = false) =>
  `${isAudio ? 'audio' : 'video'}/${container.replace(/_dash$/, '')}${codecs ? `; codecs="${codecs}"` : ''}`
const hasAudioStream = ref(false)
const streamQuality = ref('')
const currentStream = ref<VideoStream | undefined>()
let flvPlayer: FlvJs.Player | undefined
onUnmounted(() => {
  flvPlayer?.destroy()
})
async function playStream(quality: string) {
  if (!video.value || !audio.value)
    await new Promise<void>((r) => {
      watch(
        () => {
          video.value
          audio.value
        },
        () => video.value && audio.value && r()
      )
    })
  streamQuality.value = quality
  if (video.value) {
    log(t('video.player.play-stream.source.video.source-changing') + '\n')
    const stream =
      streams.value.filter((v) => v.quality === quality).find((s) => isContainerSupported(s.container, s.vcodec)) ??
      streams.value.find((s) => isContainerSupported(s.container, s.vcodec))
    if (!stream) {
      log(t('video.player.play-stream.source.video.source-nothing') + '\n')
      return false
    }
    const audioStream = stream.audioStreams
      ? stream.audioStreams
          .sort((a, b) => formats.indexOf(a.container) - formats.indexOf(b.container))
          .sort((a, b) => (a.tbr ?? 0) - (b.tbr ?? 0))
          .reverse()
          .find((s) => isContainerSupported(s.container, s.acodec, true))
      : undefined
    if (stream.audioStreams && !audioStream) {
      log(t('video.player.play-stream.source.audio.source-nothing') + '\n')
      return false
    }
    console.log(stream, audioStream)
    try {
      switch (stream.container) {
        case 'flv': {
          log(t('video.player.play-stream.container.flv.player-loading') + '\n')
          try {
            const module = await import('flv.js')
            const flvjs = module.default
            log(t('video.player.play-stream.container.flv.parse-creating') + '\n')
            if ('createPlayer' in flvjs) {
              flvPlayer = flvjs.createPlayer({
                type: 'flv',
                url: stream.src[0].replace(/^http:/, 'https:'),
              })
              flvPlayer.attachMediaElement(video.value!)
              log(t('video.player.play-stream.container.flv.source-loading') + '\n')
              flvPlayer.load()
              flvPlayer.on('metadata_arrived', () => {
                log(t('video.player.play-stream.container.flv.player-loaded') + '\n')
                videoElementReady.value = true
              })
              hasAudioStream.value = false
            }
          } catch (e) {
            log(t('video.player.play-stream.container.flv.player-failed') + '\n' + e + '\n')
            return false
          }
          return true
        }
        case 'webm_dash':
        case 'mp4_dash': {
          log(t('video.player.play-stream.container.mp4_dash.source-loading') + '\n')
          video.value.src = stream.src[0]
          const stopOnVideoCanPlay = useEventListener(video, 'canplay', () => {
            log(t('video.player.play-stream.container.mp4_dash.player-loaded') + '\n')
            currentStream.value = stream
            videoElementReady.value = true
            stopOnVideoCanPlay()
          })
          if (stream.audioStreams) {
            audio.value!.src = stream.audioStreams[0].src[0]
            audio.value!.currentTime = video.value.currentTime
            audio.value!.load()
            hasAudioStream.value = true
          }
          video.value.load()
          return true
        }
      }
    } catch (e) {
      log(t('video.player.play-stream.container.failed') + '\n' + e + '\n')
      return false
    }
  }
}
async function loadStream(url: string) {
  try {
    log(t('video.player.video.address-parsing') + '\n')
    const res = await fetch('https://patchyvideo.com/be/helper/get_video_stream', {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        url: url,
      }),
    })
    const result = (await res.json()) as FetchResult<VideoData>
    if (!result.data) return false
    console.log(result.data)
    switch (result.data.extractor) {
      case 'BiliBili': {
        streams.value = result.data.streams as VideoStream[]
        const stream = streams.value[0]
        log(
          t('video.player.video.profile.known-source', {
            source: 'BiliBili',
            format: stream.container,
            quality: stream.quality,
          }) + '\n'
        )
        videoHasCors.value = true
        if (await playStream(stream.quality)) return true
        break
      }
      case 'Youtube': {
        let videoStreams: VideoStream[] = []
        const audioStreams: AudioStream[] = []
        result.data.streams.forEach((s) => {
          if (s.quality === 'tiny') {
            audioStreams.push(s as AudioStream)
          } else {
            videoStreams.push(s as VideoStream)
          }
        })
        videoStreams = videoStreams
          .map((v) => ({ ...v, audioStreams: audioStreams }))
          .sort((a, b) => formats.indexOf(a.container) - formats.indexOf(b.container))
          .sort((a, b) => qualities.indexOf(a.quality) - qualities.indexOf(b.quality))
        streams.value = videoStreams
        const stream = streams.value[0]
        log(
          t('video.player.video.profile.known-source', {
            source: 'Youtube',
            format: stream.container,
            quality: stream.quality,
          }) + '\n'
        )
        console.log(streams)
        if (await playStream(stream.quality)) return true
        break
      }
      default: {
        log(t('video.player.video.profile.unknown-source', { source: result.data.extractor }))
        break
      }
    }
    return false
  } catch (_) {
    return false
  }
}

const sitesWithStream = [
  'youtube',
  // zyddnys 2021/8/7 22:01:32
  // 那这样的话国内还是先用内嵌播放器 这样编辑才好看视频是不是东方
  // 'bilibili',
]
async function loadVideo(item: VideoItem) {
  if (sitesWithStream.includes(item.site)) {
    if (await loadStream(item.url)) return true
  }
  if (loadIframe(item.url)) return true
  return false
}

const url = ref('')
watch(
  () => props.item.url,
  async () => {
    if (!props.item.url) return
    log(t('video.player.video.info-fetching') + '\n')
    url.value = props.item.url
    log(t('video.player.video.URL', { url: url.value }) + '\n')
    loadVideo(props.item)
  },
  {
    immediate: true,
  }
)

const streams = ref<VideoStream[]>([])

const canvas = shallowRef<HTMLCanvasElement | null>(null)
{
  watchEffect(() => {
    if (!crossorigin.value && usePlayer.value === 'canvas') usePlayer.value = 'iframe'
  })
  watchEffect(() => {
    if (useCanvas.value) {
      usePlayer.value = 'canvas'
    } else {
      if (usePlayer.value === 'canvas') usePlayer.value = 'video'
    }
  })
  let audioCtx: AudioContext | undefined
  let gainNode: GainNode | undefined
  let analyser: AnalyserNode | undefined
  let frequencyBufferLength: number | undefined
  let frequencyBuffer: Uint8Array | undefined
  let source: MediaElementAudioSourceNode | undefined
  let audioSourceType: 'audio' | 'video' | undefined
  let clear: (() => void) | undefined
  let watched = false
  let frequencyBufferShift = 16
  watchEffect(() => {
    if (crossorigin.value && userClickedPlaying.value && !watched) {
      watchEffect(() => {
        if (hasAudioStream.value && audio.value && audioSourceType !== 'audio') {
          if (clear) clear()
          audioCtx = new AudioContext()
          source = audioCtx.createMediaElementSource(audio.value)
          audioSourceType = 'audio'
        } else if (!hasAudioStream.value && video.value && audioSourceType !== 'video') {
          if (clear) clear()
          audioCtx = new AudioContext()
          source = audioCtx.createMediaElementSource(video.value)
          audioSourceType = 'video'
        } else {
          return
        }
        gainNode = audioCtx.createGain()
        keepElementVolume.value = true
        analyser = audioCtx.createAnalyser()
        analyser.minDecibels = -90
        analyser.maxDecibels = -10
        analyser.smoothingTimeConstant = 0.8
        analyser.fftSize = 4096
        frequencyBufferLength = analyser.frequencyBinCount / 16 + frequencyBufferShift
        frequencyBuffer = new Uint8Array(frequencyBufferLength)

        if (audioCtx.state === 'suspended') audioCtx.resume()
        source.connect(gainNode)
        source.connect(analyser)
        gainNode.connect(audioCtx.destination)
        clear = () => {
          audioCtx?.close()
          source?.disconnect(0)
          source = undefined
          gainNode?.disconnect(0)
          gainNode = undefined
          analyser?.disconnect(0)
          analyser = undefined
          clear = undefined
        }
      })
      watchEffect(() => {
        if (gainNode) gainNode.gain.value = volume.value
      })
      watched = true
    }
  })
  onUnmounted(() => {
    if (clear) clear()
  })
  let frame = 0
  let ltrds: number[] = []
  const { pause: pauseCanvasRender, resume: resumeCanvasRender } = useRafFn(
    () => {
      const cvs = canvas.value
      const vid = video.value
      if (cvs && !vid?.paused) {
        const width = (cvs.width = cvs.clientWidth)
        const height = (cvs.height = cvs.clientHeight)
        const ctx = cvs.getContext('2d')
        if (!ctx) return

        {
          if (canvasTransparent.value) {
            ctx.clearRect(0, 0, width, height)
          } else {
            ctx.fillStyle = 'rgb(0,0,0)'
            ctx.fillRect(0, 0, width, height)
          }
        }

        {
          if (analyser && frequencyBufferLength && frequencyBuffer) {
            analyser.getByteFrequencyData(frequencyBuffer)
            const deg = Math.PI / 12
            const l = width + height * Math.tan(deg)
            const w = l / (frequencyBufferLength - frequencyBufferShift) - 1
            let x = 0
            for (const frequency of frequencyBuffer.slice(frequencyBufferShift)) {
              const c = frequency / 255
              ctx.fillStyle = `rgba(255,255,255,${c / 2 + 0.2})`
              ctx.beginPath()
              const bx = x - (1 - c) * height * Math.tan(deg)
              const by = (1 - c) * height
              ctx.moveTo(bx, by)
              ctx.lineTo(bx + w, by + w * Math.tan(deg))
              const lx = x - height * Math.tan(deg)
              ctx.lineTo(lx + w / Math.cos(deg) ** 2, height)
              ctx.lineTo(lx, height)
              ctx.fill()
              x += w + 1
            }
          }
        }

        {
          ltrds.push(performance.now())
          if (ltrds.length > 50) ltrds.shift()
          ctx.fillStyle = 'rgb(255,255,255)'
          const text = `Frame: ${frame++} Width: ${width} Height: ${height} FPS: ${Math.floor(
            1000 / ((ltrds[ltrds.length - 1] - ltrds[0]) / ltrds.length)
          )}`
          const w = (width - ctx.measureText(text).width) / 2
          ctx.fillText(text, w, 20)
        }
      }
    },
    { immediate: false }
  )
  watch(
    [usePlayer, playing, videoReady, audioReady],
    () => {
      if (
        usePlayer.value === 'canvas' &&
        playing.value &&
        videoReady.value &&
        (!hasAudioStream.value || audioReady.value)
      )
        resumeCanvasRender()
      if (
        usePlayer.value !== 'canvas' ||
        !playing.value ||
        !videoReady.value ||
        (hasAudioStream.value && !audioReady.value)
      )
        pauseCanvasRender()
    },
    { immediate: true }
  )
}
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
    width: 4rem;
  }
  .volumedot {
    /* TODO find a better way to do this */
    --un-translate-x: 0;
    --un-translate-y: 0;
  }
}
</style>
