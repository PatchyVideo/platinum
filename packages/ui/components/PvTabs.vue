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
        rounded-lg
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
          rounded-lg
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
      <slot :name="value"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  value: string
  tabPanes: {
    name: string
    label: string
  }[]
}>()

const emit = defineEmits<{
  (event: 'tab-click', value: string): void
  (event: 'update:value', value: string): void
}>()

const { t } = useI18n()
const value = useVModel(props, 'value', emit, { passive: true })
</script>
