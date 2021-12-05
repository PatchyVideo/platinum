<template>
  <h2 class="text-2xl font-light" v-text="t('settings.appearance.theme.name')"></h2>
  <div class="w-full h-px my-2 bg-gray-300"></div>
  <div><SColorTheme /></div>
</template>

<script lang="ts" setup>
import SColorTheme from './appearance/SColorTheme.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
