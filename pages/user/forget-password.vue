<script setup lang="ts">
import type { GlobalComponents } from 'vue'

definePageMeta({
  layout: false,
})

const { t, locale } = useI18n()

useHead({
  title: () => `${t('user.forget-password.title')}`,
})

const emailEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)

const email = ref('')
const emailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function emailRepValidator(value: string) {
  return emailFormat.test(value)
}
const emailValid = computed(() => emailRepValidator(email.value))

const loading = ref<0 | 1 | 2>(0)
const forgetError = ref<string>()
async function forget() {
  if (!email.value) {
    forgetError.value = t('user.forget-password.email.email-status.tip')
    emailEl.value?.focus()
    return
  }
  if (!emailValid.value) {
    forgetError.value = t('user.forget-password.email.email-status.msg')
    emailEl.value?.focus()
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
    }>('https://patchyvideo.com/be/user/request_resetpass.do', {
      method: 'POST',
      body: {
        email: email.value,
        lang: locale.value,
      },
    })

    if (data.status === 'FAILED') {
      forgetError.value = t('user.forget-password.send-status.failed')
      return
    }
    else if (data.status === 'ERROR') {
      forgetError.value = data.dataerr?.reason
      return
    }

    loading.value = 2
    fin = false
  }
  catch (err) {
    forgetError.value = String(err)
  }
  finally {
    if (fin)
      loading.value = 0
  }
}
</script>

<template>
  <div>
    <NuxtLayout name="login-layout" :bg-type="1">
      <form
        class="flex m-5 md:m-auto px-8 md:px-10 pt-5 pb-8 md:py-12 w-full max-w-108 flex-col gap-3 md:gap-6 rounded-md shadow-xl shadow-purple-400/60 bg-white/80 ring-2 ring-purple-400 dark:bg-gray-800/90 dark:ring-gray-600 dark:text-gray-200 dark:shadow-gray-700"
        @submit.prevent="forget"
      >
        <div class="flex mb-2 mx-auto items-center">
          <NuxtLink to="/">
            <Logo :larger="8" />
          </NuxtLink>

          <span class="ml-2 pl-4 md:text-lg border-l-2 border-gray-400 dark:border-gray-500">{{ t('user.forget-password.title') }}</span>
        </div>

        <div v-if="forgetError" class="p-2 text-rose-600 rounded-lg ring-2 ring-rose-400 bg-white/50 dark:bg-gray-700 dark:text-rose-300 dark:ring-rose-500">
          <p class="text-center">
            {{ forgetError }}
          </p>
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="emailEl"
            v-model="email"
            :label="t('user.forget-password.email.email-label')"
            type="text"
            :validator="emailRepValidator"
            @enter="() => emailEl?.focus()"
          />
        </div>

        <div class="mt-2">
          <button
            class="focus:outline-none w-full py-2 text-white font-bold rounded-md bg-purple-500 disabled:bg-purple-300 hover:bg-purple-600 disabled:hover:bg-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 disabled:dark:bg-purple-400 disabled:dark:hover:bg-purple-400"
            type="submit"
            :disabled="loading > 0"
          >
            {{ loading === 2
              ? t('user.forget-password.send-status.successful')
              : loading === 1
                ? t('user.forget-password.send-status.loading')
                : t('user.forget-password.send-status.ready') }}
          </button>
        </div>

        <div class="flex -mt-2 justify-center gap-2 text-purple-600 text-sm dark:text-purple-300">
          <NuxtLink :to="{ path: '/user/login', query: { from: 'forget-password' } }">
            {{ t('user.forget-password.back-login') }}
          </NuxtLink>
          <span class="text-gray-400 dark:text-gray-500">|</span>
          <NuxtLink to="/user/signup">
            {{ t('user.forget-password.signup') }}
          </NuxtLink>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>
