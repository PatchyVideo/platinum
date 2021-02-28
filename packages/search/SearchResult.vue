<template>
  <div class="dark:bg-gray-700">
    <nav-top :show-search-bar="false"></nav-top>
    <div class="text-center">
      <h3 class="text-lg font-semibold p-4 px-auto">
        {{ '搜索结果 - ' + query.i }}
      </h3>
      <auto-complete class="md:hidden" size="mobile" :keyword="query.i"></auto-complete>
      <auto-complete class="hidden md:inline-block" :keyword="query.i"></auto-complete>
    </div>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import AutoComplete from '@/common/components/AutoComplete.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { NavTop, AutoComplete, Footer },
  props: {},
  setup() {
    const { t } = useI18n()
    const query = computed(() => useRoute().query)
    // change title
    document.title = (t('search.title') + query.value.i) as string
    return { t, query }
  },
})
</script>

<style lang="postcss" scoped></style>
