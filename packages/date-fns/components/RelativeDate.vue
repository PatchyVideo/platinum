<template>
  <span :title="date.toLocaleString()" v-text="relativeDate(date)"></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import formatRelative from 'date-fns/formatRelative'
import { dateFnsLocale } from '../'

export default defineComponent({
  props: {
    date: {
      type: Date,
      required: true,
    },
  },
  async setup() {
    const locale = await dateFnsLocale()
    const relativeDate = (date: Date) => {
      return formatRelative(date, new Date(), { locale: locale ?? undefined })
    }
    return {
      relativeDate,
    }
  },
})
</script>
