<template>
  <div
    class="fixed max-h-full z-50 transform transition-transform duration-300 inset-x-0 bottom-0 overflow-auto p-3 bg-white dark:bg-gray-900 shadow rounded-t border-t border-purple-400 sm:rounded sm:border sm:right-0 sm:inset-y-0 sm:left-auto sm:p-2 sm:max-w-100"
    :class="{ 'sm:translate-x-full translate-y-full sm:translate-y-0': !open }"
  >
    <div class="w-full border-b p-1 pb-1.5 flex justify-between">
      <div class="flex items-center flex-nowrap">
        <div class="i-uil-search text-2xl transition-colors"></div>
        <div class="text-lg mr-30">{{ '高级搜索' }}</div>
      </div>
      <div class="i-uil-times text-2xl transition-colors" @click="open = false"></div>
    </div>
    <div class="mt-4 space-y-3">
      <!-- Tag only or text and tag -->
      <div class="flex justify-between space-x-6 items-end">
        <div class="whitespace-nowrap">{{ '搜索类型' }}</div>
        <PvSelect :selected="qtype" :item-list="qtypeList" @update:selected="(v) => (qtype = v)" />
      </div>
      <!-- AND or OR -->
      <!-- TODO: add OR function -->
      <div class="flex justify-between space-x-2 items-center">
        <div class="whitespace-nowrap">{{ '包含关键字：' }}</div>
        <AutoComplete
          v-model:keyword="searchContentAndOrNot"
          default-placeholder="输入标签或文本，用空格隔开"
          class="w-full max-w-125"
          :show-tag-cnt="false"
          @search="addsearchContentAndOrNot()"
        ></AutoComplete>
      </div>
      <!-- NOT -->
      <div class="flex justify-between space-x-6 items-center">
        <div class="whitespace-nowrap">{{ '排除标签：' }}</div>
        <AutoComplete
          v-model:keyword="exceptContent"
          default-placeholder="只能输入标签哦，用空格隔开"
          class="w-full max-w-125"
          :show-tag-cnt="false"
          @search="addexceptContent()"
        ></AutoComplete>
      </div>
      <!-- Order -->
      <div class="flex justify-between space-x-6 items-end">
        <div class="whitespace-nowrap">{{ '排序方式：' }}</div>
        <PvSelect :selected="order" :item-list="orderList" @update:selected="(v) => (order = v)" />
      </div>
      <!-- Site -->
      <div class="flex justify-between space-x-10 items-center">
        <div class="whitespace-nowrap">{{ '源网站：' }}</div>
        <div class="flex flex-wrap space-x-1">
          <div
            class="px-1 py-0.5 rounded-lg text-sm border border-purple-400 cursor-pointer transition transition-colors whitespace-nowrap mb-1"
            :class="{ 'bg-purple-400 text-white': visibleSites.findIndex((item) => item === '') != -1 }"
            @click="changeVisibleSites()"
          >
            {{ '全部' }}
          </div>
          <div
            v-for="site in siteList"
            :key="site.value"
            class="px-1 py-0.5 rounded-lg text-sm border border-purple-400 cursor-pointer transition transition-colors whitespace-nowrap mb-1"
            :class="{ 'bg-purple-400 text-white': visibleSites.findIndex((item) => item === site.value) != -1 }"
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
        <div class="whitespace-nowrap">{{ '原视频发布时间：' }}</div>
        <div class="flex flex-col space-y-0.5">
          <div class="flex justify-between items-center">
            <PvSelect
              :selected="beforeAfterEqualDate1"
              :item-list="beforeAfterEqualList"
              @update:selected="(v) => (beforeAfterEqualDate1 = v)"
            />
            <div class="space-x-0.5">
              <input
                :disabled="beforeAfterEqualDate1 === ''"
                placeholder="年"
                v-model.number="year1"
                class="w-15 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
              />
              <label>-</label>
              <input
                :disabled="beforeAfterEqualDate1 === ''"
                placeholder="月"
                v-model.number="month1"
                class="w-10 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
              />
              <label>-</label>
              <input
                :disabled="beforeAfterEqualDate1 === ''"
                placeholder="日"
                v-model.number="day1"
                class="w-10 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
              />
            </div>
          </div>
          <div class="flex justify-between items-center">
            <PvSelect
              :selected="beforeAfterEqualDate2"
              :item-list="beforeAfterEqualList"
              @update:selected="(v) => (beforeAfterEqualDate2 = v)"
            />
            <div class="space-x-0.5">
              <input
                :disabled="beforeAfterEqualDate2 === ''"
                placeholder="年"
                v-model.number="year2"
                class="w-15 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
              />
              <label>-</label>
              <input
                :disabled="beforeAfterEqualDate2 === ''"
                placeholder="月"
                v-model.number="month2"
                class="w-10 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
              />
              <label>-</label>
              <input
                :disabled="beforeAfterEqualDate2 === ''"
                placeholder="日"
                v-model.number="day2"
                class="w-10 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Tags number -->
      <div class="flex justify-between items-center">
        <div class="whitespace-nowrap">{{ '标签数量：' }}</div>
        <div class="space-x-1">
          <PvSelect
            :selected="moreLessEqualTagNum"
            :item-list="moreLessEqualList"
            @update:selected="(v) => (moreLessEqualTagNum = v)"
          />
          <input
            :disabled="moreLessEqualTagNum === ''"
            v-model.number="tagNum"
            class="w-12 border rounded-md border-purple-400 p-1 shadow-inner dark:bg-gray-500"
          />
        </div>
      </div>
      <!-- Show blocked videos -->
      <!-- TODO: search for showing block videos is not supposed -->
      <!-- <div class="flex justify-between items-center">
        <div class="whitespace-nowrap">{{ '展示被屏蔽的视频' }}</div>
        <PvCheckBox :check="showBlockedVideos" />
      </div> -->
      <!-- Only show autotaged videos -->
      <div class="flex justify-between items-center">
        <div class="whitespace-nowrap">{{ '仅展示待人工整理标签的视频' }}</div>
        <PvCheckBox :check="onlyShowAutotagedVideos" />
      </div>
      <!-- Reset or search -->
      <div class="flex justify-around border-t pt-3">
        <PvBotton>{{ '重置' }}</PvBotton>
        <PvBotton @click="search()">{{ '搜索' }}</PvBotton>
      </div>
      <!-- More infomation -->
      <div>
        <div class="text-xs italic">
          <div>{{ '#更多高级筛选功能请参考：' }}</div>
          <a
            href="https://patchyvideo.wiki/zh/SearchSystem"
            target="_blank"
            class="text-purple-300 hover:text-purple-500 transition transition-colors"
            >{{ '搜索系统 - PatchyVideo Wiki' }}</a
          >
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
    <div v-if="open" class="fixed inset-0 z-49" @click="open = false"></div>
  </Transition>
</template>

<script lang="ts" setup>
import PvSelect from '@/ui/components/PvSelect.vue'
import PvCheckBox from '@/ui/components/PvCheckBox.vue'
import AutoComplete from '@/search/components/AutoComplete.vue'
import PvBotton from '@/ui/components/PvBotton.vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'

// const { t } = useI18n()
const route = useRoute()
const router = useRouter()

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

const open = useVModel(props, 'open', emit)

/* Qtype */
const qtype = ref('tag')
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
const searchContentAndOrNot = ref('')
function addsearchContentAndOrNot(): void {}

/* Except */
const exceptContent = ref('')
function addexceptContent(): void {}

/* Order */
const order = ref('last_modified')
const orderList = [
  { value: 'latest', name: '索引时间正序' },
  { value: 'oldest', name: '索引时间倒序' },
  { value: 'video_latest', name: '原视频发布正序' },
  { value: 'video_oldest', name: '原视频发布倒序' },
  { value: 'last_modified', name: '最近修改顺序' },
]

/* Site */
const visibleSites = ref<('' | 'bili' | 'nico' | 'ytb' | 'twitter' | 'acfun' | 'zcool' | 'ipfs' | 'weibo-mobile')[]>([
  '',
])
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
  value: '' | 'bili' | 'nico' | 'ytb' | 'twitter' | 'acfun' | 'zcool' | 'ipfs' | 'weibo-mobile' = ''
): void {
  if (value === '') visibleSites.value = ['']
  else {
    const indexOfSite = visibleSites.value.indexOf(value)
    if (indexOfSite != -1) {
      visibleSites.value.splice(indexOfSite, 1)
      if (visibleSites.value.length === 0) visibleSites.value = ['']
    } else {
      visibleSites.value.push(value)
      const indexOfAll = visibleSites.value.indexOf('')
      if (indexOfAll != -1) {
        visibleSites.value.splice(indexOfAll, 1)
      }
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
  { name: '早于', value: '>' },
  { name: '晚于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const beforeAfterEqualDate1 = ref('')
watch(beforeAfterEqualDate1, (newv) => {
  if (newv === '') {
    year1.value = ''
    month1.value = ''
    day1.value = ''
  }
})
const year1 = ref('')
const month1 = ref('')
const day1 = ref('')
const beforeAfterEqualDate2 = ref('')
watch(beforeAfterEqualDate2, (newv) => {
  if (newv === '') {
    year2.value = ''
    month2.value = ''
    day2.value = ''
  }
})
const year2 = ref('')
const month2 = ref('')
const day2 = ref('')

/* Tag number */
const moreLessEqualList = [
  { name: '大于', value: '>' },
  { name: '小于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const moreLessEqualTagNum = ref('')
watch(moreLessEqualTagNum, (newv) => {
  if (newv === '') tagNum.value = ''
})
const tagNum = ref('')

/* Show blocked videos */
/* TODO: search for showing block videos is not supposed */
// const showBlockedVideos = ref(false)

/* Only show autotaged videos */
const onlyShowAutotagedVideos = ref(false)

const additionalConstraintBase64 = computed(() => {
  return window.btoa(
    encodeURI(
      JSON.stringify({
        qtype: qtype.value,
        searchContentAndOrNot: searchContentAndOrNot.value,
        exceptContent: exceptContent.value,
        order: order.value,
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
      })
    )
  )
})
function search(): void {
  const query = { qtype: qtype.value, order: order.value, a: additionalConstraintBase64.value }
  router.push({ path: route.path, query })
  open.value = false
}
</script>
