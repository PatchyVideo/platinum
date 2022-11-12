<script lang="ts" setup>
import type { LocationQueryValue } from 'vue-router'
import type { Query } from '@/composables/graphql'

const route = useRoute()
const { t } = useI18n()

const pickFirst = (query: LocationQueryValue | LocationQueryValue[] | undefined) =>
  Array.isArray(query) ? query[0] : query

const page = $computed(() => Number(pickFirst(route.query.page)) || 0)
const limit = $computed(() => Number(pickFirst(route.query.limit)) || 20)
const order = $computed(() => pickFirst(route.query.order) || 'last_modified')

const { data, refresh } = await useAsyncQuery<Query>(
  gql`
    query ($offset: Int!, $limit: Int!, $query: String!, $qtype: String, $order: String!) {
      listVideo(
        para: {
          offset: $offset
          limit: $limit
          query: $query
          qtype: $qtype
          order: $order
          humanReadableTag: true
        }
      ) {
        count
        videos {
          id
          item {
            title
            desc
            coverImage
            partName
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
    offset: page * limit,
    limit,
    query: '',
    qtype: '',
    order,
  },
)
const listVideo = $computed(() => data.value!.listVideo)
</script>

<template>
  <div class="w-full max-w-screen-lg mx-auto">
    <div class="border-b border-gray-200 pb-1 mb-2">
      <span>{{ t('video.video-list.main-body.successful.search-result-count', { count: listVideo.count }) }}</span>
    </div>

    <VideoList
      :videos="listVideo.videos"
      :count="limit"
      @refresh="refresh"
    />
  </div>
</template>
