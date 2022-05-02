<template>
  <div>
    <div class="mb-1">
      <h3 class="font-medium" v-text="t('common.nav-top.settings.lang')" />
      <div class="text-sm text-gray-600 dark:text-gray-300" v-text="t('settings.general.language.desc')" />
    </div>
    <div class="flex flex-row flex-nowrap items-center gap-2">
      <PvSelect v-model="locale" :item-list="languageList" />
      <div
        class="text-sm text-gray-600 dark:text-gray-300"
        v-text="t('settings.general.language.browser-default', { preferred: browserPreferredLang })"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import PvSelect from '@/ui/components/PvSelect.vue'
import { getBrowserPreferredLang, languageList, locale } from '@/locales'

const { t } = useI18n()

const browserPreferredLang = languageList.find(({ value }) => value === getBrowserPreferredLang())!.name
</script>
