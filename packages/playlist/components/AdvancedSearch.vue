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
      <!-- Date -->
      <div>
        <div class="whitespace-nowrap">{{ '播放列表创建时间：' }}</div>
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
      <!-- Reset or search -->
      <div class="flex justify-around border-t pt-3">
        <PvBotton @click="reset()">{{ '重置' }}</PvBotton>
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

/* Initialize additional constraint with url */
const additionalConstraintUrl = ref(
  String(route.query.a ? (Array.isArray(route.query.a) ? route.query.a[0] : route.query.a) : '')
)
const additionalConstraintObject = ref(
  additionalConstraintUrl.value === ''
    ? {
        searchContentAndOrNot: '',
        exceptContent: '',
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
      }
    : JSON.parse(decodeURI(window.atob(additionalConstraintUrl.value)))
)

/* AND or OR */
const searchContentAndOrNot = ref(additionalConstraintObject.value.searchContentAndOrNot)
function addsearchContentAndOrNot(): void {}

/* Except */
const exceptContent = ref(additionalConstraintObject.value.exceptContent)
function addexceptContent(): void {}

/* Order */
const order = ref(
  String(
    route.query.order ? (Array.isArray(route.query.order) ? route.query.order[0] : route.query.order) : 'last_modified'
  )
)
const orderList = [
  { value: 'latest', name: '创建时间正序' },
  { value: 'oldest', name: '创建时间倒序' },
  { value: 'last_modified', name: '最近修改顺序' },
]

/* Date */
const beforeAfterEqualList = [
  { name: '晚于', value: '>' },
  { name: '早于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const beforeAfterEqualDate1 = ref<string>(additionalConstraintObject.value.date1.beforeAfterEqualDate1)
watch(beforeAfterEqualDate1, (newv) => {
  if (newv === '') {
    year1.value = ''
    month1.value = ''
    day1.value = ''
  }
})
const year1 = ref(additionalConstraintObject.value.date1.year1)
const month1 = ref(additionalConstraintObject.value.date1.month1)
const day1 = ref(additionalConstraintObject.value.date1.day1)
const beforeAfterEqualDate2 = ref<string>(additionalConstraintObject.value.date2.beforeAfterEqualDate2)
watch(beforeAfterEqualDate2, (newv) => {
  if (newv === '') {
    year2.value = ''
    month2.value = ''
    day2.value = ''
  }
})
const year2 = ref(additionalConstraintObject.value.date2.year2)
const month2 = ref(additionalConstraintObject.value.date2.month2)
const day2 = ref(additionalConstraintObject.value.date2.day2)

/* Tag number */
const moreLessEqualList = [
  { name: '大于', value: '>' },
  { name: '小于', value: '<' },
  { name: '等于', value: '=' },
  { name: '不计', value: '' },
]
const moreLessEqualTagNum = ref<string>(additionalConstraintObject.value.tag.moreLessEqualTagNum)
watch(moreLessEqualTagNum, (newv) => {
  if (newv === '') tagNum.value = ''
})
const tagNum = ref(additionalConstraintObject.value.tag.tagNum)

/* Reset */
function reset() {
  searchContentAndOrNot.value = ''
  exceptContent.value = ''
  order.value = 'last_modified'
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
}

/* Search */
function checkSubmitContent(): boolean {
  // Check date
  if (
    beforeAfterEqualDate1.value != '' &&
    (isNaN(Number(year1.value)) ||
      !Number.isSafeInteger(year1.value) ||
      Number(year1.value) <= 0 ||
      isNaN(Number(month1.value)) ||
      !Number.isSafeInteger(month1.value) ||
      Number(month1.value) <= 0 ||
      isNaN(Number(day1.value)) ||
      !Number.isSafeInteger(day1.value) ||
      Number(day1.value) <= 0)
  ) {
    alert('请检查播放列表创建时间项1的填写是否正确！')
    return false
  }
  if (
    beforeAfterEqualDate2.value != '' &&
    (isNaN(Number(year2.value)) ||
      !Number.isSafeInteger(year2.value) ||
      Number(year2.value) <= 0 ||
      isNaN(Number(month2.value)) ||
      !Number.isSafeInteger(month2.value) ||
      Number(month2.value) <= 0 ||
      isNaN(Number(day2.value)) ||
      !Number.isSafeInteger(day2.value) ||
      Number(day2.value) <= 0)
  ) {
    alert('请检查播放列表创建时间项2的填写是否正确！')
    return false
  }
  // Check tag
  if (
    moreLessEqualTagNum.value != '' &&
    (isNaN(Number(tagNum.value)) || !Number.isSafeInteger(tagNum.value) || Number(tagNum.value) < 0)
  ) {
    alert('请检查标签数量项的填写是否正确！')
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
      })
    )
  )
})
function search(): void {
  if (!checkSubmitContent()) return
  const query = { order: order.value, a: additionalConstraintBase64.value }
  router.push({ path: route.path, query })
  open.value = false
}
</script>
