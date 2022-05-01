<template>
  <div
    ref="pvSelectRoot"
    class="pl-4 pr-8 rounded-full cursor-pointer relative inline-block border border-purple-300 dark:border-gray-600 transition-shadow duration-200"
    :class="{ 'outline-none ring ring-purple-300': !listHidden }"
    @click="listHidden = !listHidden"
  >
    <div class="inline-block truncate align-top select-none" v-text="getItemNameByValue(selected)" />
    <div
      class="shadow rounded bg-white absolute top-5/4 left-0 z-2 box-border border-purple-400 min-w-full overflow-hidden dark:bg-gray-800"
    >
      <ul
        class="overflow-x-hidden overflow-y-auto transform transition-all duration-200"
        :style="{ marginTop: listHidden ? '-' + itemList.length * 50 + '%' : '0' }"
      >
        <li
          v-for="item in itemList"
          :key="item.value"
          class="p-2 select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="selected = item.value"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div
      class="absolute inline-block z-1 top-0 right-0 box-border border-purple-400 h-full text-center select-none mr-2 transform origin-center transition-all duration-200"
      :class="{ 'rotate-180': !listHidden }"
    >
      ▼
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventListener, useVModel } from '@vueuse/core'

interface SelectList {
  name: string
  value: string
}

const props = defineProps<{
  itemList: SelectList[]
  selected: string
}>()

const emit = defineEmits<{
  (event: 'update:selected', value: string): void
}>()

const selected = useVModel(props, 'selected', emit)

const { t } = useI18n()
const listHidden = ref<boolean>(true)

// Get Item Name By Value
function getItemNameByValue(value: string): string {
  return props.itemList.find(item => item.value === value)?.name || t('ui.pv-select.select')
}

// Click to hide the list
const pvSelectRoot = shallowRef<HTMLDivElement | null>(null)
useEventListener(document, 'click', (e) => {
  if (!pvSelectRoot.value?.contains(e.target as HTMLElement))
    listHidden.value = true
})
</script>
