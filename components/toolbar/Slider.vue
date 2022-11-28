<script lang="ts" setup>
const props = defineProps<{
  show: boolean
}>()
const emit = defineEmits<{
  (event: 'update:show', value: boolean): void
}>()
const show = useVModel(props, 'show', emit)

const { t } = useI18n()
const auth = await useAuth()
</script>

<template>
  <div class="fixed max-w-100vw h-100vh z-50 p-5 bg-white rounded-lg shadow shadow-purple-600 transition duration-500 transition-all" :class="show ? 'left-0' : '-left-100'">
    <Logo />
  </div>

  <PMask v-model:show="show" />
</template>
