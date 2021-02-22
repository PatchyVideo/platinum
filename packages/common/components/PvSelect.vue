<template>
  <div
    ref="pvSelectRoot"
    class="pv-select pl-4 pr-8 m-1 rounded-full cursor-pointer relative inline-block border dark:border-gray-800"
    :class="{ active: !listHidden }"
    @click="listHidden = !listHidden"
  >
    <div class="inline-block truncate align-top" v-text="getItemNameByValue(selected)"></div>
    <ul
      class="shadow rounded bg-white absolute top-15/12 left-0 z-2 box-border min-w-full max-h-40 overflow-x-hidden overflow-y-auto dark:bg-gray-800"
      :class="{ listHidden: listHidden }"
    >
      <li
        v-for="item in itemList"
        :key="item.value"
        @click="changeItem(item.value)"
        class="p-2 transition-colors hover:bg-gray-100 hover:bg-gray-100 hover:dark:bg-gray-900"
      >
        {{ item.name }}
      </li>
    </ul>
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
      return props.itemList.find((item) => item.value === value)?.name || t('common.pvSelect.select')
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

<style lang="postcss" scoped>
.active {
  @apply outline-none;
  @apply ring;
  @apply ring-pink-300;
}
.listHidden {
  @apply max-h-0;
  @apply invisible;
}
.pv-select:after {
  content: '▼';
  @apply absolute;
  @apply z-1;
  @apply top-0;
  @apply right-0;
  @apply box-border;
  @apply h-full;
  @apply text-center;
  @apply pr-2;
}
</style>
