<script lang="ts" setup>
import { cache } from './composables/graphql/cache'

useHead({
  titleTemplate: title => (title && title !== 'PatchyVideo') ? `${title} - PatchyVideo` : 'PatchyVideo',
})

// TODO: Hack to change cache config
// https://github.com/nuxt-modules/apollo/issues/443
const { clients } = useApollo()
clients.default.cache = cache
clients.default.localState.cache = cache
clients.default.queryManager.cache = cache
clients.default.resetStore()
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout class="text-sm md:text-base">
    <PMessage />
    <NuxtPage />
  </NuxtLayout>
</template>
