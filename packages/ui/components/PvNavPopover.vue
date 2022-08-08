<template>
  <Popover v-slot="{ open }">
    <PopoverButton ref="buttonComp" class="focus:outline-none" :class="buttonClass">
      <slot name="button" :open="open" />
    </PopoverButton>

    <Transition
      enter-active-class="transform transition duration-100 ease-out"
      enter-from-class="scale-95 -translate-y-1/20 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transform transition duration-75 ease-out"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 -translate-y-1/20 opacity-0"
    >
      <div v-show="open" ref="panelEl" class="panel z-50 absolute" :style="{ right: `${panelRight}px` }">
        <PopoverPanel static>
          <div class="mt-1.5 rounded-lg border-2 border-purple-300 shadow-md bg-white dark:bg-gray-900 dark:border-gray-600" :class="panelClass">
            <slot :open="open" />
          </div>
        </PopoverPanel>
      </div>
    </Transition>
  </Popover>
</template>

<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useElementBounding, useElementSize } from '@vueuse/core'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

defineProps<{
  buttonClass?: string
  panelClass?: string
}>()

const buttonComp = shallowRef<InstanceType<typeof PopoverButton> | null>(null)
const buttonEl = computed<HTMLButtonElement | null>(() => buttonComp.value?.$el)
const panelEl = shallowRef<HTMLDivElement | null>(null)

const { x: buttonX, width: buttonWidth } = useElementBounding(buttonEl)
const { width: panelWidth } = useElementSize(panelEl)

const buttonCenterRight = computed(() => window.innerWidth - buttonX.value - buttonWidth.value / 2)
const panelRight = computed(() => Math.max(buttonCenterRight.value - panelWidth.value / 2, 6))
const arrowRight = computed(() => buttonCenterRight.value - panelRight.value - 4)
</script>

<style scoped>
.panel::after {
  content: " ";
  width: 0.5rem;
  height: 0.5rem;
  transform: rotate(45deg);
  background: white;
  border-top: 2px solid theme('colors.purple.300');
  border-left: 2px solid theme('colors.purple.300');
  position: absolute;
  top: 3px;
  right: v-bind("`${arrowRight}px`");
}

.dark .panel::after {
  background: theme('colors.gray.900');
  border-top: 2px solid theme('colors.gray.600');
  border-left: 2px solid theme('colors.gray.600');
}
</style>
