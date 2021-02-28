<template>
  <div>
    <!-- Top Nav -->
    <div
      class="h-auto flex items-center justify-between border-b border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-800 md:p-2"
    >
      <!-- Logo & Slide Button -->
      <div class="flex items-center flex-nowrap ml-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="38"
          viewBox="0 0 24 24"
          class="fill-current cursor-pointer rounded-full transition-colors hover:bg-gray-200 hover:dark:bg-gray-900"
          @click="openDrawer()"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
        </svg>
        <logo class="hidden md:inline-block"></logo>
      </div>
      <!-- Search Bar -->
      <div v-if="showSearchBar">
        <router-link to="/search-page">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="black"
            width="30px"
            height="30px"
            class="fill-current inline md:hidden"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </router-link>
        <AutoComplete class="hidden md:inline-block" @search="searchResult"></AutoComplete>
      </div>
      <!-- User -->
      <div v-if="!isLogin" class="space-x-4 mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" class="fill-current inline ml-2">
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z"
          />
        </svg>
      </div>
      <div v-else class="space-x-4 mr-2">
        <button>freesia</button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          enable-background="new 0 0 24 24"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          class="inline fill-current cursor-pointer"
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
        class="absolute inset-y-0 p-1 z-50 left-0 overflow-auto space-y-8 bg-white transform transition-transform duration-300 w-9/12 dark:bg-gray-700 md:w-auto md:p-2"
        :class="{ '-translate-x-full': !drawerOpen }"
      >
        <!-- Title & Slide Button -->
        <div class="flex items-center flex-nowrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="38"
            viewBox="0 0 24 24"
            class="fill-current cursor-pointer"
            @click="hideDrawer()"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" />
          </svg>
          <logo class="md:mr-15" :show-icon="false"></logo>
        </div>
        <!-- Main List -->
        <div class="space-y-3">
          <router-link class="block" :to="item.href" v-for="item in mainList" :key="item.name"
            ><i class="align-middle w-7 text-lg text-center" :class="item.iconClass"></i>{{ item.name }}</router-link
          >
        </div>
        <!-- User List -->
        <div class="space-y-3">
          <router-link class="block" :to="item.href" v-for="item in userList" :key="item.name"
            ><i class="align-middle w-7 text-lg text-center" :class="item.iconClass"></i>{{ item.name }}</router-link
          >
          <a class="block" href="https://patchyvideo.wiki/" target="_Blank"
            ><i class="fab fa-battle-net align-middle w-7 text-lg text-center"></i
            >{{ t('common.navTop.mainMenu.wiki') }}</a
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

    const mainList = [
      {
        iconClass: 'fas fa-archway',
        name: t('common.navTop.mainMenu.home'),
        href: '',
      },
      {
        iconClass: 'fas fa-caret-square-right',
        name: t('common.navTop.mainMenu.video'),
        href: '',
      },
      {
        iconClass: 'fas fa-folder',
        name: t('common.navTop.mainMenu.list'),
        href: '',
      },
      {
        iconClass: 'fas fa-chalkboard',
        name: t('common.navTop.mainMenu.discussBoard'),
        href: '',
      },
      {
        iconClass: 'fas fa-crown',
        name: t('common.navTop.mainMenu.Leaderboard'),
        href: '',
      },
    ]
    const userList = [
      {
        iconClass: 'fas fa-long-arrow-alt-up',
        name: t('common.navTop.userOperation.postvideo'),
        href: '',
      },
      {
        iconClass: 'fas fa-bookmark',
        name: t('common.navTop.userOperation.tag'),
        href: '',
      },
    ]
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
      isDark,
      mainList,
      userList,
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
