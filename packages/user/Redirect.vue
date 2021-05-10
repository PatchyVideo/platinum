<template>
  <div class="text-center h-full w-full p-6">
    <div>{{ t('user.signup-redirect.log1') + count + t('user.signup-redirect.log2') }}</div>
    <router-link class="underline" to="/user/login">{{ t('user.signup-redirect.jump') }}</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { setSiteTitle } from '@/common/lib/setSiteTitle'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    setSiteTitle(t('user.signup-redirect.title'))

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
