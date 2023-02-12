<template>
  <LayoutDefault>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-8/10">
      <div v-if="status === 'loading'">
        <div
          class="border-b pb-1"
        >
          <span class="inline-block w-36 rounded-md bg-gray-300 dark:bg-gray-600">&nbsp;</span>
        </div>
        <div class="p-1 text-xs text-right md:text-sm">
          {{ t('video.video-list.main-body.tips') }}
        </div>
        <!-- Mobile View -->
        <div v-if="screenSizes['<md']">
          <div v-for="index in limit" :key="index" class="py-1 flex hover:bg-gray-50 dark:hover:bg-gray-800">
            <div class="w-2/5 mr-0.5">
              <CoverPlaceholder class="rounded-md" />
            </div>
            <div class="w-3/5 text-sm pb-1 flex flex-wrap content-between">
              <div
                class="line-clamp-2 overflow-ellipsis overflow-hidden rounded-md w-full bg-gray-400 dark:bg-gray-600"
              >
                &nbsp;
              </div>
              <div class="flex text-xs h-4 align-middle rounded-md w-2/5 bg-gray-400 dark:bg-gray-600" />
            </div>
          </div>
        </div>
        <!-- Desktop View -->
        <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
          <div
            v-for="index in limit"
            :key="index"
            class="w-12/50 my-2 border border-purple-400 shadow-sm rounded-lg bg-white bg-opacity-50 dark:border-purple-800 dark:bg-gray-900"
          >
            <CoverPlaceholder class="rounded-md" />
            <div class="p-3 text-left text-sm lg:text-base">
              <div class="line-clamp-2 overflow-ellipsis overflow-hidden rounded-md bg-gray-400 dark:bg-gray-600">
                &nbsp;
              </div>
              <div class="flex text-xs h-4 mt-1 align-middle rounded-md bg-gray-300 dark:bg-gray-600" />
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
        />
        <div class="p-1 text-xs text-right md:text-sm">
          {{ t('video.video-list.main-body.tips') }}
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
                  {{ t('video.video-list.video.hidden') }}
                </div>
              </div>
            </div>
            <div class="flex flex-wrap content-between w-3/5 pb-1 text-sm">
              <div v-if="video.item.partName" class="overflow-hidden w-full">
                <a class="inline-block w-full truncate">{{ video.item.title }}</a>
                <div class="text-xs inline-block w-full truncate text-gray-600 dark:text-gray-300">
                  <label class="font-semibold">{{ `P${pageOfVideo(video.item.url)}:` }}</label>{{ video.item.partName }}
                </div>
              </div>
              <a v-else class="line-clamp-2 overflow-ellipsis overflow-hidden w-full">{{ video.item.title }}</a>
              <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                <div>{{ t('video.video-list.video.source-site') }}</div>
                <img class="cover h-full" :src="getSiteImage(video.item.site)" :alt="video.item.site">
              </div>
            </div>
          </RouterLink>
        </div>
        <!-- Desktop View -->
        <div v-else class="justify-evenly flex-wrap flex">
          <div
            v-for="video in videos"
            :key="video.item.title"
            class="w-12/50 my-2 border border-purple-300 shadow-sm rounded-lg overflow-hidden bg-white bg-opacity-50 dark:border-gray-700 dark:bg-gray-900"
          >
            <RouterLink
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
                    {{ t('video.video-list.video.hidden') }}
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
                    <label class="font-semibold">{{ `P${pageOfVideo(video.item.url)}:` }}</label>{{ video.item.partName }}
                  </div>
                </div>
                <a v-else class="line-clamp-2 overflow-ellipsis overflow-hidden" :title="video.item.title">{{
                  video.item.title
                }}</a>
                <div class="flex text-xs h-4 align-middle" :title="video.item.site">
                  <div>{{ t('video.video-list.video.source-site') }}</div>
                  <img class="cover" :src="getSiteImage(video.item.site)" :alt="video.item.site">
                </div>
              </div>
            </RouterLink>
            <!-- Hide Video Button (Admin Only) -->
            <div v-if="auth.isAdmin" class="text-right px-2 pb-1 cursor-pointer">
              <div v-if="hideVideoLoading.find(item => item === video.id.toHexString())">
                请求中...
              </div>
              <div
                v-else-if="hideVideoFailed.find(item => item === video.id.toHexString())" class="text-red transition-color hover:text-purple-600" @click="hideVideo(video.id.toHexString())"
              >
                隐藏失败！请点击重试
              </div>
              <div v-else-if="video.clearence === 0">
                已隐藏
              </div>
              <div v-else class="transition-color hover:text-purple-600" @click="hideVideo(video.id.toHexString())">
                隐藏
              </div>
            </div>
          </div>
        </div>
        <PvPagination
          :page-count="pageCount"
          :page="page"
          @previous="jumpToPreviousPage"
          @next="jumpToNextPage"
          @change="jumpToSelectedPage"
        />
      </div>
    </div>
    <!-- Advanced Search -->
    <div
      class="shadow fixed bottom-20 right-5 bg-gray-50 cursor-pointer p-2 transition-opacity rounded-full dark:bg-gray-800"
      :title="t('video.video-list.advanced-search.name')"
      @click="openAdvancedSearch()"
    >
      <div class="i-uil:file-search-alt text-2xl" />
    </div>
    <AdvancedSearch v-model:open="advancedSearch" />
    <BackTop />
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CoverPlaceholder from './components/CoverPlaceholder.vue'
import Cover from './components/Cover.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import AdvancedSearch from '@/video/components/AdvancedSearch.vue'
import BackTop from '@/ui/components/BackTop.vue'
import { useAuth } from '@/user'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query, schema } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { pageOfVideo } from '@/video/libs/biliHelper'
import { backTop } from '@/ui/libs/backTop'
import { getSiteImage } from '@/common/libs/imageUrl'
import { screenSizes } from '@/css'
import { getAdditionalConstraintString } from '@/video/libs/decodeAdditionalConstraint'
import { startProgress, stopProgress } from '@/nprogress'
import { MessageType, PvMessage } from '@/ui/libs/PvMessage'

const { t } = useI18n()
setSiteTitle(`${t('video.video-list.title')} - PatchyVideo`)
const route = useRoute()
const router = useRouter()
const auth = useAuth()

const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const pageCount = ref(0)
const videos = ref<schema.Video[]>([])

/* Precess URL query */
const limit = computed(() => {
  return Number(route.query.limit ? (Array.isArray(route.query.limit) ? route.query.limit[0] : route.query.limit) : 20)
})
const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0),
)
const page = computed(() => offset.value + 1)
const qtype = computed(() =>
  String(route.query.qtype ? (Array.isArray(route.query.qtype) ? route.query.qtype[0] : route.query.qtype) : 'tag'),
)
const order = computed(() =>
  String(
    route.query.order ? (Array.isArray(route.query.order) ? route.query.order[0] : route.query.order) : 'last_modified',
  ),
)
const additionalConstraint = computed(() =>
  String(route.query.a ? (Array.isArray(route.query.a) ? route.query.a[0] : route.query.a) : ''),
)

const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int!, $limit: Int!, $query: String!, $qtype: String, $order: String!) {
      listVideo(
        para: { offset: $offset, limit: $limit, humanReadableTag: true, query: $query, qtype: $qtype, order: $order }
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
    query: getAdditionalConstraintString(additionalConstraint.value),
    qtype: qtype.value,
    order: order.value,
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
    videos.value = resultData.value.videos.map((item) => { return { ...item } })
  }
})
onError((err) => {
  errMsg.value = err.message
  status.value = 'error'
})

// Refresh query result for URL query change
const URLQuery = computed(() => route.query)
watch(URLQuery, () => {
  backTop()
  fetchMore({
    variables: {
      offset: offset.value * limit.value,
      limit: limit.value,
      query: getAdditionalConstraintString(additionalConstraint.value),
      qtype: qtype.value,
      order: order.value,
    },
    updateQuery(previousQueryResult, { fetchMoreResult }) {
      if (!fetchMoreResult)
        return previousQueryResult
      return fetchMoreResult
    },
  })
})

/* Hide Video */
const hideVideoLoading = ref<string[]>([])
const hideVideoFailed = ref<string[]>([])
const hideVideo = async (vid: string) => {
  if (hideVideoFailed.value.find(item => item === vid))
    hideVideoFailed.value.splice(hideVideoFailed.value.findIndex(item => item === vid), 1)
  hideVideoLoading.value.push(vid)
  await fetch('https://patchyvideo.com/be/videos/condemn_video.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      vid,
    }),
    credentials: 'include',
  })
    .then(data => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === 'SUCCEED' && videos.value.find(item => item.id.toHexString() === vid)) {
        videos.value[videos.value.findIndex(item => item.id.toHexString() === vid)].clearence = 0
      }
      else {
        PvMessage({ message: `vid为 ${vid} 的视频隐藏失败，请注意！`, type: MessageType.error })
        hideVideoFailed.value.push(vid)
        throw new Error(res)
      }
    })
    .catch((e) => {
      console.error(e)
      PvMessage({ message: `vid为 ${vid} 的视频隐藏失败，请注意！`, type: MessageType.error })
      hideVideoFailed.value.push(vid)
    })
  if (hideVideoLoading.value.find(item => item === vid))
    hideVideoLoading.value.splice(hideVideoLoading.value.findIndex(item => item === vid), 1)
}

/* Show advanced search */
const advancedSearch = ref(false)
function openAdvancedSearch() {
  advancedSearch.value = true
}

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
