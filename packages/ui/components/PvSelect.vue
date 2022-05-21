<template>
  <Listbox v-slot="{ open }" v-model="modelValue">
    <!-- TODO remove this -->
    <div class="hidden" :data-todo="updateOpen(open)" />

    <div ref="rootEl" class="mt-1" :class="props.class">
      <ListboxButton
        class="focus:outline-none relative w-full py-0.5 pl-4 pr-8 rounded-full text-left shadow-sm ring-1 ring-purple-300 ring-opacity-75 dark:ring-gray-700 focus-visible:ring-offset-1 focus-visible:ring-offset-purple-400 dark:focus-visible:ring-offset-gray-500"
      >
        <span class="block truncate">{{ find(modelValue) }}</span>
        <span class="pointer-events-none absolute flex inset-y-0 right-0 pr-2 items-center">
          <span
            class="i-uil:angle-down w-5 h-5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': open }"
            aria-hidden="true"
          />
        </span>
      </ListboxButton>

      <Teleport to="body">
        <div
          ref="optionsEl"
          class="z-51 fixed max-h-60 -mx-1 pt-1 pb-2 px-1 rounded-md overflow-hidden"
          :style="{
            top: `${optionsTop}px`,
            left: `${optionsLeft}px`,
            width: `calc(${rootPos.width.value}px + 0.5rem)`,
          }"
        >
          <Transition
            enter-active-class="transition ease-out duration-100 transform"
            enter-from-class="-translate-y-2/3 opacity-40"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition ease-out duration-100 transform"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-2/3 opacity-0"
          >
            <ListboxOptions
              class="focus:outline-none w-full rounded-md overflow-auto text-base shadow-lg ring-1 ring-gray-500 ring-opacity-10 bg-white dark:bg-gray-800"
            >
              <ListboxOption
                v-for="item in itemList"
                v-slot="{ active, selected }"
                :key="item.value"
                :value="item.value"
                as="template"
              >
                <li
                  class="relative py-1 pl-8 pr-4 cursor-pointer select-none"
                  :class="active ? 'bg-purple-50 text-purple-900 dark:bg-indigo-900 dark:text-purple-50' : 'text-gray-900 dark:text-gray-100'"
                >
                  <span
                    class="block truncate"
                    :class="selected ? 'font-medium' : 'font-normal'"
                  >{{ item.name }}</span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-purple-600 dark:text-purple-300"
                  ><span class="i-uil:check h-4 w-4" aria-hidden="true" /></span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </Transition>
        </div>
      </Teleport>
    </div>
  </Listbox>
</template>

<script lang="ts" setup>
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { useI18n } from 'vue-i18n'
import { useElementBounding, useVModel } from '@vueuse/core'
import { computed, ref, shallowRef, watch } from 'vue'

interface SelectList {
  name: string
  value: string
}

const props = defineProps<{
  itemList: SelectList[]
  modelValue: string
  class?: string
}>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const { t } = useI18n()

const modelValue = useVModel(props, 'modelValue', emit)

const rootEl = shallowRef<HTMLDivElement | null>()
const optionsEl = shallowRef<HTMLDivElement | null>()

const rootPos = useElementBounding(rootEl, { immediate: true })

const diaOpen = ref(false)
const updateOpen = (n: boolean) => {
  diaOpen.value = n
}
watch(diaOpen, () => {
  rootPos.update()
}, { flush: 'pre' })

const optionsTop = computed(() => rootPos.top.value + rootPos.height.value)
const optionsLeft = computed(() => rootPos.left.value)

const find = (value: string) => {
  return props.itemList.find(item => item.value === value)?.name || t('ui.pv-select.select')
}
</script>
