<template>
  <div v-if="status === 'loading'">
    <div v-text="t('search.search-result.video.main-body.loading.searching')" />
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <div v-for="index in limit" :key="index" class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-800">
        <div class="w-2/5 mr-0.5">
          <CoverPlaceholder class="rounded-md" />
        </div>
        <div class="w-3/5 text-sm pb-1 flex flex-wrap content-between">
          <div class="line-clamp-2 overflow-ellipsis overflow-hidden rounded-md w-full bg-gray-400 dark:bg-gray-600">
            &nbsp;
          </div>
          <div class="flex text-xs h-4 align-middle rounded-md w-2/5 bg-gray-400 dark:bg-gray-600" />
        </div>
      </div>
    </div>
    <!-- Desktop View -->
    <div v-else class="search-result-backimg flex flex-wrap justify-evenly bg-center bg-no-repeat bg-contain">
      <div
        v-for="index in limit"
        :key="index"
        class="w-12/50 my-2 border border-purple-400 shadow-sm rounded-lg bg-white bg-opacity-50 dark:border-purple-800 dark:bg-gray-900"
      >
        <CoverPlaceholder class="rounded-md" />
        <div class="p-3 text-left text-sm lg:text-base">
          <div class="line-clamp-2 overflow-ellipsis overflow-hidden rounded-md bg-gray-300 dark:bg-gray-600">
            &nbsp;
          </div>
          <div class="flex text-xs h-4 mt-1 align-middle rounded-md bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="status === 'error'">
    <div v-text="t('search.search-result.video.main-body.failed.search-failed')" />
    <div v-text="t('search.search-result.video.main-body.failed.search-failed-reason') + errMsg" />
  </div>
  <div v-else-if="status === 'result'">
    <div class="flex flex-wrap-reverse justify-between items-end border-b pb-1">
      <div v-if="count === 0" v-text="t('search.search-result.video.main-body.successful.search-no-result')" />
      <div
        v-else
        v-text="t('search.search-result.video.main-body.successful.search-result-count', { count })"
      />
      <div class="flex self-center space-x-2">
        <label
          v-for="sites in VisibleSites"
          :key="sites.value"
          class="px-2 py-1 cursor-pointer text-gray-400 text-sm font-semibold md:text-base md:font-bold md:px-3 md:py-1"
          :class="{
            'text-black rounded-full bg-gray-100 dark:text-white dark:bg-gray-500': sites.value === visibleSite,
          }"
          @click="changeVisibleSites(sites.value)"
          v-text="sites.name"
        />
      </div>
    </div>
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <RouterLink
        v-for="video in videos"
        :key="video.item.title"
        class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-800"
        :to="`/video/${video.id.toHexString()}`"
        target="_blank"
      >
        <div class="relative w-2/5 mr-0.5">
          <Cover :title="video.item.title" :cover-image="video.item.coverImage" class="rounded-sm" />
          <div
            v-if="video.clearence === 0"
            class="absolute flex flex-col justify-center items-center top-0 bottom-0 w-full bg-gray-200 bg-opacity-80 hover:bg-opacity-20 transition-background-color"
          >
            <div class="i-uil:eye-slash text-4xl" />
            <div class="text-lg">
              {{ t('search.search-result.video.video.hidden') }}
            </div>
          </div>
        </div>
        <div class="w-3/5 text-sm pb-1 flex flex-wrap content-between">
          <div v-if="video.item.partName" class="overflow-hidden w-full">
            <a class="inline-block w-full truncate">{{ video.item.title }}</a>
            <div class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300">
              <label class="font-semibold">{{ `P${pageOfVideo(video.item.url)}:` }}</label>{{ video.item.partName }}
            </div>
          </div>
          <a v-else class="line-clamp-2 overflow-ellipsis overflow-hidden w-full">{{ video.item.title }}</a>
          <div class="flex text-xs h-4 align-middle" :title="video.item.site">
            <div>{{ t('search.search-result.video.video.source-site') }}</div>
            <img class="cover h-full" :src="getSiteImage(video.item.site)" :alt="video.item.site">
          </div>
        </div>
      </RouterLink>
    </div>
    <!-- Desktop View -->
    <div v-else class="search-result-backimg flex flex-wrap justify-evenly bg-center bg-no-repeat bg-contain">
      <RouterLink
        v-for="video in videos"
        :key="video.item.title"
        class="w-12/50 my-2 border border-purple-400 shadow-sm rounded-lg overflow-hidden bg-white bg-opacity-50 dark:border-purple-800 dark:bg-gray-900"
        :to="`/video/${video.id.toHexString()}`"
        target="_blank"
      >
        <div class="relative">
          <Cover :title="video.item.title" :cover-image="video.item.coverImage" />
          <div
            v-if="video.clearence === 0"
            class="absolute flex flex-col justify-center items-center top-0 bottom-0 w-full bg-gray-200 bg-opacity-80 hover:bg-opacity-20 transition-background-color"
          >
            <div class="i-uil:eye-slash text-8xl" />
            <div class="text-2xl">
              {{ t('search.search-result.video.video.hidden') }}
            </div>
          </div>
        </div>
        <div class="p-3 text-left text-sm lg:text-base">
          <div v-if="video.item.partName">
            <a class="inline-block w-full truncate" :title="video.item.title">{{ video.item.title }}</a>
            <div
              class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300"
              :title="video.item.partName"
            >
              <label class="font-semibold">{{ `P${pageOfVideo(video.item.url)}: ` }}</label>{{ video.item.partName }}
            </div>
          </div>
          <a v-else class="line-clamp-2 overflow-ellipsis overflow-hidden" :title="video.item.title">{{
            video.item.title
          }}</a>
          <div class="flex text-xs h-4 align-middle" :title="video.item.site">
            <div>{{ t('search.search-result.video.video.source-site') }}</div>
            <img class="cover" :src="getSiteImage(video.item.site)" :alt="video.item.site">
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useVModels } from '@vueuse/core'
import CoverPlaceholder from '@/video/components/CoverPlaceholder.vue'
import Cover from '@/video/components/Cover.vue'
import { getSiteImage } from '@/common/libs/imageUrl'
import { backTop } from '@/ui/libs/backTop'
import { pageOfVideo } from '@/video/libs/biliHelper'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query, schema } from '@/graphql'
import { screenSizes } from '@/css'
import { startProgress, stopProgress } from '@/nprogress'

const props = defineProps<{
  query: string
  limit: number
  offset: number
  order: string
  visibleSite: string
  pageCount: number
}>()
const emit = defineEmits<{
  (event: 'update:query', value: string): void
  (event: 'update:limit', value: number): void
  (event: 'update:offset', value: number): void
  (event: 'update:order', value: string): void
  (event: 'update:visibleSite', value: string): void
  (event: 'update:pageCount', value: number): void
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const videos = ref<schema.Video[]>([])
const { query, limit, offset, order, visibleSite, pageCount } = useVModels(props, emit)

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

const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int!, $limit: Int!, $query: String!, $order: String!, $additionalConstraint: String) {
      listVideo(
        para: {
          offset: $offset
          limit: $limit
          humanReadableTag: true
          query: $query
          order: $order
          additionalConstraint: $additionalConstraint
        }
      ) {
        count
        pageCount
        videos {
          id
          item {
            coverImage
            title
            site
            cid
            partName
            url
          }
          clearence
        }
      }
    }
  `,
  {
    offset: offset.value * limit.value,
    limit: limit.value,
    query: query.value,
    order: order.value,
    additionalConstraint: visibleSite.value,
  },
  {
    notifyOnNetworkStatusChange: true,
  },
)
watchEffect(() => {
  if (loading.value) {
    status.value = 'loading'
    startProgress()
  }
  else {
    status.value = 'result'
    stopProgress()
  }
})

const resultData = useResult(result, null, data => data?.listVideo)
watchEffect(() => {
  if (resultData.value) {
    count.value = resultData.value.count
    pageCount.value = resultData.value.pageCount
    videos.value = resultData.value.videos
  }
})
onError((err) => {
  errMsg.value = err.message
  status.value = 'error'
})

// Refresh query result for props change
watch(
  props,
  () => {
    backTop()
    fetchMore({
      variables: {
        offset: offset.value * limit.value,
        limit: limit.value,
        query: query.value,
        order: order.value,
        additionalConstraint: visibleSite.value,
      },
      updateQuery(previousQueryResult, { fetchMoreResult }) {
        if (!fetchMoreResult)
          return previousQueryResult
        return fetchMoreResult
      },
    })
  },
  { deep: true },
)

/* Change the router query to trigger the search function */
function changeVisibleSites(value: string): void {
  localStorage.setItem('VisibleSite', value)
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = 0
  query.visible_site = value
  router.push({ path: route.path, query })
}
</script>

<style lang="postcss" scoped>
.search-result-backimg {
  background-image: url('../assets/SearchResultBackImg.png');
}
</style>
