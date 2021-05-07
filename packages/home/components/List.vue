<template>
  <div class="w-full">
    <h4 class="text-gray-900">{{ t('home.list.favorites') }}</h4>
    <div>img</div>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    data: {
      type: String,
      default: '{}',
    },
  },
  setup(props) {
    const { t } = useI18n()

    interface HomeCompDataList {
      listID: string
    }

    const data: HomeCompDataList = reactive(JSON.parse(props.data))

    console.log(data.listID)
    return { t }
  },
})
</script>

<style lang="postcss" scoped></style>
