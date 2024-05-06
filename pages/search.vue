<script setup lang="ts">
definePageMeta({
  key: route => JSON.stringify([
    route.query.type,
    route.query.page,
    route.query.limit,
    route.query.order,
    route.query.q,
    route.query.visible_site,
  ]),
})
const route = useRoute()
const { t } = useI18n()

const auth = await useAuth()

const Types = [
  {
    value: 'video',
    name: t('search.search-result.video.tab'),
  },
  {
    value: 'playlist',
    name: t('search.search-result.playlist.tab'),
  },
]
const activeTabClass = 'bg-white dark:bg-gray-600'
const type = computed(() => pickFirstQuery(route.query.type) || 'video')
const page = computed(() => Number(pickFirstQuery(route.query.page)) || 1)
const limit = computed(() => Number(pickFirstQuery(route.query.limit)) || 40)
const Orders = [
  { value: 'last_modified', name: t('search.search-result.order.last-modified') },
  { value: 'video_oldest', name: t('search.search-result.order.video-oldest') },
]
const order = computed({
  get() {
    return Orders.find(item => item.value === pickFirstQuery(route.query.order)) || Orders[0]
  },
  set(value) {
    window.scrollTo(0, 0)
    navigateTo({ query: { ...route.query, order: value.value } })
  },
})
const queryWord = computed(() => pickFirstQuery(route.query.q) || '')
useHead({
  title: `${t('search.search-result.title') + queryWord.value}`,
})
const visibleSite = computed(() => Number(pickFirstQuery(route.query.visible_site)) || 0)
const total = ref(1)

function updatePage(page: number) {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, page } })
}
function updateType(type: string) {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, type, page: 1, order: 'last_modified' } })
}
</script>

<template>
  <div>
    <div class="md:text-lg font-semibold my-2 md:my-4 md:text-center">
      {{ t('search.search-result.search-keywords') + queryWord }}
    </div>
    <div class="w-full flex space-x-2 text-purple-600">
      <div class="flex-grow flex bg-purple-100 p-1.5 rounded-md dark:bg-gray-800">
        <div
          v-for="item in Types" :key="item.value" class="px-4 md:px-6 py-0.5 md:py-2 rounded-md cursor-pointer dark:text-white " :class="item.value === type && activeTabClass"
          @click="updateType(item.value)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="flex items-center space-x-2 bg-purple-100 p-1.5 rounded-md dark:bg-gray-800">
        <PFormSelect v-model:selected-op="order" class="rounded-md bg-white md:px-2 md:py-1.5 dark:bg-gray-600" :ops="Orders" />
      </div>
    </div>

    <VideoSearchResult
      v-if="type === 'video'"
      v-model:total="total"
      :page="page"
      :limit="limit"
      :query-word="queryWord"
      :order="order.value"
      :visible-site="visibleSite"
      :is-admin="auth.isAdmin"
    />
    <PlaylistSearchResult
      v-else
      v-model:total="total"
      :page="page"
      :limit="limit"
      :query-word="queryWord"
      :order="order.value"
    />

    <PPagination
      class="mt-4"
      :page="page"
      :total="total"
      @update:page="updatePage"
    />
  </div>
</template>
