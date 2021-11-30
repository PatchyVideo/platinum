<template>
  <LayoutDefault>
    <div class="p-2 md:p-10 md:m-auto xl:w-9/10 2xl:w-4/5">
      <div v-if="status === 'loading'">
        <div class="border-b pb-1" v-text="t('search.search-result.video.main-body.loading.searching')"></div>
        <div v-if="screenSizes['<md']">
          <div v-for="index in limit" :key="index" class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            <div class="w-2/5 mr-0.5">
              <CoverPlaceholder class="rounded-md"></CoverPlaceholder>
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
            class="w-12/25 my-5 p-2 border border-gray-300 shadow-md rounded-lg bg-white bg-opacity-50 dark:border-gray-500 dark:bg-gray-900"
          >
            <div
              class="block border-b py-3 text-center text-xl truncate font-semibold lg:text-2xl rounded-md bg-gray-400 dark:bg-gray-600"
            >
              &nbsp;
            </div>
            <div class="flex p-2 pt-3">
              <div class="w-1/2 mr-5">
                <CoverPlaceholder class="rounded-md"></CoverPlaceholder>
              </div>
              <div class="w-1/2 py-2 flex flex-wrap content-between">
                <div class="line-clamp-3 w-full overflow-ellipsis overflow-hidden">
                  <div v-for="i in 3" :key="i" class="mb-1 w-full rounded-md bg-gray-300 dark:bg-gray-600">&nbsp;</div>
                </div>
                <div class="w-full text-right text-sm text-gray-600 dark:text-gray-300">
                  <div class="w-2/5 float-right rounded-md bg-gray-300 dark:bg-gray-600">&nbsp;</div>
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
          {{ t('playlist.playlist-list.main-body.successful.load-result-count', { count: count }) }}
        </div>
        <!-- Mobile View -->
        <div v-if="screenSizes['<md']">
          <RouterLink
            v-for="playlist in playlists"
            :key="playlist.item.title"
            class="py-1 flex text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            :to="'/playlist/' + playlist.id.toHexString()"
          >
            <div class="w-2/5 mr-0.5">
              <Cover :title="playlist.item.title" :cover-image="playlist.item.cover" class="rounded-sm"></Cover>
            </div>
            <div class="w-3/5 flex flex-wrap content-between">
              <div class="line-clamp-2 overflow-ellipsis overflow-hidden w-full">{{ playlist.item.title }}</div>
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
            class="w-12/25 my-5 p-2 border border-gray-400 shadow-md rounded-lg bg-white bg-opacity-50 dark:border-gray-500 dark:bg-gray-900"
          >
            <RouterLink
              :to="'/playlist/' + playlist.id"
              class="block border-b py-3 text-center text-xl truncate font-semibold lg:text-2xl"
              >{{ playlist.item.title }}</RouterLink
            >
            <div class="flex p-2 pt-3">
              <div class="w-1/2 mr-5">
                <Cover
                  :title="playlist.item.title"
                  :cover-image="playlist.item.cover"
                  class="rounded-md border border-gray-200 dark:border-gray-500"
                ></Cover>
              </div>
              <div class="w-1/2 py-2 flex flex-wrap content-between">
                <div class="line-clamp-3 w-full overflow-ellipsis overflow-hidden">{{ playlist.item.desc }}</div>
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
        ></PvPagination>
      </div>
    </div>

    <!-- Advanced Search -->
    <div
      class="shadow fixed bottom-20 right-5 bg-gray-50 cursor-pointer p-2 transition-opacity rounded-full dark:bg-gray-800"
      :title="t('playlist.playlist-list.advanced-search.name')"
      @click="progressing(t('playlist.playlist-list.advanced-search.name'))"
    >
      <icon-uil-file-search-alt class="text-2xl" />
    </div>
    <BackTop />
  </LayoutDefault>
</template>

<script lang="ts" setup>
import Cover from '@/video/components/Cover.vue'
import BackTop from '@/ui/components/BackTop.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import CoverPlaceholder from '@/video/components/CoverPlaceholder.vue'
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NProgress from 'nprogress'
import { useQuery, gql, useResult } from '@/graphql'
import type { schema, Query } from '@/graphql'
import { progressing } from '@/common/lib/progressing'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { backTop } from '@/ui/lib/backTop'
import { screenSizes } from '@/css'

const { t } = useI18n()
setSiteTitle(t('playlist.playlist-list.title') + ' - PatchyVideo')
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
const order = computed(() =>
  String(
    route.query.order ? (Array.isArray(route.query.order) ? route.query.order[0] : route.query.order) : 'last_modified'
  )
)
const offset = computed(() =>
  Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
)
const page = computed(() => offset.value + 1)

/* Refresh query result for URL query change */
const URLQuery = computed(() => route.query)
watch(URLQuery, () => {
  backTop()
  fetchMore({
    variables: {
      offset: offset.value * limit.value,
      limit: limit.value,
      order: order.value,
    },
  })?.then((v) => {
    result.value = v.data
  })
})

const { result, loading, onError, fetchMore } = useQuery<Query>(
  gql`
    query ($offset: Int, $limit: Int, $order: String) {
      listPlaylist(para: { offset: $offset, limit: $limit, order: $order }) {
        playlists {
          id
          item {
            cover
            title
            desc
            count
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
  }
)
const resultData = useResult(result, null, (data) => data?.listPlaylist)
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
    if (!NProgress.isStarted()) NProgress.start()
  } else {
    status.value = 'result'
    if (NProgress.isStarted()) NProgress.done()
  }
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
