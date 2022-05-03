<template>
  <div ref="el" class="w-full">
    <div v-if="playlist">
      <VideoRow
        :name="config.title ?? playlist.item.title"
        :title-links-to="`/playlist/${config.playlist_id}`"
        :videos="playlist.videos"
        :count="count"
        :rows="config.video_rows"
        :video-show-title="config.video_show_title"
        :video-show-date="config.video_show_date"
      />
    </div>
    <div v-else>
      <VideoRowPlaceholder :count="count" :rows="config.video_rows" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, shallowRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementSize, useIntersectionObserver } from '@vueuse/core'
import VideoRow from './VideoRow.vue'
import VideoRowPlaceholder from './VideoRowPlaceholder.vue'
import { gql, useLazyQuery, useResult } from '@/graphql'
import type { Query } from '@/graphql'

const props = withDefaults(
  defineProps<{
    data?: string
  }>(),
  {
    data: '{}',
  },
)

const { t } = useI18n()

interface HomeCompDataList {
  playlist_id: string
  title?: string
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
  `,
  {},
  {
    notifyOnNetworkStatusChange: true,
  },
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
  { rootMargin: '200px 200px 200px 200px' },
)
watchEffect(() => {
  if (shownCount === count.value || !isInc.value)
    return
  shownCount = count.value
  if (result.value && shownCount <= result.value.getPlaylist.videos.length)
    return
  if (forceDisabled.value) {
    load(undefined, { pid: config.playlist_id, limit: count.value })
  }
  else {
    fetchMore({
      variables: { pid: config.playlist_id, limit: count.value },
      updateQuery(previousQueryResult, { fetchMoreResult }) {
        if (!fetchMoreResult)
          return previousQueryResult
        return fetchMoreResult
      },
    })
  }
})

const playlist = useResult(result, null, data => data.getPlaylist)
</script>
