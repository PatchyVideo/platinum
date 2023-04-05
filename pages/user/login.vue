<script lang="ts" setup>
import type { GlobalComponents } from 'vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const { onLogin } = useApollo()
const { t } = useI18n()
const auth = await useAuth()

useHead({
  title: () => `${t('user.login.title')}`,
})

const from = computed(() => typeof route.query.from === 'string' ? (route.query.from === 'signup' || route.query.from === 'forget-password') ? '/' : route.query.from : '/')

const usernameEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)
const passwordEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)

const username = ref('')
const password = ref('')

const usernameValidator = (value: string) => value.length >= 2 && value.length <= 32
const usernameValid = computed(() => usernameValidator(username.value))
const passwordValidator = (value: string) => value.length >= 6 && value.length <= 32
const passwordValid = computed(() => passwordValidator(password.value))

// When "user name exists!" or "email is already been used!" appears for seveal times,
// user will doubts whether the page stucks, this count is used to show the page works.
const errorCount = ref(0)

const loading = ref<0 | 1 | 2>(0)
const loginError = ref<string>()
const login = async () => {
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
    await auth.refresh()
    await refreshNuxtData()

    navigateTo(from.value)
  }
  finally {
    loading.value = 0
  }
}
</script>

<template>
  <NuxtLayout name="login-layout" :bg-type="1">
    <form
      class="flex m-5 md:m-auto px-8 md:px-10 pt-5 pb-8 md:py-12 w-full max-w-108 flex-col gap-3 md:gap-6 rounded-md shadow-xl shadow-purple-400/60 bg-white/80 ring-2 ring-purple-400"
      @submit.prevent="login"
    >
      <div class="flex mb-2 mx-auto items-center">
        <NuxtLink to="/">
          <Logo :larger="8" />
        </NuxtLink>

        <span class="ml-2 pl-4 text-lg border-l-2 border-gray-400">{{ t('user.login.title') }}</span>
      </div>

      <div v-if="loginError" class="p-2 text-rose-600 rounded-lg ring-2 ring-rose-400 bg-white/50">
        <p class="text-center">
          {{ loginError }}
        </p>
      </div>

      <div class="flex flex-nowrap gap-1 items-end">
        <PFormInput
          ref="usernameEl"
          v-model="username"
          label="用户名/邮箱"
          type="text"
          :validator="usernameValidator"
          @enter="() => passwordEl?.focus()"
        />
      </div>

      <div class="flex flex-nowrap gap-1 items-end">
        <PFormInput
          ref="passwordEl"
          v-model="password"
          label="密码"
          type="password"
          :validator="passwordValidator"
          @enter="login"
        />
      </div>

      <div class="mt-2">
        <button
          class="focus:outline-none w-full py-2 text-white font-bold rounded-md bg-purple-500 disabled:bg-purple-300 hover:bg-purple-600 disabled:hover:bg-purple-300"
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

      <div class="flex -mt-2 justify-center gap-2 text-purple-600 text-sm">
        <NuxtLink to="/user/forget-password">
          忘记密码
        </NuxtLink>
        <span class="text-gray-400">|</span>
        <NuxtLink to="/user/signup">
          注册帐号
        </NuxtLink>
      </div>
    </form>
  </nuxtlayout>
</template>
