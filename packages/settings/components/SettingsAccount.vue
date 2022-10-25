<template>
  <h2 class="inline-block text-2xl font-light" v-text="t('settings.account.profile.name')" />
  <RouterLink
    class="ml-2 px-1 pb-0.5 rounded-lg border border-purple-400 dark:border-gray-600"
    :to="`/user/${auth.uid}`"
  >
    {{ t('common.nav-top.user.userprofile') }}
    <div class="i-uil:external-link-alt text-lg" />
  </RouterLink>
  <div class="w-full h-px my-2 bg-gray-300" />
  <div v-if="auth.isLogin" class="flex flex-col">
    <div>
      <div class="mb-1">
        <h3 class="font-medium" v-text="t('settings.account.profile.username.label')" />
        <div
          class="text-sm text-gray-600 dark:text-gray-300"
          v-text="t('settings.account.profile.username.desc')"
        />
      </div>
      <div
        class="w-full max-w-112 rounded-lg border border-purple-300 dark:border-gray-600 bg-white dark:bg-gray-800"
      >
        <input v-model="name" class="inline-block px-2 py-1 w-full rounded-lg outline-none dark:bg-gray-800">
      </div>
    </div>
    <div class="mt-4">
      <div class="mb-1">
        <h3 class="font-medium" v-text="t('settings.account.profile.description.label')" />
      </div>
      <div
        class="w-full max-w-112 rounded-lg border border-purple-300 dark:border-gray-600 bg-white dark:bg-gray-800"
      >
        <textarea
          v-model="desc"
          rows="4"
          class="inline-block px-2 py-1 w-full rounded-lg outline-none dark:bg-gray-800"
        />
      </div>
    </div>
  </div>
  <div v-else class="flex">
    <div class="mt-30vh mx-auto text-xl text-gray-600 dark:text-gray-300">
      <div class="inline-block align-middle" v-text="t('settings.account.loading')" />
      <div class="i-uil:spinner-alt text-2xl animate-spin" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/user'

const { t } = useI18n()
const auth = useAuth()

const name = ref('')
const desc = ref('')

watchEffect(() => {
  name.value = auth.username || ''
  desc.value = auth.desc || ''
})
</script>
