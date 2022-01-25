<template>
  <h3 class="font-medium mb-1" v-text="t('settings.appearance.theme.color.name')"></h3>
  <div class="flex flex-row flex-wrap gap-4">
    <div
      class="w-full max-w-64 rounded-lg cursor-pointer select-none overflow-hidden border"
      :class="{
        'border-violet-400 dark:border-violet-500': themePreference !== 'system',
        'border-violet-300 dark:border-violet-400': themePreference === 'system',
      }"
      @click="changeTheme('system')"
    >
      <PreviewLight v-if="!isPreferredDark" />
      <PreviewDark v-else />
      <div
        class="px-2 pb-1 border-t"
        :class="{
          'border-violet-400 dark:border-violet-500 bg-gray-100 dark:bg-gray-800': themePreference !== 'system',
          'border-violet-300 dark:border-violet-400 bg-violet-50 dark:bg-gray-800': themePreference === 'system',
        }"
      >
        <div class="i-uil-desktop mr-1 text-lg"></div>
        <div class="inline-block align-middle">
          {{ t('darkmode.system') }} ({{ isPreferredDark ? t('darkmode.dark') : t('darkmode.light') }})
        </div>
      </div>
    </div>
    <div
      class="w-full max-w-64 rounded-lg cursor-pointer select-none overflow-hidden border"
      :class="{
        'border-violet-400 dark:border-violet-500': themePreference !== 'light',
        'border-violet-300 dark:border-violet-400': themePreference === 'light',
      }"
      @click="changeTheme('light')"
    >
      <PreviewLight />
      <div
        class="px-2 pb-1 border-t"
        :class="{
          'border-violet-400 dark:border-violet-500 bg-gray-100 dark:bg-gray-800': themePreference !== 'light',
          'border-violet-300 dark:border-violet-400 bg-violet-50 dark:bg-gray-800': themePreference === 'light',
        }"
      >
        <div class="i-uil-sun mr-1 text-lg"></div>
        <div class="inline-block align-middle" v-text="t('darkmode.light')"></div>
      </div>
    </div>
    <div
      class="w-full max-w-64 rounded-lg cursor-pointer select-none overflow-hidden border"
      :class="{
        'border-violet-400 dark:border-violet-500': themePreference !== 'dark',
        'border-violet-300 dark:border-violet-400': themePreference === 'dark',
      }"
      @click="changeTheme('dark')"
    >
      <PreviewDark />
      <div
        class="px-2 pb-1 border-t"
        :class="{
          'border-violet-400 dark:border-violet-500 bg-gray-100 dark:bg-gray-800': themePreference !== 'dark',
          'border-violet-300 dark:border-violet-400 bg-violet-50 dark:bg-gray-800': themePreference === 'dark',
        }"
      >
        <div class="i-uil-moon mr-1 text-lg"></div>
        <div class="inline-block align-middle" v-text="t('darkmode.dark')"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PreviewLight from '@/darkmode/components/PreviewLight.vue'
import PreviewDark from '@/darkmode/components/PreviewDark.vue'
import { usePreferredDark } from '@vueuse/core'
import { themePreference } from '@/darkmode'
import type { Themes } from '@/darkmode'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isPreferredDark = usePreferredDark()
const changeTheme = (theme: Themes) => {
  themePreference.value = theme
}
</script>
