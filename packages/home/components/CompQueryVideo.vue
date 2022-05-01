<template>
  <div ref="el" class="w-full">
    <div v-if="listVideo">
      <VideoRow
        :name="config.title"
        :title-links-to="{
          path: '/search-result',
          query: { i: config.query, order: config.order, visible_site: config.additionalConstraint },
        }"
        :videos="listVideo.videos"
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
  query: string
  order: string
  additionalConstraint: string
  title: string
  title_pos: 'tl' | 'tr' | 'bl' | 'br'
  video_show_title: boolean
  video_show_date: boolean
  video_rows: number
}

const config = reactive<HomeCompDataList>({
  query: '',
  order: 'latest',
  additionalConstraint: '',
  title: t('home.home.components.query-video.default-title'),
  title_pos: 'tl',
  video_show_title: true,
  video_show_date: true,
  video_rows: 1,
  ...JSON.parse(props.data),
})

const { result, load, fetchMore, forceDisabled } = useLazyQuery<Query>(
  gql`
    query ($limit: Int!, $query: String!, $order: String!, $additionalConstraint: String) {
      listVideo(
        para: {
          offset: 0
          limit: $limit
          humanReadableTag: true
          query: $query
          order: $order
          additionalConstraint: $additionalConstraint
        }
      ) {
        videos {
          id
          item {
            title
            coverImage
          }
          meta {
            createdAt
          }
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
  if (result.value && shownCount <= result.value.listVideo.videos.length)
    return
  if (forceDisabled.value) {
    load(undefined, {
      query: config.query,
      order: config.order,
      additionalConstraint: config.additionalConstraint,
      limit: count.value,
    })
  }
  else {
    fetchMore({
      variables: {
        query: config.query,
        order: config.order,
        additionalConstraint: config.additionalConstraint,
        limit: count.value,
      },
      updateQuery(previousQueryResult, { fetchMoreResult }) {
        if (!fetchMoreResult)
          return previousQueryResult
        return fetchMoreResult
      },
    })
  }
})

const listVideo = useResult(result, null, data => data.listVideo)
</script>
