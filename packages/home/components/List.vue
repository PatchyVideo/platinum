<template>
  <div class="w-full">
    <h4 class="text-gray-900">收藏夹</h4>
    <div>img</div>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue'

export default defineComponent({
  props: {
    data: {
      type: String,
      default: '{}',
    },
  },
  setup(props) {
    interface HomeCompDataList {
      listID: string
    }

    const data: HomeCompDataList = reactive(JSON.parse(props.data))

    console.log(data.listID)
  },
})
</script>

<style lang="postcss" scoped></style>
