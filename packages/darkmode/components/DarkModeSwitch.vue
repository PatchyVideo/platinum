<template>
  <div class="flex flex-row space-x-1 text-lg">
    <div :title="t('darkmode.system')">
      <IconUilDesktop
        class="cursor-pointer"
        :class="{ 'text-gray-400 dark:text-gray-600': themePreference !== 'system' }"
        @click="changeTheme('system')"
      />
    </div>
    <div :title="t('darkmode.light')">
      <IconUilSun
        class="cursor-pointer"
        :class="{ 'text-gray-400 dark:text-gray-600': themePreference !== 'light' }"
        @click="changeTheme('light')"
      />
    </div>
    <div :title="t('darkmode.dark')">
      <IconUilMoon
        class="cursor-pointer"
        :class="{ 'text-gray-400 dark:text-gray-600': themePreference !== 'dark' }"
        @click="changeTheme('dark')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { themePreference, Themes } from '..'

const { t } = useI18n()

const changeTheme = (theme: Themes) => {
  themePreference.value = theme
}
</script>
