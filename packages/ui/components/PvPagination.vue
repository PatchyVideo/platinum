<template>
  <div v-if="pageCount - 1">
    <!-- Mobile View -->
    <div class="border-t-1 pt-1 flex-1 flex justify-between items-center">
      <a
        v-if="page != 1"
        class="
          inline-flex
          items-center
          px-4
          py-2
          border border-gray-300
          text-sm
          font-medium
          rounded-lg
          hover:text-gray-500
          dark:bg-gray-600
          dark:border-gray-700
          dark:hover:bg-black
        "
        @click="$emit('previous')"
      >
        {{ t('ui.pv-pagination.page-previous') }}
      </a>
      <div>
        <label>
          {{ t('ui.pv-pagination.page-number1') }}
        </label>
        <input
          v-model="pageNum"
          class="w-12 border rounded-md border-gray-400 p-1 shadow-inner dark:bg-gray-500"
          @keydown.enter="change"
        />
        <label>{{ '/' + pageCount + t('ui.pv-pagination.page-number2') }}</label>
      </div>
      <a
        v-if="page != pageCount"
        class="
          inline-flex
          items-center
          px-4
          py-2
          border border-gray-300
          text-sm
          font-medium
          rounded-lg
          hover:text-gray-500
          dark:bg-gray-600
          dark:border-gray-700
          dark:hover:bg-black
        "
        @click="$emit('next')"
      >
        {{ t('ui.pv-pagination.page-next') }}
      </a>
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
