<script lang="ts" setup>
</script>

<template>
  <div class="z-49 fixed top-0 left-0 right-0 bg-white dark:bg-black">
    <div class="flex px-2 lg:px-4 py-1 h-14 items-center">
      <!-- Start -->
      <div class="flex-1 flex mr-auto items-center gap-4">
        <div class="p-2">
          <div class="i-fluent:list-16-regular w-6 h-6" />
        </div>

        <div class="hidden lg:block">
          <Logo />
        </div>
      </div>

      <!-- Center -->
      <div class="flex-auto max-w-xl min-w-0">
        <SearchCombo />
      </div>

      <!-- End -->
      <div class="flex-1 flex ml-auto pl-2 justify-end items-center">
        <ToolbarUser class="mr-2" />
      </div>
    </div>
  </div>
</template>
