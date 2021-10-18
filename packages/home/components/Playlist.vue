<template>
  <div ref="el" class="w-full">
    <div v-if="playlist">
      <h4 class="text-xl" v-text="playlist.item.title"></h4>
      <div
        class="grid mt-2 grid-flow-row gap-4"
        :style="{ gridTemplateColumns: 'repeat(' + count / config.video_rows + ', minmax(0, 1fr))' }"
      >
        <RouterLink
          v-for="video in playlist.videos.slice(0, count)"
          :key="video.id.toHexString()"
          :to="'/video/' + video.id.toHexString()"
          class="rounded-md hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors duration-100"
        >
          <div class="aspect-w-16 aspect-h-10 overflow-hidden rounded-md border border-gray-200 dark:border-gray-500">
            <img
              class="object-cover h-full w-full dark:filter dark:brightness-75 bg-gray-300 dark:bg-gray-600"
              :src="'https://patchyvideo.com/images/covers/' + video.item.coverImage"
            />
          </div>
          <a
            v-if="config.video_show_title"
            :class="{ '-ml-2': video.item.title.startsWith('【') }"
            class="w-full overflow-hidden line-clamp-2 overflow-ellipsis"
            v-text="video.item.title"
          ></a>
          <div
            v-if="config.video_show_date"
            class="w-full text-sm truncate text-gray-600 dark:text-gray-300 font-light"
          >
            <Suspense><RelativeDate :date="video.meta.createdAt" /></Suspense>&nbsp;
          </div>
        </RouterLink>
      </div>
    </div>
    <div v-else>
      <h4 class="text-xl w-64 rounded-md bg-gray-300 dark:bg-gray-600 animate-pulse">&nbsp;</h4>
      <div
        class="grid mt-2 grid-flow-row gap-4"
        :style="{ gridTemplateColumns: 'repeat(' + count / config.video_rows + ', minmax(0, 1fr))' }"
      >
        <div v-for="index in count" :key="index" class="rounded-md">
          <div class="aspect-w-16 aspect-h-10 overflow-hidden rounded-md">
            <div class="w-full h-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
          </div>
          <div class="w-4/5 h-4 mt-1 rounded-md bg-gray-300 dark:bg-gray-600 animate-pulse">&nbsp;</div>
          <div class="w-3/5 h-3.5 mt-1 rounded-md bg-gray-300 dark:bg-gray-600 animate-pulse">&nbsp;</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import RelativeDate from '@/date-fns/components/RelativeDate.vue'
import { gql } from '@/graphql'
import type { Query } from '@/graphql'
import { useLazyQuery, useResult } from '@vue/apollo-composable'
import { computed, reactive, ref, shallowRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementSize, useIntersectionObserver } from '@vueuse/core'

const props = defineProps({
  data: {
    type: String,
    default: '{}',
  },
})
const { t } = useI18n()

interface HomeCompDataList {
  playlist_id: string
  title_pos: 'tl' | 'tr' | 'bl' | 'br'
  video_show_title: boolean
  video_show_date: boolean
  video_rows: number
}

const config = reactive<HomeCompDataList>({
  playlist_id: '5e057a1b31929c83a76d18a4',
  title_pos: 'tl',
  video_show_title: true,
  video_show_date: true,
  video_rows: 1,
  ...JSON.parse(props.data),
})

const { result, load, fetchMore, forceDisabled } = useLazyQuery<Query>(
  gql`
    query ($pid: String!, $limit: Int!) {
      getPlaylist(para: { pid: $pid }) {
        item {
          title
          count
        }
        videos(offset: 0, limit: $limit) {
          id
          item {
            title
            coverImage
          }
          meta {
            createdAt
          }
        }
        meta {
          createdAt
          modifiedAt
        }
      }
    }
  `
)

const el = shallowRef<HTMLElement | null>(null)
const { width } = useElementSize(el)
const count = computed(() => Math.floor(width.value / (240 + 16)) * config.video_rows)
const isInc = ref(false)
let shownCount = 0
useIntersectionObserver(
  el,
  ([{ isIntersecting }]) => {
    isInc.value = isIntersecting
  },
  { rootMargin: '100px 100px 100px 100px' }
)
watchEffect(() => {
  if (shownCount === count.value || !isInc.value) return
  shownCount = count.value
  if (result.value && shownCount <= result.value.getPlaylist.videos.length) return
  if (forceDisabled.value) {
    load(undefined, { pid: config.playlist_id, limit: count.value })
  } else {
    fetchMore({ variables: { pid: config.playlist_id, limit: count.value } })?.then((res) => {
      result.value = res.data
    })
  }
})

const playlist = useResult(result, null, (data) => data.getPlaylist)
</script>
