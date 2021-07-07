<template>
  <div class="w-full">
    <h4 class="text-gray-900">{{ t('home.list.favorites') }}</h4>
    <div>img</div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  data: {
    type: String,
    default: '{}',
  },
})
const { t } = useI18n()

interface HomeCompDataList {
  listID: string
}

const data: HomeCompDataList = reactive(JSON.parse(props.data))

console.log(data.listID)
</script>

<style lang="postcss" scoped></style>
