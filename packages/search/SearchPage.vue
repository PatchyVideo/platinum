<template>
  <div class="bg-pink-50 dark:bg-gray-700">
    <NavTop :show-search-bar="false"></NavTop>
    <div class="pt-26 pb-30 text-center">
      <h3 class="text-lg font-semibold p-4 px-auto">
        {{ 'PatchyVideo | ' + t('common.autoComplete.search') }}
      </h3>
      <AutoComplete size="mobile" class="inline-block" @search="searchResult"></AutoComplete>
    </div>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import AutoComplete from '@/search/components/AutoComplete.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { NavTop, AutoComplete, Footer },
  props: {},
  setup() {
    const { t } = useI18n()

    // Search
    const router = useRouter()
    function searchResult(searchContent: string): void {
      router.push({ path: '/search-result', query: { i: searchContent } })
    }

    return { t, searchResult }
  },
})
</script>

<style lang="postcss" scoped></style>
