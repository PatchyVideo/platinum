<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    gray?: boolean
    show: boolean
  }>(),
  {
    gray: true,
  },
)
const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
}>()
const show = useVModel(props, 'show', emit)
function closeMask() {
  show.value = false
}
</script>

<template>
  <div>
    <TransitionGroup name="mask">
      <div v-if="show" class="fixed top-0 left-0 w-100vw h-100vh z-49 transition duration-500 transition-opacity opacity-10" :class="{ 'bg-black': props.gray }" @click="closeMask()" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.mask-enter-from,
.mask-leave-to {
   opacity: 0;
}
</style>
