<template>
  <div class="w-full">
    <TabGroup :selected-index="selectedIndex" @change="(i) => selectedIndex = i">
      <TabList class="flex p-1 gap-x-1 rounded-xl bg-purple-100 dark:bg-gray-800">
        <Tab
          v-for="tab in tabs"
          :key="tab.name"
          v-slot="{ selected }"
          as="template"
        >
          <button
            class="focus:outline-none py-2 px-4 rounded-lg leading-5 transition-colors focus:ring-1 focus:ring-white focus:ring-opacity-60 focus:ring-offset-1 focus:ring-offset-purple-300 dark:focus:ring-offset-indigo-800"
            :class="selected
              ? 'text-purple-800 bg-white shadow dark:text-white dark:bg-gray-600'
              : 'text-purple-600 hover:text-purple-700 hover:bg-white/70 dark:text-gray-200 dark:hover:text-white dark:hover:bg-white/15'"
            v-text="tab.label"
          />
        </Tab>
      </TabList>

      <TabPanels class="mt-2">
        <TabPanel v-for="tab in tabs" :key="tab.name" :name="tab.name">
          <slot :name="tab.name" />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script lang="ts" setup>
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import { useVModel } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  tabs: {
    name: string
    label: string
  }[]
}>()
const emit = defineEmits<{
  (event: 'tab-click', value: string): void
  (event: 'update:modelValue', value: string): void
}>()

const modelValue = useVModel(props, 'modelValue', emit, { passive: true })
const selectedIndex = computed<number>({
  get() {
    const index = props.tabs.findIndex(tab => tab.name === modelValue.value)
    return index === -1 ? 0 : index
  },
  set(value) {
    modelValue.value = props.tabs[value].name
  },
})
</script>
