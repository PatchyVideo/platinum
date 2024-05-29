<script lang="ts" setup>
import type { GlobalComponents } from 'vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const { onLogin } = useApollo()
const { t } = useI18n()

useHead({
  title: () => `${t('user.login.title')}`,
})

const from = computed(() => typeof route.query.from === 'string' ? (route.query.from === 'signup' || route.query.from === 'forget-password') ? '/' : route.query.from : '/')

const usernameEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)
const passwordEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)

const username = ref('')
const password = ref('')

function usernameValidator(value: string) {
  return value.length >= 2 && value.length <= 32
}
const usernameValid = computed(() => usernameValidator(username.value))
function passwordValidator(value: string) {
  return value.length >= 6 && value.length <= 32
}
const passwordValid = computed(() => passwordValidator(password.value))

// When "user name exists!" or "email is already been used!" appears for several times,
// user will doubt whether the page is stuck, this count is used to show the page works.
const errorCount = ref(0)

// 0: ready; 1: loading; 2: refreshing user data
const loading = ref<0 | 1 | 2>(0)
const loginError = ref<string>()
async function login() {
  if (!username.value) {
    loginError.value = t('user.login.username.username-status.tip')
    usernameEl.value?.focus()
    return
  }
  if (!usernameValid.value) {
    loginError.value = t('user.login.username.username-status.msg')
    usernameEl.value?.focus()
    return
  }
  if (!password.value) {
    loginError.value = t('user.login.password.password-status.tip')
    passwordEl.value?.focus()
    return
  }
  if (!passwordValid.value) {
    loginError.value = t('user.login.password.password-status.msg')
    passwordEl.value?.focus()
    return
  }

  loading.value = 1

  try {
    let session = ''
    try {
      const data = await $fetch<{
        status: 'SUCCEED' | 'FAILED' | 'ERROR'
        data?: string
      }>('https://patchyvideo.com/be/auth/get_session.do', {
        method: 'POST',
        body: {
          type: 'LOGIN',
        },
      })

      if (data.status !== 'SUCCEED') {
        loginError.value = t('user.login.login-status.error')
        return
      }

      session = data.data!
    }
    catch (err) {
      loginError.value = String(err)
      return
    }

    let token
    try {
      const data = await $fetch<{
        status: 'SUCCEED' | 'FAILED' | 'ERROR'
        data: {
          uid: string
          username: string
          image: string
          desc: string
          email: string
          bind_qq: boolean
          access_control_status?: string
          auth_token: string
        }
      }>('https://patchyvideo.com/be/login.do', {
        method: 'POST',
        body: {
          username: username.value,
          password: password.value,
          session,
        },
      })

      if (data.status === 'FAILED') {
        errorCount.value++
        loginError.value = t('user.login.login-status.failed') + (errorCount.value >= 3 ? `(${errorCount.value})` : '')
        return
      }
      else if (data.status === 'ERROR') {
        // @ts-expect-error TODO
        loginError.value = data.dataerr.reason
        return
      }

      token = data.data.auth_token
    }
    catch (err) {
      loginError.value = String(err)
      return
    }

    loading.value = 2

    if (!token) {
      loginError.value = t('user.login.login-status.error')
      return
    }

    await onLogin(token)
    await refreshNuxtData()

    navigateTo(from.value)
  }
  finally {
    loading.value = 0
  }
}
</script>

<template>
  <div>
    <NuxtLayout name="login-layout" :bg-type="1">
      <form
        class="flex m-5 md:m-auto px-8 md:px-10 pt-5 pb-8 md:py-12 w-full max-w-108 flex-col gap-3 md:gap-6 rounded-md shadow-xl shadow-purple-400/60 bg-white/80 ring-2 ring-purple-400 dark:bg-gray-800/80 dark:ring-gray-600 dark:text-gray-200 dark:shadow-gray-700"
        @submit.prevent="login"
      >
        <div class="flex mb-2 mx-auto items-center">
          <NuxtLink to="/">
            <Logo :larger="8" />
          </NuxtLink>

          <span class="ml-2 pl-4 text-lg border-l-2 border-gray-400">{{ t('user.login.title') }}</span>
        </div>

        <div v-if="loginError" class="p-2 text-rose-600 rounded-lg ring-2 ring-rose-400 bg-white/50 dark:bg-gray-700 dark:text-rose-300 dark:ring-rose-500">
          <p class="text-center">
            {{ loginError }}
          </p>
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="usernameEl"
            v-model="username"
            :label="t('user.login.username.label')"
            type="text"
            :validator="usernameValidator"
            @enter="() => passwordEl?.focus()"
          />
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="passwordEl"
            v-model="password"
            :label="t('user.login.password.label')"
            type="password"
            :validator="passwordValidator"
            @enter="login"
          />
        </div>

        <div class="mt-2">
          <button
            class="focus:outline-none w-full py-2 text-white font-bold rounded-md bg-purple-500 disabled:bg-purple-300 hover:bg-purple-600 disabled:hover:bg-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 disabled:dark:bg-purple-400 disabled:dark:hover:bg-purple-400"
            type="submit"
            :disabled="loading > 0"
          >
            {{ loading === 2
              ? t('user.login.login-status.refreshing')
              : loading === 1
                ? t('user.login.login-status.loading')
                : t('user.login.login-status.ready') }}
          </button>
        </div>

        <div class="flex -mt-2 justify-center gap-2 text-purple-600 text-sm dark:text-purple-300">
          <NuxtLink to="/user/forget-password">
            {{ t('user.login.forget-password') }}
          </NuxtLink>
          <span class="text-gray-400 dark:text-gray-500">|</span>
          <NuxtLink to="/user/signup">
            {{ t('user.login.signup') }}
          </NuxtLink>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>
