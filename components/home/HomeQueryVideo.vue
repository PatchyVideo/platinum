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
}

const config = computed<Data>(() => ({
  rows: 1,
  query: '',
  order: 'latest',
  additionalConstraint: '',
  title: t('home.home.components.query-video.default-title'),
  title_pos: 'tl',
  ...props.data,
}))

const { data, refresh } = await useAsyncQuery<Query>(
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
          clearence
          meta {
            createdAt
          }
        }
      }
    }
  `,
  {
    query: config.value.query,
    order: config.value.order,
    additionalConstraint: config.value.additionalConstraint,
    limit: config.value.rows * 6,
  },
)
const listVideo = computed(() => data.value!.listVideo)
</script>

<template>
  <div class="w-full">
    <VideoGrid
      :name="config.title"
      :title-links-to="{
        path: '/search',
        query: { i: config.query, order: config.order, visible_site: config.additionalConstraint },
      }"
      :videos="listVideo.videos"
      :rows="config.rows"
      @refresh="refresh"
    />
  </div>
</template>
