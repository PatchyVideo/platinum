<template>
  <div class="w-full">
    <h4 class="text-gray-900">收藏夹</h4>
    <div>img</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, defineProps } from 'vue'

const props = defineProps<{
  data?: string
}>()

interface HomeCompDataList {
  listID: string
}

const data: HomeCompDataList = reactive(JSON.parse(props.data || '{}'))

console.log(data.listID)
</script>

<style lang="postcss" scoped>
</style>
