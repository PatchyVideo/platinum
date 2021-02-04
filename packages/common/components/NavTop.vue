<template>
  <div>
    <!-- Top Nav -->
    <div
      class="h-auto flex items-center justify-between p-2 border-b border-gray-300 bg-baseWhite dark:text-textWhite dark:bg-baseDark dark:border-gray-800"
    >
      <!-- Title & Slide Button -->
      <div class="flex flex-nowrap ml-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="28"
          viewBox="0 0 28 28"
          width="28"
          class="fill-current cursor-pointer"
          @click="openDrawer()"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
        </svg>
        <div class="text-lg font-semibold px-auto">PatchyVideo</div>
      </div>
      <!-- Search Bar -->
      <div class="dark:bg-gray-700">
        <div
          class="shadow rounded-full max-w-2xl min-w-2xl mx-auto h-9 text-center overflow-hidden bg-white dark:bg-gray-800"
        >
          <input
            class="min-w-300 inline-block w-full h-full mx-8 outline-none dark:bg-gray-800 dark:text-white"
            placeholder="search!"
          />
        </div>
      </div>
      <!-- User -->
      <div v-if="!isLogin" class="space-x-4 mr-2">
        <button @click="isLogin = !isLogin">登录</button>
        <button>注册</button>
      </div>
      <div v-else class="space-x-4 mr-2">
        <button>freesia</button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          enable-background="new 0 0 24 24"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          class="inline cursor-pointer"
        >
          <g><path d="M0,0h24v24H0V0z" fill="none" /></g>
          <g>
            <path
              d="M12,18.5c0.83,0,1.5-0.67,1.5-1.5h-3C10.5,17.83,11.17,18.5,12,18.5z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10 c5.52,0,10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8c4.41,0,8,3.59,8,8S16.41,20,12,20z M16,11.39 c0-2.11-1.03-3.92-3-4.39V6.5c0-0.57-0.43-1-1-1s-1,0.43-1,1V7c-1.97,0.47-3,2.27-3,4.39V14H7v2h10v-2h-1V11.39z M14,14h-4v-3 c0-1.1,0.9-2,2-2s2,0.9,2,2V14z"
            />
          </g>
        </svg>
      </div>
    </div>
    <!-- DrawerLayout -->
    <div>
      <!-- Drawer -->
      <div
        class="drawer absolute inset-y-0 w-2/12 z-50 overflow-auto bg-white dark:text-textWhite dark:bg-baseDark"
        :class="{ 'drawer-open': drawerOpen }"
      >
        <!-- Title & Slide Button -->
        <div class="flex flex-nowrap ml-2 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="28"
            viewBox="0 0 28 28"
            width="28"
            class="fill-current cursor-pointer"
            @click="hideDrawer()"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
          </svg>
          <div class="text-lg font-semibold px-auto">PatchyVideo</div>
        </div>
        <!-- Main Menu -->
        <div></div>
      </div>
      <!-- Mask -->
      <transition name="mask">
        <div v-if="drawerOpen" class="absolute inset-0 bg-black bg-opacity-20" @click="hideDrawer()"></div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
// import { isDark } from '@/darkmode'
// import { useI18n } from 'vue-i18n'
// import { locale } from '@/locales'

export default defineComponent({
  props: {},
  setup() {
    let isLogin = ref(false)
    let drawerOpen = ref(false)
    function openDrawer(): void {
      drawerOpen.value = true
      window.document.body.style.overflow = 'hidden'
    }
    function hideDrawer(): void {
      drawerOpen.value = false
      window.document.body.style.overflow = 'visible'
    }
    return {
      isLogin,
      drawerOpen,
      openDrawer,
      hideDrawer,
      // isDark,
    }
  },
})
</script>

<style lang="postcss" scoped>
.drawer {
  transition: left 0.2s ease;
  @apply -left-2/12;
}
.drawer-open {
  @apply left-0;
}
.mask-enter-active,
.mask-leave-active {
  transition: all 0.2s ease;
}
.mask-enter-from,
.mask-leave-to {
  @apply bg-opacity-0;
}
</style>
