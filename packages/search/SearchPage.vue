<template>
  <div class="bg-pink-50 dark:bg-gray-700 dark:text-gray-400">
    <nav-top :show-search-bar="false"></nav-top>
    <div class="pt-26 pb-30 text-center">
      <h3 class="text-lg font-semibold p-4 px-auto dark:text-white">PatchyVideo</h3>
      <auto-complete size="mobile" class="inline-block"></auto-complete>
    </div>
    <!-- <Footer></Footer> -->
  </div>
</template>

<script lang="ts">
import AutoComplete from '@/common/components/AutoComplete.vue'
import NavTop from '@/common/components/NavTop.vue'
import Footer from '@/common/components/Footer.vue'
import { onMounted, onUnmounted, reactive, ref, defineComponent } from 'vue'
// import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { NavTop, AutoComplete, Footer },
  props: {},
  setup() {
    return {}
  },
})
</script>

<style lang="postcss" scoped></style>
