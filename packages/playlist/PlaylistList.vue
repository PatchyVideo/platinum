<template>
  <LayoutDefault>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-4/5">
      <div v-if="status === 'loading'">
        <div class="border-b pb-1" v-text="t('search.search-result.video.main-body.loading.searching')" />
        <div v-if="screenSizes['<md']">
          <div v-for="index in limit" :key="index" class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            <div class="w-2/5 mr-0.5">
              <CoverPlaceholder class="rounded-md" />
            </div>
            <div class="w-3/5 flex flex-wrap content-between">
              <div
                class="line-clamp-2 overflow-ellipsis overflow-hidden w-full rounded-md bg-gray-400 dark:bg-gray-600"
              >
                &nbsp;
              </div>
              <div class="w-2/5 text-sm text-gray-600 dark:text-gray-300 rounded-md bg-gray-400 dark:bg-gray-600">
                &nbsp;
              </div>
            </div>
          </div>
        </div>
        <!-- Desktop View -->
        <div v-else class="search-result-backimg justify-evenly flex-wrap flex">
          <div
            v-for="index in limit"
            :key="index"
            class="w-12/25 my-5 p-2 border border-purple-300 shadow-md rounded-lg bg-white bg-opacity-50 dark:border-gray-700 dark:bg-gray-900"
          >
            <div
              class="flex justify-center items-center gap-x-1 border-b border-purple-300 dark:border-gray-500 py-3"
            >
              <div class="flex-1 rounded-md text-xl truncate font-semibold lg:text-2xl bg-gray-400 dark:bg-gray-600">
                &nbsp;
              </div>
            </div>
            <div class="flex p-2 pt-3">
              <div class="w-1/2 mr-5">
                <CoverPlaceholder class="rounded-md" />
              </div>
              <div class="w-1/2 py-2 flex flex-wrap content-between">
                <div class="line-clamp-3 w-full overflow-ellipsis overflow-hidden">
                  <div v-for="i in 3" :key="i" class="mb-1 w-full rounded-md bg-gray-300 dark:bg-gray-600">
                    &nbsp;
                  </div>
                </div>
                <div class="w-full text-right text-sm text-gray-600 dark:text-gray-300">
                  <div class="w-2/5 float-right rounded-md bg-gray-300 dark:bg-gray-600">
                    &nbsp;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="status === 'error'">
        <div>{{ t('playlist.playlist-list.main-body.failed.load-failed') }}</div>
        <div>{{ t('playlist.playlist-list.main-body.failed.load-failed-reason') + errMsg }}</div>
      </div>
      <div v-else-if="status === 'result'">
        <div class="border-b pb-1">
          {{ t('playlist.playlist-list.main-body.successful.load-result-count', { count }) }}
        </div>
        <!-- Mobile View -->
        <div v-if="screenSizes['<md']">
          <RouterLink
            v-for="playlist in playlists"
            :key="playlist.item.title"
            class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            :to="`/playlist/${playlist.id.toHexString()}`"
            target="_blank"
          >
            <div class="w-2/5 mr-0.5">
              <Cover :title="playlist.item.title" :cover-image="playlist.item.cover" class="rounded-sm" />
            </div>
            <div class="w-3/5 flex flex-wrap content-between">
              <div class="w-full">
                <div class="line-clamp-2 overflow-ellipsis overflow-hidden w-full flex items-center">
                  <span v-if="playlist.item.private" class="bg-purple-400 text-white text-xs rounded px-1">Private</span>
                  {{ playlist.item.title }}
                </div>
                <div class="line-clamp-2 overflow-ellipsis overflow-hidden w-full text-xs text-gray-500">
                  {{ playlist.item.desc }}
                </div>
              </div>
              <div class="w-full text-sm text-gray-600 dark:text-gray-300">
                {{ t('playlist.playlist-list.playlist.playlist-count', { count: playlist.item.count }) }}
              </div>
            </div>
          </RouterLink>
        </div>
        <!-- Desktop View -->
        <div v-else class="justify-evenly flex-wrap flex">
          <div
            v-for="playlist in playlists"
            :key="playlist.item.title"
            class="w-12/25 my-5 p-2 border border-purple-300 shadow rounded-lg bg-white bg-opacity-50 dark:border-gray-700 dark:bg-gray-900"
          >
            <RouterLink
              :to="`/playlist/${playlist.id}`"
              target="_blank"
              class="flex justify-center items-center gap-x-1 border-b border-purple-300 dark:border-gray-500 py-3"
            >
              <span v-if="playlist.item.private" class="bg-purple-400 dark:bg-violet-800 text-white text-xs rounded px-1 py-0.5">Private</span>
              <div class="text-xl truncate font-semibold lg:text-2xl">
                {{ playlist.item.title }}
              </div>
            </RouterLink>
            <div class="flex p-2 pt-3">
              <div class="w-1/2 mr-5">
                <Cover
                  :title="playlist.item.title"
                  :cover-image="playlist.item.cover"
                  class="rounded-md border border-purple-200 dark:border-gray-700"
                />
              </div>
              <div class="w-1/2 py-2 flex flex-wrap content-between">
                <div class="line-clamp-3 w-full overflow-ellipsis overflow-hidden">
                  {{ playlist.item.desc }}
                </div>
                <div class="w-full text-right text-sm text-gray-600 dark:text-gray-300">
                  {{ t('playlist.playlist-list.playlist.playlist-count', { count: playlist.item.count }) }}
                </div>
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
      :title="t('playlist.playlist-list.advanced-search.name')"
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
import Cover from '@/video/components/Cover.vue'
import BackTop from '@/ui/components/BackTop.vue'
import AdvancedSearch from '@/playlist/components/AdvancedSearch.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import CoverPlaceholder from '@/video/components/CoverPlaceholder.vue'
import { gql, useQuery, useResult } from '@/graphql'
import type { Query, schema } from '@/graphql'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { backTop } from '@/ui/libs/backTop'
import { screenSizes } from '@/css'
import { getAdditionalConstraintString } from '@/video/libs/decodeAdditionalConstraint'
import { startProgress, stopProgress } from '@/nprogress'

const { t } = useI18n()
setSiteTitle(`${t('playlist.playlist-list.title')} - PatchyVideo`)
const route = useRoute()
const router = useRouter()
const status = ref<'loading' | 'result' | 'error'>()
const errMsg = ref('')
const count = ref(0)
const pageCount = ref(0)
const playlists = ref<schema.Playlist[]>()

/* Precess URL query */
const limit = computed(() => {
  return Number(route.query.limit ? (Array.isArray(route.query.limit) ? route.query.limit[0] : route.query.limit) : 20)
})

const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0),
)
const page = computed(() => offset.value + 1)
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
    query ($offset: Int, $limit: Int, $order: String, $query: String) {
      listPlaylist(para: { offset: $offset, limit: $limit, order: $order, query: $query }) {
        playlists {
          id
          item {
            cover
            title
            desc
            count
            private
          }
        }
        count
        pageCount
      }
    }
  `,
  {
    offset: offset.value * limit.value,
    limit: limit.value,
    order: order.value,
    query: getAdditionalConstraintString(additionalConstraint.value),
  },
  {
    notifyOnNetworkStatusChange: true,
  },
)
const resultData = useResult(result, null, data => data?.listPlaylist)
watchEffect(() => {
  if (resultData.value) {
    count.value = resultData.value.count
    pageCount.value = resultData.value.pageCount
    playlists.value = resultData.value.playlists
  }
})

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
      order: order.value,
      query: getAdditionalConstraintString(additionalConstraint.value),
    },
    updateQuery(previousQueryResult, { fetchMoreResult }) {
      if (!fetchMoreResult)
        return previousQueryResult
      return fetchMoreResult
    },
  })
})

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
