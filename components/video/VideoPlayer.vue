<script setup lang="ts">
import type { schema } from '@/composables/graphql'

const props = defineProps<{
  item: schema.VideoItem
}>()

const regBili = /https?:\/\/www\.bilibili\.com\/video\/av(\S+)\?p=(\S+)/
const regNico = /https?:\/\/www\.nicovideo\.jp\/watch\/sm(\S+)/
const regU2b = /https?:\/\/www\.youtube\.com\/watch\?v=(\S+)/
const regAcf = /https?:\/\/www\.acfun\.cn\/v\/ac(\S+)/
const iframeUrl = ref('')
function getIframeUrl(url: string) {
  const bili = regBili.exec(url)
  if (bili)
    return `//player.bilibili.com/player.html?aid=${bili[1]}&page=${bili[2]}`
  const nico = regNico.exec(url)
  if (nico)
    return `//embed.nicovideo.jp/watch/sm${nico[1]}`
  const u2b = regU2b.exec(url)
  if (u2b)
    return `https://www.youtube.com/embed/${u2b[1]}`
  const acf = regAcf.exec(url)
  if (acf)
    return `https://www.acfun.cn/player/ac${acf[1]}`
}
function loadIframe(url: string) {
  const iurl = getIframeUrl(url)
  if (!iurl)
    return false
  iframeUrl.value = iurl
  return true
}

const url = ref('')
watch(
  () => props.item.url,
  async () => {
    if (!props.item.url)
      return
    url.value = props.item.url
    loadIframe(url.value)
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="aspect-16/9">
    <iframe
      v-if="iframeUrl"
      title="Video Player"
      class="block w-full h-full"
      :src="iframeUrl"
      allow="fullscreen"
      sandbox="allow-scripts allow-popups-to-escape-sandbox allow-same-origin"
    />
    <div v-else class="w-full h-full rounded flex items-center justify-center border border-warm-gray-300">
      PLAYER ERROR!
    </div>
  </div>
</template>
