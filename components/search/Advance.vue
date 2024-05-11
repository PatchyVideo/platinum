<script lang="ts" setup>
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { Message, MessageType } from '@/composables/message'

const props = defineProps<{
  type: 'video' | 'playlist'
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const showAdvancedSearch = ref(false)

/* initialize additional constraint with url */
const additionalConstraintUrl = ref(
  String(pickFirstQuery(route.query.a) || ''),
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
    : JSON.parse(decompressFromEncodedURIComponent(additionalConstraintUrl.value) || '{}'),
)

/* Qtype */
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
const qtype = ref(
  qtypeList.find(item => item.value === String(pickFirstQuery(route.query.qtype))) || qtypeList[0],
)

/* TODO: AND or OR */
const searchContentAndOrNot = ref(additionalConstraintObject.value.searchContentAndOrNot)
function addsearchContentAndOrNot(): void {}

/* TODO: Except */
const exceptContent = ref(additionalConstraintObject.value.exceptContent)
function addexceptContent(): void {}

/* Order */
const orderListVideo = [
  { value: 'latest', name: '索引时间正序' },
  { value: 'oldest', name: '索引时间倒序' },
  { value: 'video_latest', name: '原视频发布正序' },
  { value: 'video_oldest', name: '原视频发布倒序' },
  { value: 'last_modified', name: '最近修改顺序' },
]
const orderListPlaylist = [
  { value: 'latest', name: '创建时间正序' },
  { value: 'oldest', name: '创建时间倒序' },
  { value: 'last_modified', name: '最近修改顺序' },
]
const order = ref(
  (() => {
    if (props.type === 'video')
      return orderListVideo.find(item => item.value === String(pickFirstQuery(route.query.order))) || orderListVideo[4]
    else
      return orderListPlaylist.find(item => item.value === String(pickFirstQuery(route.query.order))) || orderListPlaylist[2]
  })(),
)

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
  if (value === '') {
    visibleSites.value = ['']
  }
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

/* Date */
const beforeAfterEqualList = [
  { name: '晚于', value: '>' },
  { name: '早于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const year1 = ref<string>(additionalConstraintObject.value.date1.year1 || '')
const month1 = ref<string>(additionalConstraintObject.value.date1.month1 || '')
const day1 = ref<string>(additionalConstraintObject.value.date1.day1 || '')
const beforeAfterEqualDate1 = ref(
  beforeAfterEqualList.find(item => item.value === additionalConstraintObject.value.date1.beforeAfterEqualDate1) || beforeAfterEqualList[3],
)
watch(beforeAfterEqualDate1, (newv) => {
  if (newv.value === '') {
    year1.value = ''
    month1.value = ''
    day1.value = ''
  }
})
const ignoreDate1 = computed(() =>
  beforeAfterEqualDate1.value.value === beforeAfterEqualList[3].value,
)
const year2 = ref<string>(additionalConstraintObject.value.date2.year2 || '')
const month2 = ref<string>(additionalConstraintObject.value.date2.month2 || '')
const day2 = ref<string>(additionalConstraintObject.value.date2.day2 || '')
const beforeAfterEqualDate2 = ref(
  beforeAfterEqualList.find(item => item.value === additionalConstraintObject.value.date2.beforeAfterEqualDate2) || beforeAfterEqualList[3],
)
watch(beforeAfterEqualDate2, (newv) => {
  if (newv.value === '') {
    year2.value = ''
    month2.value = ''
    day2.value = ''
  }
})
const ignoreDate2 = computed(() =>
  beforeAfterEqualDate2.value.value === beforeAfterEqualList[3].value,
)

/* Tag number */
const moreLessEqualList = [
  { name: '大于', value: '>' },
  { name: '小于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const tagNum = ref<string>(additionalConstraintObject.value.tag.tagNum)
const moreLessEqualTagNum = ref(
  moreLessEqualList.find(item => item.value === additionalConstraintObject.value.tag.moreLessEqualTagNum) || moreLessEqualList[3],
)
watch(moreLessEqualTagNum, (newv) => {
  if (newv.value === '')
    tagNum.value = ''
})
const ignoreTagNum = computed(() =>
  moreLessEqualTagNum.value.value === moreLessEqualList[3].value,
)

/* Only show autotaged videos */
const onlyShowAutotagedVideos = ref(additionalConstraintObject.value.onlyShowAutotagedVideos)

/* Reset */
function reset() {
  qtype.value = qtypeList[0]
  searchContentAndOrNot.value = ''
  exceptContent.value = ''
  order.value = (() => {
    if (props.type === 'video')
      return orderListVideo[4]
    else
      return orderListPlaylist[2]
  })()
  visibleSites.value = ['']
  beforeAfterEqualDate1.value = beforeAfterEqualList[3]
  year1.value = ''
  month1.value = ''
  day1.value = ''
  beforeAfterEqualDate2.value = beforeAfterEqualList[3]
  year2.value = ''
  month2.value = ''
  day2.value = ''
  moreLessEqualTagNum.value = moreLessEqualList[3]
  tagNum.value = ''
  onlyShowAutotagedVideos.value = false
}

/* Search */
function checkSubmitContent(): boolean {
  // Check date
  if (
    beforeAfterEqualDate1.value.value !== ''
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
    Message({ message: '请检查原视频发布时间项1的填写是否正确！', type: MessageType.warning })
    return false
  }
  if (
    beforeAfterEqualDate2.value.value !== ''
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
    Message({ message: '请检查原视频发布时间项2的填写是否正确！', type: MessageType.warning })
    return false
  }
  // Check tag
  if (
    moreLessEqualTagNum.value.value !== ''
    && (isNaN(Number(tagNum.value)) || !Number.isSafeInteger(tagNum.value) || Number(tagNum.value) < 0)
  ) {
    Message({ message: '请检查标签数量项的填写是否正确！', type: MessageType.warning })
    return false
  }
  return true
}
const additionalConstraintBase64 = computed(() => {
  return compressToEncodedURIComponent(
    JSON.stringify({
      searchContentAndOrNot: searchContentAndOrNot.value,
      exceptContent: exceptContent.value,
      visibleSites: visibleSites.value,
      date1: {
        beforeAfterEqualDate1: beforeAfterEqualDate1.value.value,
        year1: year1.value,
        month1: month1.value,
        day1: day1.value,
      },
      date2: {
        beforeAfterEqualDate2: beforeAfterEqualDate2.value.value,
        year2: year2.value,
        month2: month2.value,
        day2: day2.value,
      },
      tag: {
        moreLessEqualTagNum: moreLessEqualTagNum.value.value,
        tagNum: tagNum.value,
      },
      onlyShowAutotagedVideos: onlyShowAutotagedVideos.value,
    }),
  )
})
function search(): void {
  if (!checkSubmitContent())
    return
  const query = { qtype: qtype.value.value, order: order.value.value, a: additionalConstraintBase64.value }
  router.push({ path: route.path, query })
  showAdvancedSearch.value = false
}
</script>

<template>
  <div>
    <div
      class="shadow fixed bottom-20 right-5 bg-gray-50 cursor-pointer p-2 transition-opacity rounded-full"
      :title="t('video.video-list.advanced-search.name')"
      @click="showAdvancedSearch = true"
    >
      <div class="i-uil:file-search-alt text-2xl" />
    </div>

    <div
      class="fixed max-h-100vh overflow-auto z-50 transform transition-transform duration-300 inset-x-0 bottom-0 p-3 bg-white shadow border-purple-200 lt-sm:max-h-70vh lt-sm:rounded-t lt-sm:border-t sm:rounded-l sm:border-l sm:right-0 sm:inset-y-0 sm:left-auto sm:p-2 sm:w-100"
      :class="{ 'sm:translate-x-full translate-y-full sm:translate-y-0': !showAdvancedSearch }"
    >
      <div class="w-full border-b p-1 pb-1.5 flex justify-between">
        <div class="flex items-center flex-nowrap space-x-1">
          <div class="i-uil:search text-2xl transition-colors" />
          <div class="text-lg">
            {{ '高级搜索' }}
          </div>
        </div>
        <div class="i-uil:times text-2xl transition-colors" @click="showAdvancedSearch = false" />
      </div>

      <div class="mt-4 space-y-3">
        <div v-if="props.type === 'video'" class="flex justify-between space-x-6 items-center">
          <div class="whitespace-nowrap">
            {{ '搜索类型：' }}
          </div>
          <PFormSelect v-model:selected-op="qtype" class="flex-1 max-w-64" :ops="qtypeList" ring />
        </div>

        <!-- TODO: add OR function -->
        <div class="flex justify-between space-x-2 items-center">
          <SearchCombo v-model:query="searchContentAndOrNot" :search-function="addsearchContentAndOrNot" class="w-full z-52" placeholder="包含关键字：" :show-poplar-tags="false" />
        </div>

        <div class="flex justify-between space-x-6 items-center">
          <SearchCombo v-model:query="exceptContent" :search-function="addexceptContent" class="w-full z-51" placeholder="排除标签：" :show-poplar-tags="false" />
        </div>

        <div class="flex justify-between space-x-6 items-center">
          <div class="whitespace-nowrap">
            {{ '排序方式：' }}
          </div>
          <PFormSelect v-if="props.type === 'video'" v-model:selected-op="order" class="flex-1 max-w-64" :ops="orderListVideo" ring />
          <PFormSelect v-else-if="props.type === 'playlist'" v-model:selected-op="order" class="flex-1 max-w-64" :ops="orderListPlaylist" ring />
        </div>

        <div v-if="props.type === 'video'" class="flex justify-between items-center">
          <div class="whitespace-nowrap">
            {{ '源网站：' }}
          </div>
          <div class="flex max-w-72 flex-wrap gap-x-1">
            <div
              class="px-2 py-0.5 rounded-lg text-sm border border-purple-300 cursor-pointer transition transition-colors whitespace-nowrap mb-1"
              :class="{ 'bg-purple-400 text-white': visibleSites.findIndex((item) => item === '') !== -1 }"
              @click="changeVisibleSites()"
            >
              {{ '全部' }}
            </div>
            <div
              v-for="site in siteList"
              :key="site.value"
              class="px-2 py-0.5 rounded-lg text-sm border border-purple-300 cursor-pointer transition transition-colors whitespace-nowrap mb-1"
              :class="{ 'bg-purple-400 text-white': visibleSites.findIndex((item) => item === site.value) !== -1 }"
              @click="changeVisibleSites(site.value)"
            >
              {{ site.name }}
            </div>
          </div>
        </div>

        <div v-if="props.type === 'video'">
          <div class="mb-1 whitespace-nowrap">
            {{ '原视频发布时间：' }}
          </div>
          <div class="flex flex-col space-y-0.5">
            <div class="flex justify-between items-end">
              <PFormSelect
                v-model:selected-op="beforeAfterEqualDate1"
                :ops="beforeAfterEqualList"
              />
              <div class="flex flex-row flex-nowrap items-end gap-x-0.5">
                <PFormInput v-model="year1" type="text" label="年" :disabled="ignoreDate1" />
                <label>-</label>
                <PFormInput v-model="month1" type="text" label="月" :disabled="ignoreDate1" />
                <label>-</label>
                <PFormInput v-model="day1" type="text" label="日" :disabled="ignoreDate1" />
              </div>
            </div>
            <div class="flex justify-between items-end">
              <PFormSelect
                v-model:selected-op="beforeAfterEqualDate2"
                :ops="beforeAfterEqualList"
              />
              <div class="flex flex-row flex-nowrap items-end gap-x-0.5">
                <PFormInput v-model="year2" type="text" label="年" :disabled="ignoreDate2" />
                <label>-</label>
                <PFormInput v-model="month2" type="text" label="月" :disabled="ignoreDate2" />
                <label>-</label>
                <PFormInput v-model="day2" type="text" label="日" :disabled="ignoreDate2" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-end">
          <div class="whitespace-nowrap pb-0.5">
            {{ '标签：' }}
          </div>
          <div class="flex flex-row items-end">
            <PFormSelect v-model:selected-op="moreLessEqualTagNum" :ops="moreLessEqualList" />
            <PFormInput v-model="tagNum" type="text" label="数量" :disabled="ignoreTagNum" />
          </div>
        </div>

        <div v-if="props.type === 'video'" class="flex justify-between items-center">
          <div class="whitespace-nowrap">
            {{ '仅展示待人工整理标签的视频' }}
          </div>
          <PFormCheckBox v-model:check="onlyShowAutotagedVideos" />
        </div>

        <div class="flex justify-around border-t pt-3">
          <PFormButton @click="reset()">
            {{ '重置' }}
          </PFormButton>
          <PFormButton @click="search()">
            {{ '搜索' }}
          </PFormButton>
        </div>

        <div>
          <div class="text-xs italic">
            <div>{{ '#更多高级筛选功能请参考：' }}</div>
            <a
              href="https://patchyvideo.wiki/zh/SearchSystem"
              target="_blank"
              class="text-purple-600 transition transition-colors hover:text-purple-800"
            >{{ '搜索系统 - PatchyVideo Wiki' }}</a>
          </div>
        </div>
      </div>
    </div>

    <PMask v-model:show="showAdvancedSearch" />
  </div>
</template>
