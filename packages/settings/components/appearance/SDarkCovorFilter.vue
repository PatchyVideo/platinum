<template>
  <div>
    <div class="flex flex-row flex-nowrap items-center gap-4">
      <h3 class="font-medium" v-text="t('settings.appearance.theme.dark-cover-filter.name')" />
      <PvSwitch v-model="filter" size="sm" />
    </div>
    <div class="text-sm text-gray-600 dark:text-gray-300" v-text="t('settings.appearance.theme.dark-cover-filter.desc')" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import PvSwitch from '@/ui/components/PvSwitch.vue'
import { useThemeDarkCoverFilter } from '@/settings'

const { t } = useI18n()

const filter = useThemeDarkCoverFilter()
</script>
