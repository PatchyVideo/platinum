<template>
  <div class="text-center h-full w-full p-6">
    <div>
      {{ t('user.redirect.log', { fromWord: fromWord, count: count }) }}
    </div>
    <RouterLink class="underline" to="/user/login">{{ t('user.redirect.jump') }}</RouterLink>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { setSiteTitle } from '@/common/lib/setSiteTitle'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    setSiteTitle(t('user.redirect.title'))

    const From: Record<string, string> = {
      'sign-up': t('user.redirect.from.sign-up'),
      'reset-password': t('user.redirect.from.reset-password'),
      default: '?',
    }
    const from = computed<string>(() => route.query.from as string)

    let catchFrom = false
    for (let key in From) {
      if (key === from.value) {
        catchFrom = true
      }
    }
    if (!catchFrom) {
      router.push('/404')
    }

    const fromWord = computed(() => From[from.value])

    const count = ref<number>(5)
    onMounted(() => {
      setInterval(() => count.value--, 1000)
    })
    watch(count, () => {
      if (!count.value) router.push('/user/login')
    })
    return { t, fromWord, count }
  },
})
</script>

<style lang="postcss" scoped></style>
