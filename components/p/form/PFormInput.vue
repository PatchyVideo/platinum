<script lang="ts" setup>
const props = withDefaults(defineProps<{
  label: string
  type: string
  modelValue: string
  disabled?: boolean
  validator?: (value: string) => boolean
}>(), {
  disabled: false,
})
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'enter'): void
}>()
const modelValue = useVModel(props, 'modelValue', emit)

const inputEl = shallowRef<HTMLInputElement | null>(null)

const valid = computed(() => !!props.validator?.(modelValue.value))

function onEnter() {
  emit('enter')
}

function focus() {
  inputEl.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <label class="input relative w-full border-b-2 border-purple-400 transition-colors focus-within:border-purple-600">
    <span
      class="label absolute px-2 transition-all ease-out"
      :class="[modelValue ? 'top-0 text-xs' : 'top-4', disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-100']"
    >
      {{ label }}
      <span
        v-if="validator"
        class="valid mb-px w-2 h-2 rounded-full"
        :class="[
          modelValue ? 'inline-block' : 'hidden',
          valid ? 'bg-emerald-400' : 'bg-rose-400',
        ]"
      />
    </span>
    <input
      ref="inputEl"
      v-model="modelValue"
      :type="type"
      :disabled="disabled"
      class="focus:outline-none bg-transparent px-2 pt-4 pb-px w-full"
      @keydown.enter.prevent="onEnter"
    >
  </label>
</template>

<style scoped>
.input:focus-within .label {
  --at-apply: "top-0 text-xs";
}
.input:focus-within .valid {
  --at-apply: "inline-block";
}

input:autofill {
  background: transparent;
}
input {
  filter: none;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: theme('colors.blue.300');
}
@media (min-width: 720px) {
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-text-fill-color: theme('colors.blue.900');
  }
}
</style>
