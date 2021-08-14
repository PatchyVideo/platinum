<template>
  <span :title="date.toString()" v-text="relativeDate"></span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import formatRelative from 'date-fns/formatRelative'
import { dateFnsLocale } from '../'

const props = defineProps({
  date: {
    type: Date,
    required: true,
  },
})

const locale = await dateFnsLocale()
const relativeDate = computed(() => formatRelative(props.date, new Date(), { locale: locale ?? undefined }))
</script>
