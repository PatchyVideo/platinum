<template>
  <div
    class="shadow fixed bottom-5 right-5 bg-gray-50 cursor-pointer p-2 transition-opacity rounded-full dark:bg-gray-800"
    :class="{ disabled: !top }"
    :title="t('common.backTop.backTop')"
    @click="backUp()"
  >
    <icon-uil-top-arrow-to-top class="text-2xl" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const { t } = useI18n()
    let top = ref<number>(document.body.scrollTop || document.documentElement.scrollTop)
    function getTop(): void {
      top.value = document.body.scrollTop || document.documentElement.scrollTop
    }
    function backUp(): void {
      if (top.value > 0) {
        window.requestAnimationFrame(backUp)
        window.scrollTo(0, top.value - top.value / 5)
      }
    }
    onMounted((): void => {
      document.addEventListener('scroll', getTop)
    })
    onUnmounted((): void => {
      document.removeEventListener('scroll', getTop)
    })
    return { t, top, backUp }
  },
})
</script>

<style lang="postcss" scoped>
.disabled {
  @apply opacity-50;
}
</style>
