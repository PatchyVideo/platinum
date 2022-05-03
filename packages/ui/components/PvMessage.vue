<template>
  <div>
    <TransitionGroup name="pv-message-transition">
      <div
        v-for="(options, i) in fullMessageOptions"
        :key="options.id"
        class="pv-message fixed left-1/2 -translate-x-1/2 p-4 pl-5 border border-purple-400 rounded-md border-solid flex flex-row justify-between items-center z-50 overflow-hidden transition-all h-20"
        :style="{
          'transition-timing-function': 'ease',
          'transition-duration': `${PvMessageTransitionDuration.toString()}ms`,
          'background-color': options.bgColor,
          'border-color': options.borderColor,
          'color': options.color,
          'min-width': '320px',
          'top': `${options.offset ?? 0 + 110 * i}px`,
        }"
      >
        <div class="relative flex flex-row justify-start items-center" :class="{ 'mr-6': options.showClose }">
          <div class="absolute top-1/2 -translate-y-1/2 left-0" :class="options.icon" />
          <div class="ml-6 w-auto inline-block" :style="{ textAlign: options.center ? 'center' : 'inherit' }">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="options.dangerouslyUseHTMLString" v-html="options.message" />
            <div v-else>
              {{ options.message }}
            </div>
          </div>
        </div>
        <div
          v-if="options.showClose"
          class="i-uil:times absolute top-1/2 -translate-y-1/2 right-4 hover:cursor-pointer hover:text-gray-600 text-gray-400 transition-all duration-300"
          @click="handleCloseMessage(options)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { PvMessageTransitionDuration, fullMessageOptions, handleCloseMessage } from '@/ui/libs/PvMessage'
</script>

<style lang="postcss" scoped>
.pv-message-transition-enter-from,
.pv-message-transition-leave-to {
  opacity: 0;
  transform: translate(-50%, -75%);
}
.pv-message-transition-enter-active,
.pv-message-transition-leave-active {
  transition: all 300ms;
}
.pv-message-transition-enter-to,
.pv-message-transition-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
