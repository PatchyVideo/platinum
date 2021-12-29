<template>
  <div class="aspect-ratio-16/10 overflow-hidden">
    <img
      class="object-cover h-full w-full dark:filter dark:brightness-75 bg-gray-300 dark:bg-gray-600"
      :alt="t('image.cover.alt', { title: title.slice(0, 40) })"
      :src="'https://patchyvideo.com/images/covers/' + coverImage"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

defineProps<{
  title: string
  coverImage: string
}>()

const { t } = useI18n()
</script>
