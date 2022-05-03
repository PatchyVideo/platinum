<template>
  <LayoutDefault :show-search-bar="false">
    <div class="pt-26 pb-30 text-center">
      <h3 class="text-lg font-semibold p-4 px-auto">
        {{ `PatchyVideo | ${t('search.search-page.search')}` }}
      </h3>
      <AutoComplete class="inline-block w-4/5" @search="searchResult" />
    </div>
  </LayoutDefault>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AutoComplete from '@/search/components/AutoComplete.vue'
import { setSiteTitle } from '@/common/libs/setSiteTitle'

const { t } = useI18n()
setSiteTitle(`${t('search.search-page.title')} - PatchyVideo`)

// Search
const router = useRouter()
function searchResult(searchContent: string): void {
  router.push({ path: '/search-result', query: { i: searchContent } })
}
</script>
