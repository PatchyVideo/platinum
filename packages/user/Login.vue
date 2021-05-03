<template>
  <div class="log-in h-screen w-full md:min-h-xl">
    <!-- Desktop view -->
    <div class="w-80 h-full bg-white bg-opacity-60 blur-2 shadow ml-40 hidden md:block">
      <div class="w-full text-center pr-5 py-8"><Logo :larger="20"></Logo></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Logo from '@/common/components/Logo.vue'

export default defineComponent({
  components: { Logo },
  props: {},
  setup() {
    return {}
  },
})
</script>

<style lang="postcss" scoped>
.log-in {
  @apply bg-center;
  @apply bg-no-repeat;
  @apply bg-cover;
  background-image: url('../common/assets/Login.jpg');
}
</style>
