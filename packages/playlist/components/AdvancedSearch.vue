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
            class="w-12 border rounded-md border-purple-300 p-1 shadow-inner dark:border-gray-700 dark:bg-gray-500"
          >
        </div>
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
            class="text-purple-300 hover:text-purple-500 transition transition-colors"
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
import { useVModel } from '@vueuse/core'
import PvSelect from '@/ui/components/PvSelect.vue'
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
// import { useI18n } from 'vue-i18n'

// const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const open = useVModel(props, 'open', emit)

/* Initialize additional constraint with url */
const additionalConstraintUrl = ref(
  String(route.query.a ? (Array.isArray(route.query.a) ? route.query.a[0] : route.query.a) : ''),
)
const additionalConstraintObject = ref(
  additionalConstraintUrl.value === ''
    ? {
        searchContentAndOrNot: '',
        exceptContent: '',
        tag: {
          moreLessEqualTagNum: '',
          tagNum: '',
        },
      }
    : JSON.parse(decodeURI(window.atob(additionalConstraintUrl.value))),
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
    route.query.order ? (Array.isArray(route.query.order) ? route.query.order[0] : route.query.order) : 'last_modified',
  ),
)
const orderList = [
  { value: 'latest', name: '创建时间正序' },
  { value: 'oldest', name: '创建时间倒序' },
  { value: 'last_modified', name: '最近修改顺序' },
]

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

/* Reset */
function reset() {
  searchContentAndOrNot.value = ''
  exceptContent.value = ''
  order.value = 'last_modified'
  moreLessEqualTagNum.value = ''
  tagNum.value = ''
}

/* Search */
function checkSubmitContent(): boolean {
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
        tag: {
          moreLessEqualTagNum: moreLessEqualTagNum.value,
          tagNum: tagNum.value,
        },
      }),
    ),
  )
})
function search(): void {
  if (!checkSubmitContent())
    return
  const query = { order: order.value, a: additionalConstraintBase64.value }
  router.push({ path: route.path, query })
  open.value = false
}
</script>
