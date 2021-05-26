<template>
  <div class="dark:bg-gray-700">
    <NavTop :show-search-bar="false"></NavTop>
    个人中心
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
import { setSiteTitle } from '@/common/lib/setSiteTitle'

export default defineComponent({
  components: { NavTop, AutoComplete, Footer },
  props: {},
  setup() {
    const { t } = useI18n()
    return { t }
  },
})
</script>

<style lang="postcss" scoped></style>
