<script lang="ts" setup>
const props = defineProps<{
  showSlider: boolean
}>()
const emit = defineEmits<{
  (event: 'update:showSlider', value: boolean): void
}>()
const showSlider = useVModel(props, 'showSlider', emit)
function changeSlider() {
  showSlider.value = !showSlider.value
}
</script>

<template>
  <div class="flex-1 flex mr-auto items-center gap-4">
    <div class="p-2">
      <div
        class="i-fluent:list-16-regular w-6 h-6 cursor-pointer transition transition-colors hover:bg-purple-200"
        @click="changeSlider()"
      />
    </div>

    <NuxtLink to="/" class="hidden lg:block">
      <Logo />
    </NuxtLink>
  </div>
</template>
