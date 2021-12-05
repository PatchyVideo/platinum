<template>
  <div class="mb-1">
    <h3 class="font-medium" v-text="t('common.nav-top.settings.lang')"></h3>
    <div class="text-sm text-gray-600 dark:text-gray-300" v-text="t('settings.general.language.desc')"></div>
  </div>
  <PvSelect v-model:selected="locale" :item-list="languageList" />
  <div
    class="inline-block ml-2 text-sm text-gray-600 dark:text-gray-300"
    v-text="t('settings.general.language.browser-default', { preferred: browserPreferredLang })"
  ></div>
</template>

<script lang="ts" setup>
import PvSelect from '@/ui/components/PvSelect.vue'
import { getBrowserPreferredLang, locale, messages } from '@/locales'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const languageList = Object.entries(messages).map(([k, v]) => ({
  name: (v as { _info?: { name?: string } })?._info?.name ?? k,
  value: k,
}))
const browserPreferredLang = languageList.find(({ value }) => value === getBrowserPreferredLang())!.name
</script>
