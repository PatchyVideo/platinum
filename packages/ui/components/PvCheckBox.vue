<template>
  <div class="inline-block">
    <input
      :checked="check"
      class="switch appearance-none outline-none rounded-full border border-solid border-gray-300 bg-gray-50 shadow-inner bg-clip-content align-middle w-14 h-8 inline-block relative transition-colors"
      type="checkbox"
      @change="updateValue()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  components: {},
  props: {
    check: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:check'],
  setup(props, { emit }) {
    function updateValue(): void {
      emit('update:check', !props.check)
    }
    return {
      updateValue,
    }
  },
})
</script>

<style lang="postcss" scoped>
.switch:before {
  content: '';
  @apply absolute w-8 inset-y-0 left-0 rounded-full bg-white shadow transition-all duration-200;
}
.switch:checked {
  @apply bg-pink-300 border-pink-200;
}
.switch:checked:before {
  @apply left-6;
}
</style>
