<template><LayoutDefault :fetch-notice="false"></LayoutDefault></template>

<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { setSiteTitle } from '@/common/lib/setSiteTitle'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
setSiteTitle('消息页面' + ' - PatchyVideo')
</script>

<style lang="postcss" scoped></style>
