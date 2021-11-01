<template>
  <LayoutDefault>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-8/10">
      <div v-if="status === 'loading'">
        <div v-text="t('video.video-list.main-body.loading.searching')"></div>
        <!-- Mobile View -->
        <div v-if="screenSizes['<md']">
          <div v-for="index in limit" :key="index" class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-900">
            <div class="w-2/5 mr-[0.125rem]">
              <CoverPlaceholder class="rounded-md"></CoverPlaceholder>
            </div>
            <div class="w-3/5 text-sm pb-1 flex flex-wrap content-between">
              <div
                class="
                  line-clamp-2
                  overflow-ellipsis overflow-hidden
                  rounded-md
                  w-full
                  bg-gray-400
                  dark:bg-gray-600
                  animate-pulse
                "
              >
                &nbsp;
              </div>
              <div
                class="flex text-xs h-4 align-middle rounded-md w-2/5 bg-gray-400 dark:bg-gray-600 animate-pulse"
              ></div>
            </div>
          </div>
        </div>
        <!-- Desktop View -->
        <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
          <div
            v-for="index in limit"
            :key="index"
            class="
              w-[21%]
              my-5
              border
              shadow-sm
              rounded-lg
              bg-white bg-opacity-50
              dark:border-gray-500 dark:bg-gray-800
            "
          >
            <CoverPlaceholder class="rounded-md"></CoverPlaceholder>
            <div class="p-3 text-left text-sm lg:text-base">
              <div
                class="
                  line-clamp-2
                  overflow-ellipsis overflow-hidden
                  rounded-md
                  bg-gray-400
                  dark:bg-gray-600
                  animate-pulse
                "
              >
                &nbsp;
              </div>
              <div
                class="flex text-xs h-4 mt-1 align-middle rounded-md bg-gray-300 dark:bg-gray-600 animate-pulse"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="status === 'error'">
        <div>{{ t('video.video-list.main-body.failed.search-failed') }}</div>
        <div>{{ t('video.video-list.main-body.failed.search-failed-reason') + errMsg }}</div>
      </div>
      <div v-else-if="status === 'result'">
        <div
          class="border-b pb-1"
          v-text="t('video.video-list.main-body.successful.search-result-count', { count })"
        ></div>
        <!-- <div class="p-1 text-xs text-right md:text-sm">*已屏蔽含有敏感标签的视频</div> -->
        <!-- Mobile View -->
        <div v-if="screenSizes['<md']">
          <RouterLink
            v-for="video in videos"
            :key="video.item.title"
            class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-900"
            :to="'/video/' + video.id.toHexString()"
          >
            <div class="w-2/5 mr-[0.125rem]">
              <Cover :title="video.item.title" :cover-image="video.item.coverImage" class="rounded-sm"></Cover>
            </div>
            <div class="flex flex-wrap content-between w-3/5 pb-1 text-sm">
              <div v-if="video.item.partName" class="overflow-hidden w-full">
                <a class="inline-block w-full truncate">{{ video.item.title }}</a>
                <div class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300">
                  <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
                  >{{ video.item.partName }}
                </div>
              </div>
              <a v-else class="line-clamp-2 overflow-ellipsis overflow-hidden w-full">{{ video.item.title }}</a>
              <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                <div>{{ t('video.video-list.video.source-site') }}</div>
                <img class="cover h-full" :src="getSiteImage(video.item.site)" :alt="video.item.site" />
                <span v-if="video.clearence === 0" class="ml-2"
                  >已隐藏<icon-uil-eye-slash class="inline-block align-text-bottom"
                /></span>
              </div>
            </div>
          </RouterLink>
        </div>
        <!-- Desktop View -->
        <div v-else class="justify-evenly flex-wrap flex">
          <RouterLink
            v-for="video in videos"
            :key="video.item.title"
            class="
              w-[21%]
              my-5
              border
              shadow-sm
              rounded-lg
              bg-white bg-opacity-50
              dark:border-gray-500 dark:bg-gray-800
            "
            :to="'/video/' + video.id.toHexString()"
          >
            <Cover :title="video.item.title" :cover-image="video.item.coverImage" class="rounded-sm"></Cover>
            <div class="p-3 text-left text-sm lg:text-base">
              <div v-if="video.item.partName">
                <a class="inline-block w-full truncate" :title="video.item.title">{{ video.item.title }}</a>
                <div
                  class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300"
                  :title="video.item.partName"
                >
                  <label class="font-semibold">{{ 'P' + pageOfVideo(video.item.url) + ':' }}</label
                  >{{ video.item.partName }}
                </div>
              </div>
              <a v-else class="line-clamp-2 overflow-ellipsis overflow-hidden" :title="video.item.title">{{
                video.item.title
              }}</a>
              <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                <div>{{ t('video.video-list.video.source-site') }}</div>
                <img class="cover" :src="getSiteImage(video.item.site)" :alt="video.item.site" />
                <span v-if="video.clearence === 0" class="ml-2"
                  >已隐藏<icon-uil-eye-slash class="inline-block align-text-bottom"
                /></span>
              </div>
            </div>
          </RouterLink>
        </div>
        <PvPagination
          :page-count="pageCount"
          :page="page"
          @previous="jumpToPreviousPage"
          @next="jumpToNextPage"
          @change="jumpToSelectedPage"
        ></PvPagination>
      </div>
    </div>
    <!-- Advanced Search -->
    <div
      class="
        shadow
        fixed
        bottom-20
        right-5
        bg-gray-50
        cursor-pointer
        p-2
        transition-opacity
        rounded-full
        dark:bg-gray-900
      "
      :title="t('video.video-list.advanced-search.name')"
      @click="progressing(t('video.video-list.advanced-search.name'))"
    >
      <icon-uil-file-search-alt class="text-2xl" />
    </div>
    <BackTop></BackTop>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import BackTop from '@/ui/components/BackTop.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import Cover from './components/Cover.vue'
import CoverPlaceholder from './components/CoverPlaceholder.vue'
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NProgress from 'nprogress'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { pageOfVideo } from '@/video/lib/biliHelper'
import { backTop } from '@/ui/lib/backTop'
import { getSiteImage } from '@/common/lib/imageUrl'
import { progressing } from '@/common/lib/progressing'
import { screenSizes } from '@/tailwindcss'

const { t } = useI18n()
setSiteTitle(t('video.video-list.title') + ' - PatchyVideo')
const route = useRoute()
const router = useRouter()
const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const pageCount = ref(0)
const videos = ref<schema.Video[]>()

/* Precess URL query */
const limit = computed(() => {
  return Number(route.query.limit ? (Array.isArray(route.query.limit) ? route.query.limit[0] : route.query.limit) : 20)
})
const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
)
const page = computed(() => offset.value + 1)

/* Refresh query result for URL query change */
const URLQuery = computed(() => route.query)
watch(URLQuery, () => {
  fetchMore({
    variables: {
      offset: offset.value * limit.value,
      limit: limit.value,
      query: '',
    },
  })?.then((v) => {
    result.value = v.data
  })
})

const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int, $limit: Int, $query: String) {
      listVideo(para: { offset: $offset, limit: $limit, humanReadableTag: true, query: $query }) {
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
    query: '',
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

const resultData = useResult(result, null, (data) => data?.listVideo)
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
function jumpToPreviousPage(): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = offset.value - 1
  router.push({ path: route.path, query })
}
function jumpToNextPage(): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = offset.value + 1
  router.push({ path: route.path, query })
}
function jumpToSelectedPage(page: number): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = page - 1
  router.push({ path: route.path, query })
}
</script>
