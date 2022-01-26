<template>
  <div
    class="fixed max-h-full z-50 transform transition-transform duration-300 inset-x-0 bottom-0 sm:right-0 sm:inset-y-0 sm:left-auto sm:p-2"
    :class="{ 'sm:translate-x-full translate-y-full sm:translate-y-0': !open }"
  >
    <div
      class="w-full h-full border-t border-purple-400 shadow p-3 rounded-t overflow-auto bg-white dark:bg-gray-900 sm:rounded sm:border"
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
          <div>{{ '搜索类型' }}</div>
          <PvSelect :selected="qtype" :item-list="qtypeList" @update:selected="(v) => (qtype = v)" />
        </div>
        <!-- AND or OR -->
        <!-- TODO: add OR function -->
        <div class="space-y-1">
          <div>{{ '包含关键字：' }}</div>
          <AutoComplete
            v-model:keyword="searchContentAndOrNot"
            default-placeholder="输入标签或文本"
            class="w-full max-w-125"
            :show-tag-cnt="false"
            @search="addsearchContentAndOrNot"
          ></AutoComplete>
        </div>
        <!-- NOT -->
        <div>
          <div>{{ '排除标签：' }}</div>
        </div>
        <!-- Order -->
        <div>
          <div>{{ '排序方式：' }}</div>
        </div>
        <!-- Site -->
        <div>
          <div>{{ '源网站：' }}</div>
        </div>
        <!-- Rank -->
        <div>
          <div>{{ '视频等级：' }}</div>
        </div>
        <!-- Date -->
        <div>
          <div>{{ '原视频上传时间：' }}</div>
        </div>
        <!-- Tags number -->
        <div>
          <div>{{ '标签数量：' }}</div>
        </div>
        <!-- Show blocked videos -->
        <div>
          <div>{{ '展示被屏蔽的视频' }}</div>
        </div>
        <!-- Only show autotaged videos -->
        <div>
          <div>{{ '仅展示待人工整理标签的视频' }}</div>
        </div>
        <!-- Reset or search -->
        <div class="flex justify-around border-t pt-3">
          <PvBotton>{{ '重置' }}</PvBotton>
          <PvBotton>{{ '搜索' }}</PvBotton>
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
import { ref } from 'vue'
// import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'

// const { t } = useI18n()
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

/* AND or OR */
const searchContentAndOrNot = ref('')
function addsearchContentAndOrNot(): void {}

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
</script>
