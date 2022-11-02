<script lang="ts" setup>
import type { GlobalComponents } from 'vue'

const props = defineProps<{
  buttonClass?: string
  panelClass?: string
}>()

const buttonComp = shallowRef<InstanceType<GlobalComponents['HPopoverButton']> | null>(null)
const buttonEl = computed<HTMLButtonElement | null>(() => buttonComp.value?.$el)
const panelEl = shallowRef<HTMLDivElement | null>(null)

const { width: windowWidth } = useWindowSize()
const { x: buttonX, right: buttonRight, width: buttonWidth } = useElementBounding(buttonEl)
const { width: panelWidth } = useElementSize(panelEl)

const buttonFromRight = computed(() => windowWidth.value - buttonRight.value)
const panelRight = computed(() =>
  Math.min(
    Math.max(
      buttonWidth.value / 2 - panelWidth.value / 2,
      6 - buttonFromRight.value,
    ),
    buttonX.value - panelWidth.value - 6,
  ))
const arrowRight = computed(() => buttonWidth.value / 2 - panelRight.value - 4)
</script>

<template>
  <HPopover v-slot="{ open }" class="relative">
    <HPopoverButton ref="buttonComp" class="focus:outline-none" :class="buttonClass">
      <slot name="button" :open="open" />
    </HPopoverButton>

    <Transition
      enter-active-class="transform transition duration-100 ease-out"
      enter-from-class="scale-95 -translate-y-1/20 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transform transition duration-75 ease-out"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 -translate-y-1/20 opacity-0"
    >
      <div v-show="open" ref="panelEl" class="panel z-50 absolute w-max" :style="{ right: `${panelRight}px` }">
        <HPopoverPanel static>
          <div
            class="mt-1.5 rounded-lg border-2 border-purple-300 shadow-md bg-white overflow-hidden dark:bg-gray-900 dark:border-gray-600"
            :class="panelClass"
          >
            <slot :open="open" />
          </div>
        </HPopoverPanel>
      </div>
    </Transition>
  </HPopover>
</template>

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
