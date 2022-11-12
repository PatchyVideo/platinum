<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  name?: string
  titleLinksTo?: RouteLocationRaw
}>()
</script>

<template>
  <div>
    <NuxtLink v-if="titleLinksTo" :to="titleLinksTo">
      <h4 class="title inline-block mb-2 text-xl">
        <span class="title-text">{{ name }}</span>
        <div class="title-arrow i-uil:arrow-up-right w-6 h-6 text-gray-600 dark:text-gray-300 transform opacity-25 transition-all duration-200" />
      </h4>
    </NuxtLink>
    <h4 v-else-if="name" class="inline-block mb-2 text-xl">
      {{ name }}
    </h4>
  </div>
</template>

<style lang="postcss" scoped>
.title {
  .title-text {
    display: inline-block;
    padding-bottom: 1px;
    background-image: linear-gradient(theme('colors.gray.300'), theme('colors.gray.300'));
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
