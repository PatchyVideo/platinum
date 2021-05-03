<template>
  <div class="w-full">
    <div class="text-center">
      <h1 class="text-xl dark:text-white" v-text="t('error-pages.N404.title')"></h1>
      <div class="text-sm text-gray-600 dark:text-gray-200" v-text="fullPath"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
    const { t } = useI18n()

    const { fullPath } = useRoute()

    return {
      t,
      fullPath,
    }
  },
})
</script>

<style lang="postcss" scoped></style>
