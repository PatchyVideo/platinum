<template>
  <h2 class="text-2xl font-light" v-text="t('settings.appearance.theme.name')" />
  <div class="w-full h-px my-2 bg-gray-300" />
  <div><SColorTheme /></div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SColorTheme from './appearance/SColorTheme.vue'

const { t } = useI18n()
</script>
