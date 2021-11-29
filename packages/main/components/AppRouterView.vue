<template>
  <div class="dark:bg-gray-800 dark:text-white">
    <RouterView v-slot="{ Component }">
      <Suspense>
        <Component :is="Component" />
      </Suspense>
    </RouterView>
  </div>
</template>
