<template>
  <LayoutDefault :show-search-bar="!screenSizes.sm">
    <div class="text-center flex flex-col justify-start items-center">
      <h3 v-if="screenSizes.sm" class="text-lg font-semibold m-4 px-auto">
        {{ t('search.search-result.search-keywords') + queryWord }}
      </h3>
      <AutoComplete
        v-if="screenSizes.sm"
        v-model:keyword="queryWord"
        class="w-2/5 md:w-4/6 lg:w-3/6"
        @search="searchResult"
      />
    </div>

    <div class="p-2 md:m-auto xl:w-9/10 2xl:w-4/5">
      <div class="my-2 md:m-0 md:flex md:justify-between">
        <div class="flex">
          <div
            v-for="tabs in Tabs"
            :key="tabs.value"
            class="px-5 py-2 cursor-pointer text-gray-400 text-sm font-semibold border-t-4 border-transparent md:text-base md:font-bold md:p-5 md:pt-3"
            :class="{ 'text-black border-purple-300 dark:text-white': tabs.value === tab }"
            @click="changeTab(tabs.value)"
            v-text="tabs.name"
          />
        </div>
        <div v-if="tab === 'video' || tab === 'playlist'" class="flex self-center">
          <label
            v-for="orders in Orders"
            :key="orders.value"
            class="px-2 py-1 cursor-pointer text-gray-400 text-sm font-semibold md:text-base md:font-bold md:px-5 md:py-2"
            :class="{ 'text-black rounded-full bg-gray-100 dark:text-white dark:bg-gray-500': orders.value === order }"
            @click="changeOrder(orders.value)"
            v-text="orders.name"
          />
        </div>
      </div>

      <!-- Videos -->
      <SearchVideo
        v-if="tab === Tabs[0].value"
        v-model:query="queryWord"
        v-model:limit="limit"
        v-model:offset="offset"
        v-model:order="order"
        v-model:visible-site="visibleSite"
        v-model:page-count="pageCount"
      />

      <!-- Playlists -->
      <SearchPlaylist
        v-else-if="tab === Tabs[1].value"
        v-model:query="queryWord"
        v-model:limit="limit"
        v-model:offset="offset"
        v-model:order="order"
        v-model:page-count="pageCount"
      />
    </div>
    <PvPagination
      v-model:page-count="pageCount"
      v-model:page="page"
      @previous="jumpToPreviousPage"
      @next="jumpToNextPage"
      @change="jumpToSelectedPage"
    />
    <BackTop />
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AutoComplete from '@/search/components/AutoComplete.vue'
import BackTop from '@/ui/components/BackTop.vue'
import SearchVideo from '@/search/components/SearchVideo.vue'
import SearchPlaylist from '@/search/components/SearchPlaylist.vue'
import PvPagination from '@/ui/components/PvPagination.vue'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { screenSizes } from '@/css'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const pageCount = ref(0)

/* Precess URL query */
const queryWord = computed(() => {
  const query = String(route.query.i ? (Array.isArray(route.query.i) ? route.query.i.join(' ') : route.query.i) : '')
  if (query)
    setSiteTitle(t('search.search-result.title') + query)

  return query
})
const limit = computed(() => {
  return Number(route.query.limit ? (Array.isArray(route.query.limit) ? route.query.limit[0] : route.query.limit) : 20)
})
const offset = computed(() => {
  return Number(route.query.page ? (Array.isArray(route.query.page) ? route.query.page[0] : route.query.page) : 0)
})
const page = computed(() => offset.value + 1)
const Orders = [
  { value: 'last_modified', name: t('search.search-result.order.last-modified') },
  { value: 'video_oldest', name: t('search.search-result.order.video-oldest') },
]
const order = computed(() =>
  String(
    route.query.order ? (Array.isArray(route.query.order) ? route.query.order[0] : route.query.order) : Orders[0].value,
  ),
)
const visibleSite = computed(() =>
  String(
    route.query.visible_site
      ? Array.isArray(route.query.visible_site)
        ? route.query.visible_site[0]
        : route.query.visible_site
      : localStorage.getItem('VisibleSite') || '',
  ),
)
const Tabs = [
  {
    value: 'video',
    name: t('search.search-result.video.tab'),
  },
  {
    value: 'playlist',
    name: t('search.search-result.playlist.tab'),
  },
]
const tab = computed(() =>
  String(route.query.tab ? (Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab) : Tabs[0].value),
)

/* Change the router query to trigger the search function */
function searchResult(searchContent: string): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.i = searchContent
  query.page = 0
  router.push({ path: route.path, query })
}
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
function changeTab(value: string): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = 0
  query.tab = value
  delete query.visible_site
  delete query.order
  router.push({ path: route.path, query })
}
function changeOrder(value: string): void {
  const query = JSON.parse(JSON.stringify(route.query))
  query.page = 0
  query.order = value
  router.push({ path: route.path, query })
}
</script>
