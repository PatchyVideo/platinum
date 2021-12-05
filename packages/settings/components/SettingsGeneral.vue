<template>
  <h2 class="text-2xl font-light" v-text="t('settings.general.quick-settings.name')"></h2>
  <div class="w-full h-px my-2 bg-gray-300"></div>
  <div><SColorTheme /></div>
  <h2 class="mt-6 text-2xl font-light" v-text="t('settings.general.general.name')"></h2>
  <div class="w-full h-px my-2 bg-gray-300"></div>
  <div><SLanguage /></div>
</template>

<script lang="ts" setup>
import SColorTheme from './appearance/SColorTheme.vue'
import SLanguage from './general/SLanguage.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
