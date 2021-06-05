<template>
  <div v-if="pageCount - 1" class="xs:text-xs">
    <!-- Mobile View -->
    <div class="border-t-1 pt-1 flex-1 flex justify-between items-center">
      <a
        v-if="page !== 1"
        class="
          inline-flex
          items-center
          px-2
          py-1
          border border-gray-300
          text-sm
          font-medium
          rounded-lg
          hover:text-gray-500
          dark:bg-gray-600 dark:border-gray-700 dark:hover:bg-black
          md:px-4 md:py-2
        "
        @click="$emit('previous')"
        v-text="t('ui.pv-pagination.page-previous')"
      ></a>
      <a
        v-else
        disabled
        class="
          inline-flex
          items-center
          px-2
          py-1
          border border-gray-300
          text-sm
          font-medium
          rounded-lg
          dark:bg-gray-600 dark:border-gray-700
          md:px-4 md:py-2
        "
        v-text="t('ui.pv-pagination.page-previous')"
      ></a>
      <i18n-t keypath="ui.pv-pagination.page-number" tag="div" :places="{ count: pageCount }">
        <template #count>
          <input
            v-model="pageNum"
            place="action"
            class="w-12 border rounded-md border-gray-400 p-1 shadow-inner dark:bg-gray-500"
            @keydown.enter="change"
          />
        </template>
        <template #total>
          <span>{{ pageCount }}</span>
        </template>
      </i18n-t>
      <a
        v-if="page !== pageCount"
        class="
          inline-flex
          items-center
          px-2
          py-1
          border border-gray-300
          text-sm
          font-medium
          rounded-lg
          hover:text-gray-500
          dark:bg-gray-600 dark:border-gray-700 dark:hover:bg-black
          md:px-4 md:py-2
        "
        @click="$emit('next')"
        v-text="t('ui.pv-pagination.page-next')"
      ></a>
      <a
        v-else
        disabled
        class="
          inline-flex
          items-center
          px-2
          py-1
          border border-gray-300
          text-sm
          font-medium
          rounded-lg
          dark:bg-gray-600 dark:border-gray-700
          md:px-4 md:py-2
        "
        v-text="t('ui.pv-pagination.page-next')"
      ></a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {},
  props: {
    page: {
      type: Number,
      default: 1,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
  },
  emits: ['previous', 'next', 'change'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const pageNum = ref<number>(props.page)
    function change(): void {
      if (isNaN(pageNum.value) || pageNum.value <= 0 || pageNum.value > props.pageCount) {
        alert(t('ui.pv-pagination.alert'))
        return
      }
      emit('change', pageNum.value)
    }
    return { t, pageNum, change }
  },
})
</script>

<style lang="postcss" scoped></style>
