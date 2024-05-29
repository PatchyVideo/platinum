<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    bgType?: number
    position?: 'left' | 'right'
  }>(),
  {
    bgType: 1,
    position: 'left',
  },
)

const bgType = computed(() => `type${props.bgType}`)
</script>

<template>
  <div class="w-full h-100vh bg-center md:bg-bottom bg-no-repeat bg-cover dark:filter dark:brightness-75" :class="bgType">
    <!-- Top mask in mobile view -->
    <div class="md:hidden absolute w-full h-15 bg-gradient-to-b from-white" />

    <!-- White Mask -->
    <div class="w-full h-full bg-white bg-opacity-50 md:bg-opacity-40 dark:bg-gray-500/10 dark:bg-opacity-60 flex items-center">
      <div class="flex-1 flex justify-center">
        <slot />
      </div>
      <div class="hidden md:block flex-1 ml-auto" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@media (max-width: 720px) {
  .type1 {
    background-image: url('@/assets/images/LoginMobile.jpg');
  }
  .type2 {
    background-image: url('@/assets/images/SignupMobile.jpg');
  }
}
@media (min-width: 720px) {
  .type1 {
    background-image: url('@/assets/images/Login.jpg');
  }
  .type2 {
    background-image: url('@/assets/images/Signup.jpg');
  }
}
</style>
