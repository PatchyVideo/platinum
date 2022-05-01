<template>
  <h2 class="text-2xl font-light" v-text="t('settings.general.quick-settings.name')" />
  <div class="w-full h-px my-2 bg-gray-300" />
  <div><SColorTheme /></div>
  <h2 class="mt-6 text-2xl font-light" v-text="t('settings.general.general.name')" />
  <div class="w-full h-px my-2 bg-gray-300" />
  <div><SLanguage /></div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SColorTheme from './appearance/SColorTheme.vue'
import SLanguage from './general/SLanguage.vue'

const { t } = useI18n()
</script>
