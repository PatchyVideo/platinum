<template>
  <div>
    <!-- Top Nav -->
    <div
      class="
        h-auto
        p-1
        flex
        items-center
        justify-between
        border-b border-gray-300
        bg-gray-50
        dark:bg-gray-700
        dark:border-gray-800
        md:p-2
      "
    >
      <!-- Logo & Slide Button -->
      <div class="flex items-center flex-nowrap ml-2">
        <icon-uil-list-ul
          class="text-2xl cursor-pointer rounded-full transition-colors hover:bg-gray-200 hover:dark:bg-gray-900"
          @click="drawerOpen = true"
        />
        <logo v-if="screenSizes.md" class="cursor-pointer inline-block" @click="toHome()"></logo>
      </div>
      <!-- Search Bar -->
      <template v-if="showSearchBar">
        <router-link v-if="screenSizes['<md']" to="/search-page" alt="mobile search button">
          <icon-uil-search class="inline" />
        </router-link>
        <AutoComplete v-else @search="searchResult"></AutoComplete>
      </template>
      <!-- User -->
      <div ref="userList" class="mr-2">
        <div v-if="isLogin === IsLogin.no">
          <router-link to="/user/login">{{ t('common.nav-top.user.login') }}</router-link>
        </div>
        <div v-else class="relative">
          <UserAvatar
            :title="user.name"
            :image="user.avatar"
            class="inline-block h-9 w-9 rounded-full ring-2 ring-white cursor-pointer"
            @click="userListOpen = true"
          ></UserAvatar>
          <!-- User List -->
          <transition name="userList">
            <div
              v-if="userListOpen"
              class="
                z-999
                absolute
                -right-2
                top-5
                w-40
                p-2
                mt-1/2
                rounded
                overflow-hidden
                bg-white
                border
                shadow
                overflow-visible
                dark:bg-gray-700
                dark:border-black
              "
            >
              <UserAvatar
                :title="user.name"
                :image="user.avatar"
                class="h-13 w-13 rounded-full ring-2 ring-white cursor-pointer absolute right-0 -top-5"
              ></UserAvatar>
              <div v-if="isLogin === IsLogin.yes" class="space-y-3">
                <div class="text-lg font-800 truncate w-25">{{ user.name }}</div>
                <router-link class="block text-center" to="/user/me">{{
                  t('common.nav-top.user.userprofile')
                }}</router-link>
                <div class="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500" @click="logout">
                  {{ t('common.nav-top.user.logout') }}
                </div>
              </div>
              <div v-else class="p-5">{{ t('common.nav-top.user.confirming') }}</div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <!-- DrawerLayout -->
    <div>
      <!-- Drawer -->
      <div
        class="
          absolute
          inset-y-0
          p-1
          z-50
          left-0
          overflow-auto
          space-y-8
          bg-white
          transform-gpu
          transition-transform
          duration-300
          w-9/12
          dark:bg-gray-700
          md:w-auto
          md:p-2
        "
        :class="{ '-translate-x-full': !drawerOpen }"
      >
        <!-- Title & Slide Button -->
        <div class="flex items-center flex-nowrap">
          <icon-uil-list-ul class="text-2xl cursor-pointer" @click="drawerOpen = false" />
          <logo class="md:mr-15 cursor-pointer" :show-icon="false" @click="toHome()"></logo>
        </div>
        <!-- Main List -->
        <div class="space-y-3">
          <router-link to="/" class="block"
            ><icon-uil-home-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.home')
            }}</router-link
          >
          <router-link to="/video-list" class="block"
            ><icon-uil-play-circle class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.video')
            }}</router-link
          >
          <router-link to="/playlist-list" class="block"
            ><icon-uil-folder class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.list')
            }}</router-link
          >
          <a class="block" @click="progressing()"
            ><icon-uil-chat class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.discuss-board')
            }}</a
          >
          <a class="block" @click="progressing()"
            ><icon-uil-list-ol-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.leaderboard')
            }}</a
          >
          <a class="block" href="https://patchyvideo.wiki/" target="_blank" rel="noopener noreferrer"
            ><icon-carbon-wikis class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.main-menu.wiki')
            }}</a
          >
        </div>
        <!-- User List -->
        <div v-if="isLogin === IsLogin.yes" class="space-y-3">
          <a class="block" @click="progressing()"
            ><icon-uil-upload class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.user-operation.postvideo')
            }}</a
          >
          <a class="block" @click="progressing()"
            ><icon-uil-tag-alt class="inline align-middle w-7 text-lg text-center" />{{
              t('common.nav-top.user-operation.tag')
            }}</a
          >
        </div>
        <div v-else-if="isLogin === IsLogin.loading">验证登录中...</div>
        <!-- Super Admin -->
        <div v-if="isLogin === IsLogin.yes && user.isAdmin" class="w-full space-y-2">
          <div class="text-gray-400 text-xs" v-text="t('common.nav-top.admin.admin')"></div>
          <div v-text="t('common.nav-top.admin.who-am-I')"></div>
          <a class="block" v-text="t('common.nav-top.admin.super-admin')"></a>
        </div>
        <!-- Settings -->
        <div class="w-full space-y-2">
          <div class="text-gray-400 text-xs" v-text="t('common.nav-top.settings.settings')"></div>
          <div class="flex justify-between items-center">
            <label class="space-x-2">
              <label v-text="t('common.nav-top.settings.darkmode')"></label>
              <label class="bg-gray-600 text-white text-xs rounded-full px-1">Beta</label>
            </label>
            <pv-check-box v-model:check="isDark"></pv-check-box>
          </div>
          <div class="flex justify-between items-center">
            <label v-text="t('common.nav-top.settings.lang')"></label>
            <pv-select v-model:selected="locale" :item-list="languageList"></pv-select>
          </div>
        </div>
      </div>
      <!-- Mask -->
      <transition name="mask">
        <div
          v-if="drawerOpen"
          class="absolute inset-0 bg-black bg-opacity-20 z-49"
          @click="drawerOpen = false"
          @touchmove.prevent
        ></div>
      </transition>
    </div>
  </div>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="hidden invisible" v-html="hiddenStyle"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { isDark } from '@/darkmode'
import { locale, messages } from '@/locales'
import { screenSizes } from '@/tailwindcss'
import { useI18n } from 'vue-i18n'
import { progressing } from '@/common/lib/progressing'
import { user, isLogin, IsLogin, clearUserDataFromLocalStorage } from '@/user'
import Logo from '@/common/components/Logo.vue'
import AutoComplete from '@/search/components/AutoComplete.vue'
import PvSelect from '@/ui/components/PvSelect.vue'
import PvCheckBox from '@/ui/components/PvCheckBox.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'

export default defineComponent({
  components: {
    Logo,
    AutoComplete,
    PvSelect,
    PvCheckBox,
    UserAvatar,
  },
  props: {
    showSearchBar: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const { t } = useI18n()

    /* User list Operation */
    const userListOpen = ref<boolean>(false)
    const userList = ref<HTMLDivElement | null>(null)
    const userListListener = (e: MouseEvent): void => {
      if (!userList.value?.contains(e.target as HTMLElement)) {
        userListOpen.value = false
      }
    }
    onMounted((): void => {
      document.addEventListener('click', userListListener)
    })
    onUnmounted((): void => {
      document.removeEventListener('click', userListListener)
    })

    /* Drawer Operation */
    const drawerOpen = ref<boolean | undefined>()
    const hiddenStyle = computed(() => (drawerOpen.value ? '<style>body{overflow:hidden;}</style>' : ''))

    /* Search */
    const router = useRouter()
    function searchResult(searchContent: string): void {
      router.push({ path: '/search-result', query: { i: searchContent } })
    }

    /* Back to home page */
    function toHome(): void {
      router.push({ path: '/' })
    }

    /* Log out */
    async function logout(): Promise<void> {
      await fetch('https://patchyvideo.com/be/logout.do', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({}),
        credentials: 'include',
      })
      clearUserDataFromLocalStorage()
      location.reload()
    }

    const languageList = Object.entries(messages).map(([k, v]) => ({ name: v?._info?.name ?? k, value: k }))

    return {
      t,
      locale,
      screenSizes,
      isDark,
      languageList,
      user,
      userList,
      userListOpen,
      isLogin,
      IsLogin,
      drawerOpen,
      searchResult,
      toHome,
      logout,
      progressing,
      hiddenStyle,
    }
  },
})
</script>

<style lang="postcss" scoped>
.mask-enter-active,
.mask-leave-active {
  @apply transition-all duration-200;
}
.mask-enter-from,
.mask-leave-to {
  @apply bg-opacity-0;
}
.userList-enter-active,
.userList-leave-active {
  transition: opacity 0.2s ease;
}

.userList-enter-from,
.userList-leave-to {
  opacity: 0;
}
</style>
