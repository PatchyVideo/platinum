<script lang="ts" setup>
const props = defineProps({
  readOnly: Boolean,
  check: Boolean,
})

const emit = defineEmits<{
  (event: 'update:check', value: boolean): void
}>()

const check = useVModel(props, 'check', emit)

function changeCheck(): void {
  if (props.readOnly)
    return
  check.value = !check.value
}
</script>

<template>
  <div class="inline-block flex items-center">
    <input
      id="checkBox"
      read-only="true"
      :checked="check"
      class="hidden checked:label:bg-accent-color-600"
      type="checkbox"
      :disabled="props.readOnly"
      @change="changeCheck()"
    >
    <label
      for="checkBox"
      class="inline-block w-3 h-3 md:w-5 md:h-5 rounded border border-purple-300 relative cursor-pointer before:inline-block before:w-3 before:md:w-4.5 before:h-1 before:md:h-1.5 before:border-3 before:border-purple-600 before:border-t-0 before:border-r-0 before:transform before:transform-gpu before:-rotate-45 before:top-1 before:left-0 before:absolute before:opacity-0"
    />
  </div>
</template>

<style lang="postcss" scoped>
label::before {
  content: ' ';
}
input:checked + label {
  @apply bg-white;
}
input:checked + label::before {
  @apply opacity-100;
}
</style>
