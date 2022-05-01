<template>
  <div class="mb-1">
    <h3 class="font-medium" v-text="t('common.nav-top.settings.lang')" />
    <div class="text-sm text-gray-600 dark:text-gray-300" v-text="t('settings.general.language.desc')" />
  </div>
  <PvSelect v-model:selected="locale" :item-list="languageList" />
  <div
    class="inline-block ml-2 text-sm text-gray-600 dark:text-gray-300"
    v-text="t('settings.general.language.browser-default', { preferred: browserPreferredLang })"
  />
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import PvSelect from '@/ui/components/PvSelect.vue'
import { getBrowserPreferredLang, languageList, locale } from '@/locales'

const { t } = useI18n()

const browserPreferredLang = languageList.find(({ value }) => value === getBrowserPreferredLang())!.name
</script>
