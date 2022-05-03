<template>
  <div class="aspect-ratio-16/10 overflow-hidden">
    <img
      class="object-cover h-full w-full bg-gray-300 dark:bg-gray-600"
      :class="{ 'dark:filter dark:brightness-75': filter }"
      :alt="t('image.cover.alt', { title: title.slice(0, 40) })"
      :src="`https://patchyvideo.com/images/covers/${coverImage}`"
    >
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useThemeDarkCoverFilter } from '@/settings'

defineProps<{
  title: string
  coverImage: string
}>()

const { t } = useI18n()
const filter = useThemeDarkCoverFilter()
</script>
