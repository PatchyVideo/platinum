<script lang="ts" setup>
import type { Query } from '@/composables/graphql'

const props = defineProps<{
  page: number
  limit: number
  queryWord: string
  order: string
  visibleSite: number
  total: number
  isAdmin: boolean
}>()
const emit = defineEmits<{
  (event: 'update:total', value: boolean): void
}>()
const total = useVModel(props, 'total', emit)

const route = useRoute()
const { t } = useI18n()

const VisibleSites = [
  {
    value: '',
    name: t('search.search-result.video.visible-sites.all'),
  },
  {
    value: 'ANY(site:acfun site:bilibili site:zcool)',
    name: t('search.search-result.video.visible-sites.home'),
  },
  {
    value: 'ANY(site:nicovideo site:twitter site:youtube site:ipfs)',
    name: t('search.search-result.video.visible-sites.abroad'),
  },
]

const { data: listVideo, refresh: refreshListVideo } = await useAsyncQuery<Query>(
  gql`
    query ($offset: Int!, $limit: Int!, $query: String!, $qtype: String, $order: String!, $additionalConstraint: String) {
      listVideo(
        para: {
          offset: $offset
          limit: $limit
          query: $query
          qtype: $qtype
          order: $order
          additionalConstraint: $additionalConstraint
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
    offset: (props.page - 1) * props.limit,
    limit: props.limit,
    query: props.queryWord,
    qtype: '',
    order: props.order,
    additionalConstraint: VisibleSites[props.visibleSite].value,
  },
)
const resultVideo = computed(() => listVideo.value!.listVideo)

watchEffect(() => {
  if (resultVideo.value)
    total.value = Math.ceil(resultVideo.value.count / props.limit)
})

function updateVisibleSite(visible_site: number) {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page: 1, order: 'last_modified', visible_site } })
}
</script>

<template>
  <div>
    <div class="border-b border-gray-200 py-1 mb-1 flex justify-between items-center">
      <div>
        {{ t('video.video-list.main-body.successful.search-result-count', { count: resultVideo.count }) }}
      </div>
      <div class="flex items-center space-x-1">
        <div
          v-for="(item, index) in VisibleSites" :key="item.value" class="py-0.5 px-2 rounded-md cursor-pointer text-purple-600 dark:text-purple-200" :class="{ 'bg-purple-100 dark:bg-purple-800': index !== visibleSite, 'bg-purple-200 dark:bg-purple-900': index === visibleSite }"
          @click="updateVisibleSite(index)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>

    <VideoList
      :videos="resultVideo.videos"
      :count="limit"
      :is-admin="isAdmin"
      @refresh="refreshListVideo"
    />
  </div>
</template>
