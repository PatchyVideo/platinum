<template>
  <div class="text-center h-full w-full p-6">
    <div>{{ '注册成功，' + count + '秒后跳转回登录页面' }}</div>
    <router-link class="underline" to="/user/login">没有反应？点击我手动跳转</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const count = ref<number>(5)
    onMounted(() => {
      setInterval(() => count.value--, 1000)
    })
    watch(count, () => {
      if (!count.value) router.push('/user/login')
    })
    return { t, count }
  },
})
</script>

<style lang="postcss" scoped></style>
