<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  name?: string
  titleLinksTo?: RouteLocationRaw
}>()
</script>

<template>
  <div>
    <NuxtLink v-if="titleLinksTo" :to="titleLinksTo" target="_blank">
      <h4 class="title inline-block text-xl transition transition-colors hover:text-purple-600">
        <span class="title-text truncate w-90vw md:w-auto">{{ name }}</span>
        <div class="title-arrow i-uil:arrow-up-right w-6 h-6 text-purple-600 dark:bg-purple-300 transform opacity-25 transition-all duration-200 hidden md:inline-block" />
      </h4>
    </NuxtLink>
    <h4 v-else-if="name" class="inline-block text-xl truncate">
      {{ name }}
    </h4>
  </div>
</template>

<style lang="postcss" scoped>
.title {
  .title-text {
    display: inline-block;
    padding-bottom: 1px;
    background-image: linear-gradient(theme('colors.purple.300'), theme('colors.purple.300'));
    background-position: bottom left;
    background-size: 0% 1px;
    background-repeat: no-repeat;
    transition: background-size 140ms, background-position 0s 140ms;
  }
}

.title:hover {
  .title-text {
    background-position: bottom right;
    background-size: 100% 1px;
  }
  .title-arrow {
    /* TODO find a better way to do this */
    --un-translate-x: 0.25rem;
    --un-translate-y: -0.25rem;
    opacity: 40%;
  }
}
</style>
