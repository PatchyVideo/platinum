<template>
  <div class="w-full">
    <h4 class="text-gray-900">收藏夹</h4>
    <div>img</div>
  </div>
</template>

<script setup="props" lang="ts">
import { reactive } from 'vue'

declare const props: {
  data?: string
}

interface HomeCompDataList {
  listID: string
}

export const data: HomeCompDataList = reactive(JSON.parse(props.data || '{}'))

console.log(data.listID)

</script>

<style lang="postcss" scoped>
</style>
