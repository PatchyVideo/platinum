<script lang="ts" setup>
import { MessageTransitionDuration, fullMessageOptions, handleCloseMessage } from '@/composables/message'
</script>

<template>
  <div>
    <TransitionGroup name="message-transition">
      <div
        v-for="(options, i) in fullMessageOptions"
        :key="options.id"
        class="message min-w-90 max-w-100vw min-h-7 fixed left-1/2 -translate-x-1/2 py-2 px-5 rounded-md flex justify-center items-center z-51 transition-all"
        :style="{
          'transition-timing-function': 'ease',
          'transition-duration': `${MessageTransitionDuration.toString()}ms`,
          'background-color': options.bgColor,
          'border-color': options.borderColor,
          'color': options.color,
          'top': `${options.offset && 20 + 50 * i}px`,
        }"
      >
        <div class="flex justify-center items-center space-x-2">
          <div :class="options.icon" />
          <div :style="{ textAlign: options.center ? 'center' : 'inherit' }">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="options.dangerouslyUseHTMLString" v-html="options.message" />
            <div v-else>
              {{ options.message }}
            </div>
          </div>
        </div>
        <div
          v-if="options.showClose"
          class="absolute -right-2.5 -top-2 z-53 rounded-full hover:cursor-pointer hover:text-gray-600 text-gray-400 border"
          :style="{
            'background-color': options.bgColor,
            'border-color': options.color,
          }"
          @click="handleCloseMessage(options)"
        >
          <div class="w-5 h-4 i-uil:times" />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="postcss" scoped>
.message-transition-enter-from,
.message-transition-leave-to {
  opacity: 0;
  transform: translate(-50%, -75%);
}
.message-transition-enter-active,
.message-transition-leave-active {
  transition: all 300ms;
}
.message-transition-enter-to,
.message-transition-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
