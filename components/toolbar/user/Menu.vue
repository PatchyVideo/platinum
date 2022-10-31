<script lang="ts" setup>
const { t } = useI18n()
const { onLogout } = useApollo()
const auth = await useAuth()

// log out
const loggingOut = ref(false)
async function logout(): Promise<void> {
  loggingOut.value = true

  await onLogout()
  await auth.refresh()
  await refreshNuxtData()

  loggingOut.value = false
}
</script>

<template>
  <PNavPopover button-class="relative flex items-center">
    <template #button="{ open }">
      <UserAvatar
        class="w-10 h-10 rounded-full ring ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700"
        :alt="auth.username"
        :image="auth.image"
        :email="auth.email"
      />

      <template v-if="!open">
        <div class="sm:hidden absolute w-2 h-2 top-px right-px bg-rose-500 rounded-full animate-ping" />
        <div class="sm:hidden absolute w-2 h-2 top-px right-px bg-rose-500 rounded-full" />
      </template>
    </template>

    <div class="flex flex-col">
      <div class="flex my-2 px-4 gap-3 items-center">
        <UserAvatar
          class="w-12 h-12 rounded-full border border-white"
          :alt="auth.username"
          :image="auth.image"
          :email="auth.email"
        />
        <div>
          <div class="font-medium">
            {{ auth.username }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-200">
            {{ auth.email }}
          </div>
        </div>
      </div>

      <div class="w-full border-b-1 border-purple-300 dark:border-gray-600" />

      <NuxtLink
        class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
        :to="`/profile/${auth.uid}`"
      >
        <div class="i-uil:user text-lg" />
        个人中心
      </NuxtLink>

      <!-- <div class="w-full border-b-1 border-purple-200 border-dashed dark:border-gray-700" /> -->

      <!-- <NuxtLink
        class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
        to="/user/notification"
      >
        <div class="i-uil:envelope text-lg" />
        {{ t('common.nav-top.user.my-message') }}
        <span v-if="listNoteCountUnread" class="px-2 rounded-full text-white text-sm bg-red-500">
          {{ listNoteCountUnread > 99 ? '99+' : listNoteCountUnread }}
        </span>
      </NuxtLink> -->

      <div class="w-full border-b-1 border-purple-300 dark:border-gray-600" />

      <button
        class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
        @click="() => logout()"
      >
        <div class="i-uil:exit text-lg" />
        退出登录
        <div
          v-show="loggingOut"
          class="i-uil:spinner-alt text-lg animate-spin"
        />
      </button>
    </div>
  </PNavPopover>
</template>
