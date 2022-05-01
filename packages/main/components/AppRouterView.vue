<template>
  <RouterView v-slot="{ Component, route }">
    <Suspense>
      <Component :is="Component" :key="computeKey(route)" />
    </Suspense>
  </RouterView>
</template>

<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from 'vue-router'

const computeKey = (route: RouteLocationNormalizedLoaded) => {
  if (route.meta.hashKey)
    return route.meta.hashKey(route)
}
</script>
