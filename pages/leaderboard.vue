<script setup lang="ts">
definePageMeta({
  key: route => JSON.stringify([
    route.query.activeTab,
    route.query.date,
    route.query.page,
    route.query.limit,
  ]),
})

const route = useRoute()
const { t } = useI18n()

useHead({
  title: '历史与贡献',
})

const activeTab = computed(() => Number(pickFirstQuery(route.query.activeTab)) || 0)
const date = computed(() => Number(pickFirstQuery(route.query.date)) || 0)
const page = computed(() => Number(pickFirstQuery(route.query.page)) || 1)
const limit = computed(() => Number(pickFirstQuery(route.query.limit)) || 40)

const activeTabClass = 'bg-white'
const dateRangeList = computed(() => [
  { value: `${24 * 7 * 52 * 10}`, name: t('leaderboard.tag-contributions.date-range.all') },
  { value: `${24 * 30}`, name: t('leaderboard.tag-contributions.date-range.last-month') },
  { value: `${24 * 7}`, name: t('leaderboard.tag-contributions.date-range.last-week') },
  { value: `${24}`, name: t('leaderboard.tag-contributions.date-range.last-day') },
])
const selectedDateRange = ref(dateRangeList.value[date.value])
watch(selectedDateRange, (newv) => {
  updatePage('date', dateRangeList.value.findIndex(item => item.value === newv.value) || 0)
})
function updatePage(para: 'activeTab' | 'date', value: any): void {
  window.scrollTo(0, 0)
  navigateTo({ query: { ...route.query, [para]: value } })
}
</script>

<template>
  <div>
    <div class="w-full flex space-x-2 text-purple-600">
      <div class="flex-grow flex bg-purple-100 p-1.5 rounded-md">
        <div class="px-4 md:px-6 py-0.5 md:py-2 rounded-md cursor-pointer" :class="activeTab || activeTabClass" @click="updatePage('activeTab', 0)">
          <span class="hidden md:inline">标签贡献</span>排行榜
        </div>
        <div class="px-4 md:px-6 py-0.5 md:py-2 rounded-md cursor-pointer" :class="activeTab && activeTabClass" @click="updatePage('activeTab', 1)">
          <span class="hidden md:inline">标签</span>编辑历史
        </div>
      </div>
      <div v-if="activeTab===0" class="flex items-center space-x-2 bg-purple-100 p-1.5 rounded-md">
        <PFormSelect  v-model:selected-op="selectedDateRange" class="rounded-md bg-white md:px-2 md:py-1.5" :ops="dateRangeList" />
      </div>
    </div>

    <!-- Divider -->
    <div class="w-full h-0 md:h-0.5 my-4 rounded-full bg-purple-300" />

    <LeaderboardContributorRank v-if="!activeTab" :date-range-number="parseInt(selectedDateRange.value)" />
    <LeaderboardEditHistory v-else :page="page" :limit="limit" />
  </div>
</template>
