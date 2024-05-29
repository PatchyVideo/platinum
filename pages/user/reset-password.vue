<script setup lang="ts">
import type { GlobalComponents } from 'vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

useHead({
  title: () => `${t('user.reset-password.title')}`,
})

const resetKey = computed(() => typeof route.query.from === 'string' ? route.query.key : '')

const passwordEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)
const passwordRepEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)

const password = ref('')
const passwordRep = ref('')

function passwordValidator(value: string) {
  return value.length >= 6 && value.length <= 32
}
const passwordValid = computed(() => passwordValidator(password.value))
function passwordRepValidator(value: string) {
  return value === password.value
}
const passwordRepValid = computed(() => passwordRepValidator(passwordRep.value))

const loading = ref<0 | 1 | 2>(0)
const resetError = ref<string>()
async function reset() {
  if (!resetKey.value) {
    resetError.value = t('user.reset-password.key-status.msg')
    return
  }
  if (!password.value) {
    resetError.value = t('user.reset-password.password.password-status.tip')
    passwordEl.value?.focus()
    return
  }
  if (!passwordValid.value) {
    resetError.value = t('user.reset-password.password.password-status.msg')
    passwordEl.value?.focus()
    return
  }
  if (!passwordRep.value) {
    resetError.value = t('user.reset-password.password2.password2-status.tip')
    passwordRepEl.value?.focus()
    return
  }
  if (!passwordRepValid.value) {
    resetError.value = t('user.reset-password.password2.password2-status.msg')
    passwordRepEl.value?.focus()
    return
  }

  loading.value = 1
  let fin = true

  try {
    const data = await $fetch<{
      status: 'SUCCEED' | 'FAILED' | 'ERROR'
      dataerr?: {
        reason: string
      }
    }>('https://patchyvideo.com/be/user/resetpass.do', {
      method: 'POST',
      body: {
        type: 'reset',
      },
    })

    if (data.status !== 'SUCCEED') {
      resetError.value = data.dataerr?.reason || t('user.reset-password.reset-fail')
      return
    }

    loading.value = 2
    setTimeout(() => {
      router.push({ path: '/user/login', query: { from: 'reset-password' } })
    }, 1500)
    fin = false
  }
  catch (err) {
    resetError.value = String(err)
  }
  finally {
    if (fin)
      loading.value = 0
  }
}
</script>

<template>
  <div>
    <NuxtLayout name="login-layout" :bg-type="2">
      <form
        class="flex m-5 md:m-auto px-8 md:px-10 pt-5 pb-8 md:py-12 w-full max-w-108 flex-col gap-3 md:gap-6 rounded-md shadow-xl shadow-purple-400/60 bg-white/80 ring-2 ring-purple-400  dark:bg-gray-800/70 dark:ring-gray-600 dark:text-gray-200 dark:shadow-gray-700"
        @submit.prevent="reset"
      >
        <div class="flex mb-2 mx-auto items-center">
          <NuxtLink to="/">
            <Logo :larger="8" />
          </NuxtLink>

          <span class="ml-2 pl-4 md:text-lg border-l-2 border-gray-400">{{ t('user.reset-password.title') }}</span>
        </div>

        <div v-if="resetError" class="p-2 text-rose-600 rounded-lg ring-2 ring-rose-400 bg-white/50">
          <p class="text-center">
            {{ resetError }}
          </p>
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="passwordEl"
            v-model="password"
            :label="t('user.reset-password.password.password-label')"
            type="password"
            :validator="passwordValidator"
            @enter="reset"
          />
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="passwordRepEl"
            v-model="passwordRep"
            :label="t('user.reset-password.password2.password2-label')"
            type="password"
            :validator="passwordRepValidator"
            @enter="reset"
          />
        </div>

        <div class="mt-2">
          <button
            class="focus:outline-none w-full py-2 text-white font-bold rounded-md bg-purple-500 disabled:bg-purple-300 hover:bg-purple-600 disabled:hover:bg-purple-300"
            type="submit"
            :disabled="loading > 0"
          >
            {{ loading === 2
              ? t('user.reset-password.reset-status.success')
              : loading === 1
                ? t('user.reset-password.reset-status.loading')
                : t('user.reset-password.reset-status.ready')
            }}
          </button>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>
