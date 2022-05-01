<template>
  <div class="w-full">
    <div class="text-center">
      <h1 class="text-xl dark:text-white" v-text="t('error-pages.N404.title')" />
      <div class="text-sm text-gray-600 dark:text-gray-300" v-text="fullPath" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const { fullPath } = useRoute()
</script>
