<template>
  <div
    @mouseenter="hover = true "
    @mouseleave="hover = false"
    @mousemove="onMouseMove"
  >
    <div v-if="hover && loadStatus && !error && !isPureCoverImage" style="width: 200px; height: 125px; overflow: hidden;">
      <div class="progress-bar" :style="`height:${prh}px;border-width: ${Math.floor((prh - 2) / 2)}px 8px;`">
        <span ref="pspan" :style="`width:${progress}%`" />
      </div>
      <template v-if="loadStatus">
        <div
          v-if="isYtbCover"
          class="u2b-cover"
          :style="
            `background-image: url(/proxy/u2b/i9ytimg/sb/${
              imgUrl.replace('$N', `M${pn}`)
            });background-position: ${
              x
            }px ${
              y
            }px;background-size: ${
              parseInt(data[3]) * width
            }px;width: ${
              width
            }px;height: ${
              (width / 16) * 9
            }px`
          "
        />
        <div
          v-else
          class="bilibili-cover"
          :style="
            `background-image: url(/proxy/bili/cover/bfs/videoshot/${
              data.image[pn].replace('//i0.hdslb.com/bfs/videoshot/', '')
            });background-position: ${
              x
            }px ${
              y
            }px;background-size: ${
              data.img_x_len * width
            }px;width: ${
              width
            }px;height: ${
              (width / 16) * 9
            }px`
          "
        />
      </template>
    </div>
    <!-- v-loading="true" -->
    <div
      v-else-if="hover && !loadStatus"
      :style="`width:200px;height:125px;background:url(${baseUrl}/images/covers/${coverImage}) center center no-repeat;background-size:100% 100%`"
    />
    <div v-else :style="`width:200px;height:125px;background:url(${baseUrl}/images/covers/${coverImage}) center center no-repeat;background-size:100% 100%`" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useThemeDarkCoverFilter } from '@/settings'

const props = defineProps<{
  title: string
  coverImage: string
  /* v为undefined时表示当前为bilibiliCover，采用aid和cid。如aid和cid同时也为undefined，则用coverImage */
  v: string | undefined
  aid: number | undefined
  cid: number | undefined
}>()

const { t } = useI18n()
const baseUrl = ref('https://patchyvideo.com')
const filter = useThemeDarkCoverFilter()
const imgLink = ref('')
const progress = ref(0)
const loadStatus = ref(false)
const pic = ref('')
const x = ref(0)
const y = ref(0)
const size = ref(0)
const width = ref(200)
const hover = ref(false)
const imgUrl = ref('')
const data: Ref<null | ResponseData | Array<number>> = ref(null)
const error = ref(null)
const prefresh: Ref<MouseEvent | null> = ref(null)
const pn = ref(0)
const tBiliBili: Ref<Array<number>> = ref([])

const isYtbCover = computed(() => props.v !== undefined)
const isPureCoverImage = computed(() => props.v === undefined && props.aid === undefined && props.cid === undefined)
const prh = computed(() =>
  (width.value / 8) * 5 - (width.value / 16) * 9,
)
const updateCoverImageYoutube = async () => {
  const result = await fetch(`/proxy/u2b/watch?v=${props.v}`).catch((e) => {
    error.value = e.message
    loadStatus.value = true
  })
  if (result === undefined)
    return
  const bodyData = await result.json()
  const data = bodyData.data.match(/"storyboards":{"playerStoryboardSpecRenderer":{"spec":"([^"]+)"}}/)[1]
  const cdata = data.split('|').map((v: string) => v.split('#'))
  imgUrl.value = `${cdata[0][0].replace('$L', '1').replace(/https:\/\/.+\.ytimg\.com\/sb\//, '')}&sigh=${cdata[2][7].replace('$', '%24')}`
  data.value = cdata[2]
  loadStatus.value = true
}
const updateCoverImageBilibili = async () => {
  if (props.cid) {
    const result = await fetch(`/proxy/bili/x/player/videoshot?cid=${props.cid}&aid=${props.aid}&jsonp=jsonp`).then(res => res.json())
    if (result === undefined)
      return
    if (result.data.code === 0 && result.data.data) {
      data.value = result.data.data
      const result2 = await fetch(`/proxy/bili/cover/bfs/videoshot/${result.data.data.pvdata.replace('//i0.hdslb.com/bfs/videoshot/', '')}`, {
        method: 'GET',
      }).catch((e) => {
        error.value = e.message
        loadStatus.value = true
      })
      if (result2 === undefined)
        return
      // eslint-disable-next-line no-console
      console.log(123123, result2.json())
      const i = (await result2.json()).data
      const r = new DataView(i)
      const n = new Uint8Array(i.byteLength)
      for (let l = 0; l < n.length; l += 2) {
        const o = (r.getUint8(l) << 8) | r.getUint8(l + 1)
        tBiliBili.value.push(o)
      }
      loadStatus.value = true
    }
    else { error.value = result.data.message }
  }
  else {
    const result = await fetch(`/proxy/bili/x/player/videoshot?aid=${props.aid}&index=1`).then(res => res.json()).catch((e) => {
      error.value = e.message
      loadStatus.value = true
    })
    if (result.data.code === 0 && result.data.data) {
      data.value = result.data.data
      tBiliBili.value = result.data.data.index
    }
    else { error.value = result.data.message }
    loadStatus.value = true
  }
}
watch(hover, async () => {
  if (hover.value && !loadStatus.value && !isPureCoverImage.value) {
    if (isYtbCover.value)
      await updateCoverImageYoutube()
    else await updateCoverImageBilibili()
  }
})
const fresh = (e: MouseEvent) => {
  if (data.value === null)
    return
  if (isYtbCover.value) {
    data.value = data.value as Array<number>
    const i = Math.floor((e.offsetX / width.value) * data.value[2])
    const n = (data.value[1] / data.value[0]) * width.value
    progress.value = (e.offsetX / width.value) * 100
    x.value = ((-i % 100) % data.value[3]) * width.value
    y.value = -Math.floor((i % 100) / data.value[3]) * n
    pn.value = Math.floor(i / 100)
  }
  else {
    data.value = data.value as ResponseData
    const i = Math.floor((e.offsetX / width.value) * tBiliBili.value.length)
    const n = (data.value.img_y_size / data.value.img_x_size) * width.value
    progress.value = (e.offsetX / width.value) * 100
    x.value = ((-i % 100) % data.value.img_x_len) * width.value
    y.value = -Math.floor((i % 100) / data.value.img_x_len) * n
    pn.value = Math.floor(i / 100)
  }
}
const onMouseMove = (e: MouseEvent) => {
  if (loadStatus.value && data.value)
    fresh(e)
  else
    prefresh.value = e
}

interface ResponseData {
  img_x_size: number
  img_y_size: number
  img_x_len: number
}
</script>

<style scoped>
.u2b-cover {
  left: 0;
}
.bilibili-cover {
  left: 0;
}
.progress-bar {
  border-style: solid;
  border-color: #000;
  background: #444;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.progress-bar > span {
  display: block;
  background: #fff;
  height: 2px;
}
</style>
