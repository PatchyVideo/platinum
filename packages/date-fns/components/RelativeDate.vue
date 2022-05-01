<template>
  <span :title="date.toString()" v-text="relativeDate" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import formatRelative from 'date-fns/formatRelative'
import { dateFnsLocale } from '../'

const props = defineProps<{
  date: Date
}>()

const locale = await dateFnsLocale()
const relativeDate = computed(() => formatRelative(props.date, new Date(), { locale: locale ?? undefined }))
</script>
