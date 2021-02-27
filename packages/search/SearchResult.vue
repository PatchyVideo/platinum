<template>
  <div class="bg-pink-50 dark:bg-gray-700">
    <nav-top :show-search-bar="false"></nav-top>
    <div class="pt-26 pb-30 text-center">搜索结果页面</div>
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
    const resultKey = computed(() => useRoute().query)
    // change title
    document.title = (t('search.title') + resultKey.value.i) as string
    return { t }
  },
})
</script>

<style lang="postcss" scoped></style>
