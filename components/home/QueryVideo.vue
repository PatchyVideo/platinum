<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = withDefaults(
  defineProps<{
    data?: any
  }>(),
  {
    data: () => ({}),
  },
)

const { t } = useI18n()

interface Data {
  rows: number
  query: string
  order: string
  additionalConstraint: string
  title: string
  title_pos: 'tl' | 'tr' | 'bl' | 'br'
  video_show_title: boolean
  video_show_date: boolean
}

const config = $computed<Data>(() => ({
  rows: 1,
  query: '',
  order: 'latest',
  additionalConstraint: '',
  title: t('home.home.components.query-video.default-title'),
  title_pos: 'tl',
  video_show_title: true,
  video_show_date: true,
  ...props.data,
}))

const { data } = await useAsyncQuery<Query>(
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
            url
          }
          meta {
            createdAt
          }
        }
      }
    }
  `,
  {
    query: config.query,
    order: config.order,
    additionalConstraint: config.additionalConstraint,
    limit: config.rows * 6,
  },
)
const listVideo = $computed(() => data.value?.listVideo)
</script>

<template>
  <div class="w-full">
    <div v-if="listVideo">
      <VideoGrid
        :name="config.title"
        :title-links-to="{
          path: '/search',
          query: { i: config.query, order: config.order, visible_site: config.additionalConstraint },
        }"
        :videos="listVideo.videos"
        :rows="config.rows"
        :video-show-title="config.video_show_title"
        :video-show-date="config.video_show_date"
      />
    </div>
    <div v-else>
      <VideoGridPlaceholder :rows="config.rows" />
    </div>
  </div>
</template>
