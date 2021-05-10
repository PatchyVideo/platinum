<template>
  <div
    ref="pvSelectRoot"
    class="pl-4 pr-8 m-1 rounded-full cursor-pointer relative inline-block border dark:border-gray-800 transition-shadow duration-200"
    :class="{ 'outline-none ring ring-pink-300': !listHidden }"
    @click="listHidden = !listHidden"
  >
    <div class="inline-block truncate align-top select-none" v-text="getItemNameByValue(selected)"></div>
    <div
      class="shadow rounded bg-white absolute top-15/12 left-0 z-2 box-border min-w-full overflow-hidden dark:bg-gray-800"
    >
      <ul
        class="overflow-x-hidden overflow-y-auto transform-gpu transition-all duration-200"
        :style="{ marginTop: listHidden ? '-' + itemList.length * 50 + '%' : '0' }"
      >
        <li
          v-for="item in itemList"
          :key="item.value"
          class="p-2 select-none transition-colors hover:bg-gray-100 hover:bg-gray-100 hover:dark:bg-gray-900"
          @click="changeItem(item.value)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div
      class="absolute inline-block z-1 top-0 right-0 box-border h-full text-center select-none mr-2 transform-gpu origin-center transition-all duration-200"
      :class="{ 'rotate-180': !listHidden }"
    >
      ▼
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

interface selectList {
  name: string
  value: string
}

export default defineComponent({
  components: {},
  props: {
    itemList: {
      type: Array as PropType<selectList[]>,
      default: () => [],
      requred: true,
    },
    selected: {
      type: String,
      default: 'default',
      requred: true,
    },
  },
  emits: ['update:selected'],
  setup(props, { emit }) {
    const { t } = useI18n()
    let listHidden = ref<boolean>(true)

    // Get Item Name By Value
    function getItemNameByValue(value: string): string {
      return props.itemList.find((item) => item.value === value)?.name || t('ui.pv-select.select')
    }

    // Click to hide the list
    const pvSelectRoot = ref<HTMLDivElement | null>(null)
    const pvSelectListener = (e: MouseEvent): void => {
      if (!pvSelectRoot.value?.contains(e.target as HTMLElement)) {
        listHidden.value = true
      }
    }
    onMounted((): void => {
      document.addEventListener('click', pvSelectListener)
    })
    onUnmounted((): void => {
      document.removeEventListener('click', pvSelectListener)
    })

    // Select Item From The List
    function changeItem(itemValue: string): void {
      emit('update:selected', itemValue)
    }
    return { t, listHidden, getItemNameByValue, pvSelectRoot, changeItem }
  },
})
</script>

<style lang="postcss" scoped></style>
