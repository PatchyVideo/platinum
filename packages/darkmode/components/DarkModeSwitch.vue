<template>
  <div class="flex flex-row space-x-1 text-lg">
    <IconUilDesktop
      class="cursor-pointer"
      :class="{ 'text-gray-400 dark:text-gray-600': themePreference !== 'system' }"
      @click="changeTheme('system')"
    /><IconUilSun
      class="cursor-pointer"
      :class="{ 'text-gray-400 dark:text-gray-600': themePreference !== 'light' }"
      @click="changeTheme('light')"
    /><IconUilMoon
      class="cursor-pointer"
      :class="{ 'text-gray-400 dark:text-gray-600': themePreference !== 'dark' }"
      @click="changeTheme('dark')"
    />
  </div>
</template>

<script lang="ts" setup>
import { themePreference, Themes } from '..'

const changeTheme = (theme: Themes) => {
  themePreference.value = theme
}
</script>
