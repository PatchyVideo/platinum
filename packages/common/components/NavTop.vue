<template>
  <div>
    <!-- Top Nav -->
    <div
      class="h-auto p-1 flex items-center justify-between border-b border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-800 md:p-2"
    >
      <!-- Logo & Slide Button -->
      <div class="flex items-center flex-nowrap ml-2">
        <icon-uil-list-ul
          class="text-2xl cursor-pointer rounded-full transition-colors hover:bg-gray-200 hover:dark:bg-gray-900"
          @click="openDrawer()"
        />
        <logo class="cursor-pointer hidden md:inline-block" @click="toHome()"></logo>
      </div>
      <!-- Search Bar -->
      <template v-if="showSearchBar">
        <router-link to="/search-page" alt="mobile search button" class="md:hidden">
          <icon-uil-search class="inline" />
        </router-link>
        <AutoComplete class="hidden md:inline-block" @search="searchResult"></AutoComplete>
      </template>
      <!-- User -->
      <div v-if="!isLogin" class="mr-2">
        <a @click="isLogin = true">登录</a>
      </div>
      <div v-else class="mr-2">
        <img
          class="inline-block h-9 w-9 rounded-full ring-2 ring-white"
          src="/packages/common/assets/DefaultAvatar.jpg"
          alt=""
        />
      </div>
    </div>
    <!-- DrawerLayout -->
    <div>
      <!-- Drawer -->
      <div
        class="absolute inset-y-0 p-1 z-50 left-0 overflow-auto space-y-8 bg-white transform transition-transform duration-300 w-9/12 dark:bg-gray-700 md:w-auto md:p-2"
        :class="{ '-translate-x-full': !drawerOpen }"
      >
        <!-- Title & Slide Button -->
        <div class="flex items-center flex-nowrap">
          <icon-uil-list-ul class="text-2xl cursor-pointer" @click="hideDrawer()" />
          <logo class="md:mr-15" :show-icon="false"></logo>
        </div>
        <!-- Main List -->
        <div class="space-y-3">
          <router-link class="block" to=""
            ><icon-uil-home-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.mainMenu.home')
            }}</router-link
          >
          <router-link class="block" to=""
            ><icon-uil-play-circle class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.mainMenu.video')
            }}</router-link
          >
          <router-link class="block" to=""
            ><icon-uil-folder class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.mainMenu.list')
            }}</router-link
          >
          <router-link class="block" to=""
            ><icon-uil-chat class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.mainMenu.discussBoard')
            }}</router-link
          >
          <router-link class="block" to=""
            ><icon-uil-list-ol-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.mainMenu.Leaderboard')
            }}</router-link
          >
        </div>
        <!-- User List -->
        <div class="space-y-3">
          <router-link class="block" to=""
            ><icon-uil-upload class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.userOperation.postvideo')
            }}</router-link
          >
          <router-link class="block" to=""
            ><icon-uil-tag-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.userOperation.tag')
            }}</router-link
          >
          <a class="block" href="https://patchyvideo.wiki/" target="_blank" rel="noopener noreferrer"
            ><icon-carbon-wikis class="inline align-middle w-7 text-lg text-center" />{{
              t('common.navTop.mainMenu.wiki')
            }}</a
          >
        </div>
        <!-- Super Admin -->
        <div class="w-full space-y-2">
          <div class="text-gray-400 text-xs" v-text="t('common.navTop.admin.admin')"></div>
          <div v-text="t('common.navTop.admin.whoAmI')"></div>
          <router-link class="block" to="" v-text="t('common.navTop.admin.superAdmin')"></router-link>
        </div>
        <!-- Settings -->
        <div class="w-full space-y-2">
          <div class="text-gray-400 text-xs" v-text="t('common.navTop.settings.settings')"></div>
          <div class="flex justify-between items-center">
            <label class="space-x-2">
              <label v-text="t('common.navTop.settings.darkMode')"></label>
              <label class="bg-gray-600 text-white text-xs rounded-full px-1">Beta</label>
            </label>
            <pv-check-box v-model:check="isDark"></pv-check-box>
          </div>
          <div class="flex justify-between items-center">
            <label v-text="t('common.navTop.settings.lang')"></label>
            <pv-select v-model:selected="locale" :item-list="languageList"></pv-select>
          </div>
        </div>
      </div>
      <!-- Mask -->
      <transition name="mask">
        <div
          v-if="drawerOpen"
          class="absolute inset-0 bg-black bg-opacity-20 z-49"
          @click="hideDrawer()"
          @touchmove.prevent
        ></div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { isDark } from '@/darkmode'
import { locale } from '@/locales'
import { useI18n } from 'vue-i18n'
import Logo from '@/common/components/Logo.vue'
import AutoComplete from './AutoComplete.vue'
import PvSelect from './PvSelect.vue'
import PvCheckBox from './PvCheckBox.vue'

export default defineComponent({
  components: {
    Logo,
    AutoComplete,
    PvSelect,
    PvCheckBox,
  },
  props: {
    showSearchBar: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const { t } = useI18n()
    let isLogin = ref(false)

    // Drawer Operation
    let drawerOpen = ref<boolean | undefined>()
    function openDrawer(): void {
      drawerOpen.value = true
      window.document.body.style.overflow = 'hidden'
    }
    function hideDrawer(): void {
      drawerOpen.value = false
      window.document.body.style.overflow = 'visible'
    }

    // Search
    const router = useRouter()
    function searchResult(searchContent: string): void {
      router.push({ path: '/search-result', query: { i: searchContent } })
    }

    // Back to home page
    function toHome(): void {
      router.push({ path: '/' })
    }

    const languageList = [
      {
        name: '简体中文',
        value: 'zh-CN',
      },
      {
        name: 'English',
        value: 'en-US',
      },
    ]

    return {
      t,
      locale,
      isLogin,
      drawerOpen,
      openDrawer,
      hideDrawer,
      searchResult,
      toHome,
      isDark,
      languageList,
    }
  },
})
</script>

<style lang="postcss" scoped>
.mask-enter-active,
.mask-leave-active {
  @apply transition-all;
  @apply duration-200;
}
.mask-enter-from,
.mask-leave-to {
  @apply bg-opacity-0;
}
</style>
