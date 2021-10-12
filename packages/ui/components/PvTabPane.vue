<template>
  <div v-if="selectedTab === name" class="px-5 w-full">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
})
const { t } = useI18n()
const selectedTab = inject('selectedTab')
</script>
