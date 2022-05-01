<template>
  <h2 class="text-2xl font-light" v-text="t('settings.general.general.name')" />
  <div class="w-full h-px my-2 bg-gray-300" />
  <div>
    <SLanguage />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SLanguage from './general/SLanguage.vue'

const { t } = useI18n()
</script>
