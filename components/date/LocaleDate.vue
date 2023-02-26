<script setup lang="ts">
const props = defineProps<{
  date: Date | string
}>()

const { localeProperties } = useI18n()

const date = computed(() => new Date(props.date))
const formated = computed(() =>
  new Intl.DateTimeFormat(localeProperties.value.iso, {
    dateStyle: 'medium',
  }).format(date.value),
)
</script>

<template>
  <span :title="date.toString()">{{ formated }}</span>
</template>
