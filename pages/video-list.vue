<script lang="ts" setup>
import type { Query } from '@/composables/graphql'
import { getAdditionalConstraintString } from '@/composables/search'

definePageMeta({
  key: route => JSON.stringify([
    route.query.page,
    route.query.limit,
    route.query.order,
    route.query.qtype,
    route.query.a,
  ]),
})

const route = useRoute()
const { t } = useI18n()

useHead({
  title: `${t('video.video-list.title')}`,
})

const page = computed(() => Number(pickFirstQuery(route.query.page)) || 1)
const limit = computed(() => Number(pickFirstQuery(route.query.limit)) || 40)
const order = computed(() => pickFirstQuery(route.query.order) || 'last_modified')
const qtype = computed(() =>
  String(pickFirstQuery(route.query.qtype) || 'tag'),
)
const additionalConstraintUrl = ref(
  String(pickFirstQuery(route.query.a) || ''),
)

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
    offset: (page.value - 1) * limit.value,
    limit: limit.value,
    query: getAdditionalConstraintString(additionalConstraintUrl.value),
    qtype: qtype.value,
    order: order.value,
  },
)
const listVideo = computed(() => data.value!.listVideo)

const auth = await useAuth()

function updatePage(page: number) {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page } })
}
</script>

<template>
  <div>
    <div class="border-b border-gray-200 pb-1 mb-2">
      <span>{{ t('video.video-list.main-body.successful.search-result-count', { count: listVideo.count }) }}</span>
    </div>

    <VideoList
      :videos="listVideo.videos"
      :count="limit"
      :is-admin="auth.isAdmin"
      @refresh="refresh"
    />

    <PPagination
      class="mt-4"
      :page="page"
      :total="Math.ceil(listVideo.count / limit)"
      @update:page="updatePage"
    />

    <SearchAdvance type="video" />
  </div>
</template>
