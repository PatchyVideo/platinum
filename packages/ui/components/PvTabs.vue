<template>
  <div class="w-full">
    <div
      class="
        w-full
        h-10
        bg-gray-50
        border border-solid border-gray-300
        flex flex-row
        justify-start
        items-center
        box-border
        overflow-x-auto overflow-y-hidden
      "
    >
      <div
        v-for="(tabPane, i) in tabPanes"
        :key="i"
        class="
          h-10
          px-4
          -ml-px
          flex flex-row
          justify-center
          items-center
          hover:cursor-pointer hover:text-blue-400
          select-none
          transition-colors
          duration-300
          border border-solid
          whitespace-nowrap
        "
        style="border-bottom-color: white; transition-property: color"
        :class="
          value === tabPane.name
            ? ['text-blue-400', 'bg-white', 'border-gray-300', 'border-white', 'box-content']
            : ['text-gray-400', 'border-transparent', 'box-border']
        "
        @click="$emit('update:value', tabPane.name)"
      >
        {{ tabPane.label }}
      </div>
    </div>
    <div class="w-full px-0 py-4 md:p-4">
      <!--box-border border-gray-300 border-l border-b border-r-->
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots, provide, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVModels } from '@vueuse/core'
const props = defineProps({
  value: {
    type: String,
    default: '',
  },
})
const emit = defineEmits<{
  (event: 'tab-click', value: string): void
  (event: 'update:value', value: string): void
}>()
const { t } = useI18n()
const { value } = useVModels(props, emit)
provide('selectedTab', toRef(props, 'value'))
const slots = useSlots()
const tabPanes: Array<{ label: string; name: string }> = computed(() => slots.default().map((item) => item.props))
</script>
