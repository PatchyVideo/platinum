<script lang="ts" setup>
import { formatRelative } from 'date-fns'
import { useLocale } from '@/composables/date/locale'

const props = defineProps<{
  date: Date | string
}>()

const date = computed(() => new Date(props.date))

const locale = await useLocale()
const relativeDate = computed(() => formatRelative(date.value, new Date(), { locale: locale.value }))
</script>

<template>
  <span :title="date.toString()">{{ relativeDate }}</span>
</template>
