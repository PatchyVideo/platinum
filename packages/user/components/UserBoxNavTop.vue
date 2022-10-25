<template>
  <PvNavPopover
    button-class="relative flex items-center"
  >
    <template #button="{ open }">
      <UserAvatar
        class="w-9 h-9 rounded-full ring ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700"
        :title="auth.username"
        :image="auth.image"
        :email="auth.email"
      />
      <div
        v-if="!open && fetchNote && listNoteCountUnread"
        class="sm:hidden absolute -top-0.3 -right-0.5 bg-red-500 rounded-full p-1.5"
      />
    </template>

    <div class="flex flex-col">
      <div class="flex my-2 px-4 gap-3 items-center">
        <UserAvatar
          class="w-12 h-12 rounded-full border border-white"
          :title="auth.username"
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

      <RouterLink
        class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
        :to="`/user/${auth.uid}`"
      >
        <div class="i-uil:user text-lg" />
        个人中心
      </RouterLink>

      <template v-if="fetchNote">
        <div class="w-full border-b-1 border-purple-200 border-dashed dark:border-gray-700" />

        <RouterLink
          class="flex px-4 py-1.5 w-full items-center gap-2 hover:bg-purple-50 dark:hover:bg-indigo-800"
          to="/user/notification"
        >
          <div class="i-uil:envelope text-lg" />
          {{ t('common.nav-top.user.my-message') }}
          <span v-if="listNoteCountUnread" class="px-2 rounded-full text-white text-sm bg-red-500">
            {{ listNoteCountUnread > 99 ? '99+' : listNoteCountUnread }}
          </span>
        </RouterLink>
      </template>

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
  </PvNavPopover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { $fetch } from 'ohmyfetch'
import { useAuth } from '..'
import PvNavPopover from '@/ui/components/PvNavPopover.vue'
import UserAvatar from '@/user/components/UserAvatar.vue'

defineProps<{
  fetchNote: boolean
  listNoteCountUnread: number
}>()

const { t } = useI18n()
const auth = useAuth()

// log out
const loggingOut = ref(false)
async function logout(): Promise<void> {
  loggingOut.value = true
  await $fetch('https://patchyvideo.com/be/logout.do', {
    method: 'POST',
    credentials: 'include',
    body: {},
  })
  auth.refetch()
  loggingOut.value = false
}
</script>
