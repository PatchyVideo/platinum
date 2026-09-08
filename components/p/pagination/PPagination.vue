<script lang="ts" setup>
const props = defineProps<{
  page: number
  total: number
}>()
const emit = defineEmits<{
  (event: 'update:page', value: number): void
}>()
const page = useVModel(props, 'page', emit)

const { t } = useI18n()

const input = ref(page.value)
watchEffect(() => {
  input.value = page.value
})

function commit() {
  if (
    !Number.isSafeInteger(input.value)
    || input.value < 1
    || input.value > props.total
  ) {
    Message({ message: t('ui.pv-pagination.alert'), type: MessageType.warning })
    return
  }

  if (page.value !== input.value)
    page.value = input.value
}
</script>

<template>
  <div class="flex justify-center items-center gap-2">
    <PFormButton
      :disabled="page === 1"
      @click="() => page > 1 && page--"
    >
      {{ t('ui.pv-pagination.page-previous') }}
    </PFormButton>

    <input
      v-model.number="input"
      class="focus:outline-none px-1 w-12 text-center border-b border-purple-300 focus:border-purple-500"
      @keydown.enter="commit"
      @blur="commit"
    >
    /
    <span>{{ total }}</span>

    <PFormButton
      :disabled="page === total"
      @click="() => page < total && page++"
    >
      {{ t('ui.pv-pagination.page-next') }}
    </PFormButton>
  </div>
</template>
