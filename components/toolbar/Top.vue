<script lang="ts" setup>
</script>

<template>
  <div class="z-49 fixed top-0 left-0 right-0 bg-white dark:bg-black">
    <div class="flex px-4 py-1 h-14 items-center">
      <!-- Start -->
      <div class="flex-1 flex mr-auto items-center gap-4">
        <div class="p-2">
          <div class="i-fluent:list-28-regular w-6 h-6" />
        </div>

        <Logo />
      </div>

      <!-- Center -->
      <div class="flex-auto max-w-xl">
        <SearchCombo />
      </div>

      <!-- End -->
      <div class="flex-1 flex ml-auto justify-end items-center">
        <ToolbarUser class="mr-2" />
      </div>
    </div>
  </div>
</template>
