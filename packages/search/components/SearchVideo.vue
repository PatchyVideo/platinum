<template>
  <div v-if="status === 'loading'">
    <div v-text="t('search.search-result.video.main-body.loading.searching')"></div>
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <div v-for="index in limit" :key="index" class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-800">
        <div class="w-2/5 mr-0.5">
          <div class="aspect-10/16 overflow-hidden rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
        </div>
        <div class="w-3/5 text-sm pb-1 flex flex-wrap content-between">
          <div
            class="title overflow-ellipsis overflow-hidden rounded-md w-full bg-gray-400 dark:bg-gray-600 animate-pulse"
          >
            &nbsp;
          </div>
          <div class="flex text-xs h-4 align-middle rounded-md w-2/5 bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
        </div>
      </div>
    </div>
    <!-- Desktop View -->
    <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
      <div
        v-for="index in limit"
        :key="index"
        class="w-21/100 my-5 border shadow-sm rounded-lg bg-white bg-opacity-50 dark:border-gray-500 dark:bg-gray-700"
      >
        <div class="aspect-10/16 overflow-hidden rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
        <div class="p-3 text-left text-sm lg:text-base">
          <div class="title overflow-ellipsis overflow-hidden rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse">
            &nbsp;
          </div>
          <div class="flex text-xs h-4 mt-1 align-middle rounded-md bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="status === 'error'">
    <div v-text="t('search.search-result.video.main-body.failed.search-failed')"></div>
    <div v-text="t('search.search-result.video.main-body.failed.search-failed-reason') + errMsg"></div>
  </div>
  <div v-else-if="count === 0" v-text="t('search.search-result.video.main-body.successful.search-no-result')"></div>
  <div v-else-if="status === 'result'">
    <div class="flex flex-wrap-reverse justify-between items-end border-b-1 pb-1">
      <div v-text="t('search.search-result.video.main-body.successful.search-result-count', { count: count })"></div>
      <div class="flex self-center space-x-2">
        <label
          v-for="sites in VisibleSites"
          :key="sites.value"
          class="px-2 py-1 cursor-pointer text-gray-400 text-sm font-semibold md:text-base md:font-bold md:px-3 md:py-1"
          :class="{ 'active-opt': sites.value === visibleSite }"
          @click="changeVisibleSites(sites.value)"
          v-text="sites.name"
        ></label>
      </div>
    </div>
    <!-- Mobile View -->
    <div v-if="screenSizes['<md']">
      <div
        v-for="video in videos"
        :key="video.item.title"
        class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-800"
        @click="jumpToVideoResult(video.id.toHexString())"
      >
        <div class="w-2/5 mr-0.5">
          <div class="aspect-10/16 overflow-hidden rounded-sm">
            <img
              class="object-cover h-full w-full dark:(filter brightness-80)"
              :src="getCoverImage({ image: video.item.coverImage })"
            />
          </div>
        </div>
        <div class="w-3/5 text-sm pb-1 flex flex-wrap content-between">
          <div v-if="video.item.partName" class="overflow-hidden w-full">
            <a class="inline-block w-full truncate">{{ video.item.title }}</a>
            <div class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300">
              <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
              >{{ video.item.partName }}
            </div>
          </div>
          <a v-else class="title overflow-ellipsis overflow-hidden w-full">{{ video.item.title }}</a>
          <div class="flex text-xs h-4 align-middle" :title="video.item.site">
            <div>{{ t('search.search-result.video.video.source-site') }}</div>
            <img class="cover h-full" :src="imageMod[video.item.site]" :alt="video.item.site" />
          </div>
        </div>
      </div>
    </div>
    <!-- Desktop View -->
    <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
      <div
        v-for="video in videos"
        :key="video.item.title"
        class="w-21/100 my-5 border shadow-sm rounded-lg bg-white bg-opacity-50 dark:border-gray-500 dark:bg-gray-700"
        @click="jumpToVideoResult(video.id.toHexString())"
      >
        <div class="aspect-10/16 overflow-hidden rounded-sm">
          <img
            class="object-cover h-full w-full rounded-lg dark:(filter brightness-80)"
            :src="getCoverImage({ image: video.item.coverImage })"
          />
        </div>
        <div class="p-3 text-left text-sm lg:text-base">
          <div v-if="video.item.partName">
            <a class="inline-block w-full truncate" :title="video.item.title">{{ video.item.title }}</a>
            <div
              class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300"
              :title="video.item.partName"
            >
              <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ': ' }}</label
              >{{ video.item.partName }}
            </div>
          </div>
          <a v-else class="title overflow-ellipsis overflow-hidden" :title="video.item.title">{{ video.item.title }}</a>
          <div class="flex text-xs h-4 align-middle" :title="video.item.site">
            <div>{{ t('search.search-result.video.video.source-site') }}</div>
            <img class="cover" :src="imageMod[video.item.site]" :alt="video.item.site" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineProps, defineEmit, ref, computed, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { screenSizes } from '@/tailwindcss'
import { useVModel } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { getCoverImage, imageMod } from '@/common/lib/imageUrl'
import { backTop } from '@/ui/lib/backTop'
import { pageOfVideo } from '@/video/lib/biliHelper'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import NProgress from 'nprogress'

const props = defineProps({
  queryWord: { type: String, required: true },
  pageCount: { type: Number, required: true },
  order: {
    type: String,
    validator: (value: string) => {
      return ['last_modified', 'video_oldest'].indexOf(value) !== -1
    },
    required: true,
  },
})
const emit = defineEmit(['update:pageCount', 'update:order'])

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const limit = 20
const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const videos = ref<schema.Video[]>([])
const queryWord = useVModel(props, 'queryWord', emit, { passive: true })
const pageCount = useVModel(props, 'pageCount', emit, { passive: true })
const order = useVModel(props, 'order', emit, { passive: true })

const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
)
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
const visibleSite = computed(() =>
  String(
    route.query.visible_site
      ? Array.isArray(route.query.visible_site)
        ? route.query.visible_site[0]
        : route.query.visible_site
      : localStorage.getItem('VisibleSite') || VisibleSites[0].value
  )
)

/* Refresh query result for URL query change */
const URLQuery = computed(() => route.query)
watch(
  URLQuery,
  () => {
    fetchMore({
      variables: {
        offset: offset.value * limit,
        limit: limit,
        query: queryWord.value,
        order: order.value,
        additionalConstraint: visibleSite.value,
      },
    }).then((v) => {
      result.value = v.data
    })
  },
  { deep: true }
)

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
        }
      }
    }
  `,
  {
    offset: offset.value * limit,
    limit: limit,
    query: queryWord.value,
    order: order.value,
    additionalConstraint: visibleSite.value,
  }
)
watchEffect(() => {
  if (loading.value) {
    status.value = 'loading'
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    status.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
})

const resultData = useResult(result, null, (data) => data.listVideo)
watchEffect(() => {
  if (resultData.value) {
    count.value = resultData.value.count
    pageCount.value = resultData.value.pageCount
    videos.value = resultData.value.videos
  }
  backTop()
})
onError((err) => {
  errMsg.value = err.message
  status.value = 'error'
})

/* Change the router query to trigger the search function */
function changeVisibleSites(value: string): void {
  localStorage.setItem('VisibleSite', value)
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = 0
  query.visible_site = value
  router.push({ path: route.path, query })
}

/* Jump to detail page */
function jumpToVideoResult(id: string): void {
  const { href } = router.resolve({
    path: '/video/' + id,
  })
  window.open(href, '_blank')
}
</script>

<style lang="postcss" scoped>
.active-opt {
  @apply text-black;
  @apply rounded-full;
  @apply bg-gray-100;
  @apply dark:text-white
  @apply dark:bg-gray-500;
}
.search-result-backimg {
  @apply bg-center;
  @apply bg-no-repeat;
  @apply bg-contain;
  background-image: url('../assets/SearchResultBackImg.png');
}
.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>