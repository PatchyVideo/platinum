<template>
  <div
    class="fixed max-h-full z-50 transform transition-transform duration-300 inset-x-0 bottom-0 overflow-auto p-3 bg-white dark:bg-gray-900 shadow border-purple-200 dark:border-gray-600 lt-sm:max-h-70vh lt-sm:rounded-t lt-sm:border-t sm:rounded-l sm:border-l sm:right-0 sm:inset-y-0 sm:left-auto sm:p-2 sm:w-95"
    :class="{ 'sm:translate-x-full translate-y-full sm:translate-y-0': !open }"
  >
    <div class="w-full border-b p-1 pb-1.5 flex justify-between">
      <div class="flex items-center flex-nowrap space-x-1">
        <div class="i-uil:search text-2xl transition-colors" />
        <div class="text-lg">
          {{ '高级搜索' }}
        </div>
      </div>
      <div class="i-uil:times text-2xl transition-colors" @click="open = false" />
    </div>
    <div class="mt-4 space-y-3">
      <!-- Tag only or text and tag -->
      <div class="flex justify-between space-x-6 items-center">
        <div class="whitespace-nowrap">
          {{ '搜索类型：' }}
        </div>
        <PvSelect v-model="qtype" class="flex-1 max-w-64" :item-list="qtypeList" />
      </div>
      <!-- AND or OR -->
      <!-- TODO: add OR function -->
      <div class="flex justify-between space-x-2 items-center">
        <div class="whitespace-nowrap">
          {{ '包含关键字：' }}
        </div>
        <AutoComplete
          v-model:keyword="searchContentAndOrNot"
          default-placeholder="输入标签或文本，用空格隔开"
          class="w-full"
          :show-tag-cnt="false"
          @search="addsearchContentAndOrNot()"
        />
      </div>
      <!-- NOT -->
      <div class="flex justify-between space-x-6 items-center">
        <div class="whitespace-nowrap">
          {{ '排除标签：' }}
        </div>
        <AutoComplete
          v-model:keyword="exceptContent"
          default-placeholder="只能输入标签哦，用空格隔开"
          class="w-full"
          :show-tag-cnt="false"
          @search="addexceptContent()"
        />
      </div>
      <!-- Order -->
      <div class="flex justify-between space-x-6 items-center">
        <div class="whitespace-nowrap">
          {{ '排序方式：' }}
        </div>
        <PvSelect v-model="order" class="flex-1 max-w-64" :item-list="orderList" />
      </div>
      <!-- Site -->
      <div class="flex justify-between items-center">
        <div class="whitespace-nowrap">
          {{ '源网站：' }}
        </div>
        <div class="flex max-w-72 flex-wrap gap-x-1">
          <div
            class="px-2 py-0.5 rounded-lg text-sm border border-purple-300 cursor-pointer transition transition-colors whitespace-nowrap mb-1 dark:border-gray-600"
            :class="{ 'bg-purple-400 dark:bg-indigo-800 text-white': visibleSites.findIndex((item) => item === '') !== -1 }"
            @click="changeVisibleSites()"
          >
            {{ '全部' }}
          </div>
          <div
            v-for="site in siteList"
            :key="site.value"
            class="px-2 py-0.5 rounded-lg text-sm border border-purple-300 cursor-pointer transition transition-colors whitespace-nowrap mb-1 dark:border-gray-600"
            :class="{ 'bg-purple-400 dark:bg-indigo-800 text-white': visibleSites.findIndex((item) => item === site.value) !== -1 }"
            @click="changeVisibleSites(site.value)"
          >
            {{ site.name }}
          </div>
        </div>
      </div>
      <!-- Rank -->
      <!-- TODO: search for rank is not supposed -->
      <!-- <div class="flex justify-between space-x-6 items-end">
          <div class="whitespace-nowrap">{{ '视频等级：' }}</div>
          <PvSelect :selected="rank" :item-list="rankList" @update:selected="(v) => (rank = v)" />
        </div> -->
      <!-- Date -->
      <div>
        <div class="mb-1 whitespace-nowrap">
          {{ '原视频发布时间：' }}
        </div>
        <div class="flex flex-col space-y-0.5">
          <div class="flex justify-between items-center">
            <PvSelect
              v-model="beforeAfterEqualDate1"
              :item-list="beforeAfterEqualList"
            />
            <div class="flex flex-row flex-nowrap items-center gap-x-0.5">
              <input
                v-model.number="year1"
                :disabled="beforeAfterEqualDate1 === ''"
                placeholder="年"
                class="focus:outline-none w-15 border rounded-md border-purple-300 px-1 py-0.5 shadow-inner dark:border-gray-700 dark:bg-gray-500"
              >
              <label>-</label>
              <input
                v-model.number="month1"
                :disabled="beforeAfterEqualDate1 === ''"
                placeholder="月"
                class="focus:outline-none w-10 border rounded-md border-purple-300 px-1 py-0.5 shadow-inner dark:border-gray-700 dark:bg-gray-500"
              >
              <label>-</label>
              <input
                v-model.number="day1"
                :disabled="beforeAfterEqualDate1 === ''"
                placeholder="日"
                class="focus:outline-none w-10 border rounded-md border-purple-300 px-1 py-0.5 shadow-inner dark:border-gray-700 dark:bg-gray-500"
              >
            </div>
          </div>
          <div class="flex justify-between items-center">
            <PvSelect
              v-model="beforeAfterEqualDate2"
              :item-list="beforeAfterEqualList"
            />
            <div class="flex flex-row flex-nowrap items-center gap-x-0.5">
              <input
                v-model.number="year2"
                :disabled="beforeAfterEqualDate2 === ''"
                placeholder="年"
                class="focus:outline-none w-15 border rounded-md border-purple-300 px-1 py-0.5 shadow-inner dark:border-gray-700 dark:bg-gray-500"
              >
              <label>-</label>
              <input
                v-model.number="month2"
                :disabled="beforeAfterEqualDate2 === ''"
                placeholder="月"
                class="focus:outline-none w-10 border rounded-md border-purple-300 px-1 py-0.5 shadow-inner dark:border-gray-700 dark:bg-gray-500"
              >
              <label>-</label>
              <input
                v-model.number="day2"
                :disabled="beforeAfterEqualDate2 === ''"
                placeholder="日"
                class="focus:outline-none w-10 border rounded-md border-purple-300 p-1 py-0.5 shadow-inner dark:border-gray-700 dark:bg-gray-500"
              >
            </div>
          </div>
        </div>
      </div>
      <!-- Tags number -->
      <div class="flex justify-between items-center">
        <div class="whitespace-nowrap">
          {{ '标签数量：' }}
        </div>
        <div class="flex flex-row items-center gap-1">
          <PvSelect
            v-model="moreLessEqualTagNum"
            :item-list="moreLessEqualList"
          />
          <input
            v-model.number="tagNum"
            :disabled="moreLessEqualTagNum === ''"
            class="w-12 border rounded-md border-purple-300 px-1 py-0.5 shadow-inner dark:border-gray-700 dark:bg-gray-500"
          >
        </div>
      </div>
      <!-- Show blocked videos -->
      <!-- TODO: search for showing block videos is not supposed -->
      <!-- <div class="flex justify-between items-center">
        <div class="whitespace-nowrap">{{ '展示被屏蔽的视频' }}</div>
        <PvSwitch :check="showBlockedVideos" />
      </div> -->
      <!-- Only show autotaged videos -->
      <div class="flex justify-between items-center">
        <div class="whitespace-nowrap">
          {{ '仅展示待人工整理标签的视频' }}
        </div>
        <PvSwitch v-model="onlyShowAutotagedVideos" />
      </div>
      <!-- Reset or search -->
      <div class="flex justify-around border-t pt-3">
        <PvBotton @click="reset()">
          {{ '重置' }}
        </PvBotton>
        <PvBotton @click="search()">
          {{ '搜索' }}
        </PvBotton>
      </div>
      <!-- More infomation -->
      <div>
        <div class="text-xs italic">
          <div>{{ '#更多高级筛选功能请参考：' }}</div>
          <a
            href="https://patchyvideo.wiki/zh/SearchSystem"
            target="_blank"
            class="text-purple-600 transition transition-colors dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-400"
          >{{ '搜索系统 - PatchyVideo Wiki' }}</a>
        </div>
      </div>
    </div>
  </div>
  <!-- Mask -->
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="bg-opacity-0"
    leave-active-class="transition-all duration-200"
    leave-to-class="bg-opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-49" @click="open = false" />
  </Transition>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'
import PvSelect from '@/ui/components/PvSelect.vue'
import PvSwitch from '@/ui/components/PvSwitch.vue'
import AutoComplete from '@/search/components/AutoComplete.vue'
import PvBotton from '@/ui/components/PvBotton.vue'
import { MessageType, PvMessage } from '@/ui/libs/PvMessage'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
    requred: true,
  },
})
const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

// const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const open = useVModel(props, 'open', emit)

/* initialize additional constraint with url */
const additionalConstraintUrl = ref(
  String(route.query.a ? (Array.isArray(route.query.a) ? route.query.a[0] : route.query.a) : ''),
)
const additionalConstraintObject = ref(
  additionalConstraintUrl.value === ''
    ? {
        searchContentAndOrNot: '',
        exceptContent: '',
        visibleSites: [''],
        date1: {
          beforeAfterEqualDate1: '',
          year1: '',
          month1: '',
          day1: '',
        },
        date2: {
          beforeAfterEqualDate2: '',
          year2: '',
          month2: '',
          day2: '',
        },
        tag: {
          moreLessEqualTagNum: '',
          tagNum: '',
        },
        onlyShowAutotagedVideos: false,
      }
    : JSON.parse(decodeURI(window.atob(additionalConstraintUrl.value))),
)

/* Qtype */
const qtype = ref(
  String(route.query.qtype ? (Array.isArray(route.query.qtype) ? route.query.qtype[0] : route.query.qtype) : 'tag'),
)
const qtypeList = [
  {
    name: '标签/文本模式',
    value: 'tag',
  },
  {
    name: '仅文本模式',
    value: 'text',
  },
]

/* AND or OR */
const searchContentAndOrNot = ref(additionalConstraintObject.value.searchContentAndOrNot)
function addsearchContentAndOrNot(): void {}

/* Except */
const exceptContent = ref(additionalConstraintObject.value.exceptContent)
function addexceptContent(): void {}

/* Order */
const order = ref(
  String(
    route.query.order ? (Array.isArray(route.query.order) ? route.query.order[0] : route.query.order) : 'last_modified',
  ),
)
const orderList = [
  { value: 'latest', name: '索引时间正序' },
  { value: 'oldest', name: '索引时间倒序' },
  { value: 'video_latest', name: '原视频发布正序' },
  { value: 'video_oldest', name: '原视频发布倒序' },
  { value: 'last_modified', name: '最近修改顺序' },
]

/* Site */
const visibleSites = ref<('' | 'bili' | 'nico' | 'ytb' | 'twitter' | 'acfun' | 'zcool' | 'ipfs' | 'weibo-mobile')[]>(
  additionalConstraintObject.value.visibleSites,
)
const siteList: {
  name: string
  value: '' | 'bili' | 'nico' | 'ytb' | 'twitter' | 'acfun' | 'zcool' | 'ipfs' | 'weibo-mobile'
}[] = [
  { name: 'Bilibili', value: 'bili' },
  { name: 'Nicovideo', value: 'nico' },
  { name: 'YouTube', value: 'ytb' },
  { name: 'Twitter', value: 'twitter' },
  { name: 'Acfun', value: 'acfun' },
  { name: '微博', value: 'weibo-mobile' },
  { name: '站酷', value: 'zcool' },
  { name: 'IPFS', value: 'ipfs' },
]
function changeVisibleSites(
  value: '' | 'bili' | 'nico' | 'ytb' | 'twitter' | 'acfun' | 'zcool' | 'ipfs' | 'weibo-mobile' = '',
): void {
  if (value === '') { visibleSites.value = [''] }
  else {
    const indexOfSite = visibleSites.value.indexOf(value)
    if (indexOfSite !== -1) {
      visibleSites.value.splice(indexOfSite, 1)
      if (visibleSites.value.length === 0)
        visibleSites.value = ['']
    }
    else {
      visibleSites.value.push(value)
      const indexOfAll = visibleSites.value.indexOf('')
      if (indexOfAll !== -1)
        visibleSites.value.splice(indexOfAll, 1)
    }
  }
}

/* Rank */
/* TODO: search for rank is not supposed */
// const rank = ref('3')
// const rankList: {
//   name: '仅管理员可见' | '登录用户可见' | '发布者和管理员可见' | '所有人可见'
//   value: '0' | '1' | '2' | '3'
// }[] = [
//   { name: '仅管理员可见', value: '0' },
//   { name: '发布者和管理员可见', value: '1' },
//   { name: '登录用户可见', value: '2' },
//   { name: '所有人可见', value: '3' },
// ]

/* Date */
const beforeAfterEqualList = [
  { name: '晚于', value: '>' },
  { name: '早于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const year1 = ref(additionalConstraintObject.value.date1.year1)
const month1 = ref(additionalConstraintObject.value.date1.month1)
const day1 = ref(additionalConstraintObject.value.date1.day1)
const beforeAfterEqualDate1 = ref<string>(additionalConstraintObject.value.date1.beforeAfterEqualDate1)
watch(beforeAfterEqualDate1, (newv) => {
  if (newv === '') {
    year1.value = ''
    month1.value = ''
    day1.value = ''
  }
})
const year2 = ref(additionalConstraintObject.value.date2.year2)
const month2 = ref(additionalConstraintObject.value.date2.month2)
const day2 = ref(additionalConstraintObject.value.date2.day2)
const beforeAfterEqualDate2 = ref<string>(additionalConstraintObject.value.date2.beforeAfterEqualDate2)
watch(beforeAfterEqualDate2, (newv) => {
  if (newv === '') {
    year2.value = ''
    month2.value = ''
    day2.value = ''
  }
})

/* Tag number */
const moreLessEqualList = [
  { name: '大于', value: '>' },
  { name: '小于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const tagNum = ref(additionalConstraintObject.value.tag.tagNum)
const moreLessEqualTagNum = ref<string>(additionalConstraintObject.value.tag.moreLessEqualTagNum)
watch(moreLessEqualTagNum, (newv) => {
  if (newv === '')
    tagNum.value = ''
})

/* Show blocked videos */
/* TODO: search for showing block videos is not supposed */
// const showBlockedVideos = ref(false)

/* Only show autotaged videos */
const onlyShowAutotagedVideos = ref(additionalConstraintObject.value.onlyShowAutotagedVideos)

/* Reset */
function reset() {
  qtype.value = 'tag'
  searchContentAndOrNot.value = ''
  exceptContent.value = ''
  order.value = 'last_modified'
  visibleSites.value = ['']
  beforeAfterEqualDate1.value = ''
  year1.value = ''
  month1.value = ''
  day1.value = ''
  beforeAfterEqualDate2.value = ''
  year2.value = ''
  month2.value = ''
  day2.value = ''
  moreLessEqualTagNum.value = ''
  tagNum.value = ''
  onlyShowAutotagedVideos.value = false
}

/* Search */
function checkSubmitContent(): boolean {
  // Check date
  if (
    beforeAfterEqualDate1.value !== ''
    && (isNaN(Number(year1.value))
      || !Number.isSafeInteger(year1.value)
      || Number(year1.value) <= 0
      || isNaN(Number(month1.value))
      || !Number.isSafeInteger(month1.value)
      || Number(month1.value) <= 0
      || isNaN(Number(day1.value))
      || !Number.isSafeInteger(day1.value)
      || Number(day1.value) <= 0)
  ) {
    PvMessage({ message: '请检查原视频发布时间项1的填写是否正确！', type: MessageType.warning })
    return false
  }
  if (
    beforeAfterEqualDate2.value !== ''
    && (isNaN(Number(year2.value))
      || !Number.isSafeInteger(year2.value)
      || Number(year2.value) <= 0
      || isNaN(Number(month2.value))
      || !Number.isSafeInteger(month2.value)
      || Number(month2.value) <= 0
      || isNaN(Number(day2.value))
      || !Number.isSafeInteger(day2.value)
      || Number(day2.value) <= 0)
  ) {
    PvMessage({ message: '请检查原视频发布时间项2的填写是否正确！', type: MessageType.warning })
    return false
  }
  // Check tag
  if (
    moreLessEqualTagNum.value !== ''
    && (isNaN(Number(tagNum.value)) || !Number.isSafeInteger(tagNum.value) || Number(tagNum.value) < 0)
  ) {
    PvMessage({ message: '请检查标签数量项的填写是否正确！', type: MessageType.warning })
    return false
  }
  return true
}
const additionalConstraintBase64 = computed(() => {
  return window.btoa(
    encodeURI(
      JSON.stringify({
        searchContentAndOrNot: searchContentAndOrNot.value,
        exceptContent: exceptContent.value,
        visibleSites: visibleSites.value,
        date1: {
          beforeAfterEqualDate1: beforeAfterEqualDate1.value,
          year1: year1.value,
          month1: month1.value,
          day1: day1.value,
        },
        date2: {
          beforeAfterEqualDate2: beforeAfterEqualDate2.value,
          year2: year2.value,
          month2: month2.value,
          day2: day2.value,
        },
        tag: {
          moreLessEqualTagNum: moreLessEqualTagNum.value,
          tagNum: tagNum.value,
        },
        onlyShowAutotagedVideos: onlyShowAutotagedVideos.value,
      }),
    ),
  )
})
function search(): void {
  if (!checkSubmitContent())
    return
  const query = { qtype: qtype.value, order: order.value, a: additionalConstraintBase64.value }
  router.push({ path: route.path, query })
  open.value = false
}
</script>
