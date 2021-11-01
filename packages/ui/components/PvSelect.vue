<template>
  <div
    ref="pvSelectRoot"
    class="
      pl-4
      pr-8
      rounded-full
      cursor-pointer
      relative
      inline-block
      border
      dark:border-gray-900
      transition-shadow
      duration-200
    "
    :class="{ 'outline-none ring ring-pink-300': !listHidden }"
    @click="listHidden = !listHidden"
  >
    <div class="inline-block truncate align-top select-none" v-text="getItemNameByValue(selected)"></div>
    <div
      class="
        shadow
        rounded
        bg-white
        absolute
        top-15/12
        left-0
        z-[2]
        box-border
        min-w-full
        overflow-hidden
        dark:bg-gray-900
      "
    >
      <ul
        class="overflow-x-hidden overflow-y-auto transform-gpu transition-all duration-200"
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
      class="
        absolute
        inline-block
        z-[1]
        top-0
        right-0
        box-border
        h-full
        text-center
        select-none
        mr-2
        transform-gpu
        origin-center
        transition-all
        duration-200
      "
      :class="{ 'rotate-180': !listHidden }"
    >
      ▼
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventListener, useVModel } from '@vueuse/core'

interface SelectList {
  name: string
  value: string
}

const props = defineProps({
  itemList: {
    type: Array as PropType<SelectList[]>,
    default: () => [],
    requred: true,
  },
  selected: {
    type: String,
    default: 'default',
    requred: true,
  },
})

const emit = defineEmits<{
  (event: 'update:selected', value: string): void
}>()

const selected = useVModel(props, 'selected', emit)

const { t } = useI18n()
const listHidden = ref<boolean>(true)

// Get Item Name By Value
function getItemNameByValue(value: string): string {
  return props.itemList.find((item) => item.value === value)?.name || t('ui.pv-select.select')
}

// Click to hide the list
const pvSelectRoot = shallowRef<HTMLDivElement | null>(null)
useEventListener(document, 'click', (e) => {
  if (!pvSelectRoot.value?.contains(e.target as HTMLElement)) {
    listHidden.value = true
  }
})
</script>
