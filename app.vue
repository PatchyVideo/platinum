<script lang="ts" setup>
import { cache } from './composables/graphql/cache'

useHead({
  titleTemplate: title => (title && title !== 'PatchyVideo') ? `${title} - PatchyVideo` : 'PatchyVideo',
})

// TODO: Hack to change cache config
// https://github.com/nuxt-modules/apollo/issues/443
const { clients } = useApollo()
clients!.default.cache = cache
// Property 'localState' is private and only accessible within class 'ApolloClient<TCacheShape>'
// clients!.default.localState.cache = cache
// Property 'queryManager' is private and only accessible within class 'ApolloClient<TCacheShape>'.
// clients!.default.queryManager.cache = cache
clients!.default.resetStore()
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout class="text-sm md:text-base">
    <PMessage />
    <NuxtPage />
  </NuxtLayout>
</template>
