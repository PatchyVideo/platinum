<template>
  <div class="login h-screen w-full md:min-h-xl bg-bottom bg-no-repeat bg-cover dark:filter dark:brightness-75">
    <div
      class="flex flex-wrap content-between w-full md:w-80 h-full p-5 text-white md:text-black bg-white bg-opacity-50 filter drop-shadow-md backdrop-filter backdrop-blur-sm lt-md:shadow md:ml-48"
    >
      <div class="w-full lt-md:text-center">
        <Logo :larger="20" />
        <div class="text-lg md:text-center" v-text="t('user.login.title')" />
      </div>
      <form class="w-full space-y-3" autocomplete="on" @submit.prevent="login">
        <div>
          <div class="flex w-full border-b border-black">
            <div class="i-uil:user align-middle text-2xl" />
            <input
              v-model="username"
              type="text"
              name="username"
              autocomplete="username"
              class="autofill outline-none w-full bg-transparent placeholder-white md:placeholder-gray-700 md:text-gray-700"
              :placeholder="t('user.login.username.placeholder')"
            >
          </div>
          <div class="text-red-500 text-sm h-4" v-text="usernameStatus" />
        </div>
        <div>
          <div class="flex w-full border-b border-black">
            <div class="i-uil:padlock align-middle text-2xl" />
            <input
              v-model="password"
              type="password"
              name="password"
              autocomplete="current-password"
              class="autofill outline-none w-full bg-transparent placeholder-white md:placeholder-gray-700 md:text-gray-700"
              :placeholder="t('user.login.password.placeholder')"
              @keydown.enter="login"
            >
          </div>
          <div class="text-red-500 text-sm h-4" v-text="passwordStatus" />
          <RouterLink
            class="block text-right text-xs text-blue-600"
            to="/user/forget-password"
          >
            {{ t('user.login.forget-password') }}
          </RouterLink>
        </div>
        <div class="space-y-1">
          <button
            type="submit"
            :disabled="loginStatus === 'loading'"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300 disabled:hover:bg-blue-300 disabled:hover:cursor-not-allowed"
            v-text="
              loginStatus === 'loading' ? t('user.login.login-status.loading') : t('user.login.login-status.ready')
            "
          />
          <div v-if="loginStatus === 'error'" class="text-red-500" v-text="errmsg" />
          <RouterLink
            class="block text-blue-600 hover:text-blue-800"
            to="/user/signup"
          >
            {{ `${t('user.login.signup')}→` }}
          </RouterLink>
        </div>
      </form>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full" />
      <div>© VoileLabs 2019-2022</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { $fetch } from 'ohmyfetch'
import { useAuth } from '.'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import Logo from '@/common/components/Logo.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuth()

setSiteTitle(`${t('user.login.title')} - PatchyVideo`)

const loginStatus = ref<'ready' | 'loading' | 'error'>('ready')
const UsernameStatus = {
  fine: t('user.login.username.username-status.fine'),
  tip: t('user.login.username.username-status.tip'),
  msg: t('user.login.username.username-status.msg'),
}
const usernameStatus = ref<string>(UsernameStatus.fine)
const PasswordStatus = {
  fine: t('user.login.password.password-status.fine'),
  tip: t('user.login.password.password-status.tip'),
  msg: t('user.login.password.password-status.msg'),
}
const passwordStatus = ref<string>(PasswordStatus.fine)

const username = ref<string>('')
const password = ref<string>('')
const errmsg = ref<string>('')

async function login(): Promise<void> {
  if (loginStatus.value === 'loading')
    return
  loginStatus.value = 'loading'

  /* Form validation  */
  let valid = true
  if (!username.value) {
    valid = false
    usernameStatus.value = UsernameStatus.tip
  }
  else if (username.value.length < 2 || username.value.length > 32) {
    valid = false
    usernameStatus.value = UsernameStatus.msg
  }
  else {
    usernameStatus.value = UsernameStatus.fine
  }
  if (!password.value) {
    valid = false
    passwordStatus.value = PasswordStatus.tip
  }
  else if (password.value.length < 6 || password.value.length > 64) {
    valid = false
    passwordStatus.value = PasswordStatus.msg
  }
  else {
    passwordStatus.value = PasswordStatus.fine
  }
  if (!valid) {
    loginStatus.value = 'ready'
    return
  }

  /* Login */
  let session = ''
  try {
    const data = await $fetch<{
      status: 'SUCCEED' | 'FAILED' | 'ERROR'
      data?: string
    }>('https://patchyvideo.com/be/auth/get_session.do', {
      method: 'POST',
      credentials: 'include',
      body: {
        type: 'LOGIN',
      },
    })
    if (data.status === 'SUCCEED') {
      session = data.data!
    }
    else {
      loginStatus.value = 'error'
      errmsg.value = t('user.login.login-status.error')
      return
    }
  }
  catch (err) {
    errmsg.value = String(err)
    loginStatus.value = 'error'
    return
  }

  try {
    const data = await $fetch<{
      status: 'SUCCEED' | 'FAILED' | 'ERROR'
    }>('https://patchyvideo.com/be/login.do', {
      method: 'POST',
      credentials: 'include',
      body: {
        username: username.value,
        password: password.value,
        session,
      },
    })

    if (data.status === 'SUCCEED') {
      loginStatus.value = 'ready'
      await auth.refetch()
      router.push('/')
    }
    else if (data.status === 'FAILED') {
      loginStatus.value = 'error'
      errmsg.value = t('user.login.login-status.failed')
    }
    else {
      loginStatus.value = 'error'
      // TODO
      errmsg.value = data.dataerr.reason
    }
  }
  catch (err) {
    loginStatus.value = 'error'
    errmsg.value = String(err)
  }
}
</script>

<style lang="postcss" scoped>
@media (max-width: 720px) {
  .login {
    background-image: url('./assets/LoginMobile.jpg');
  }
}
@media (min-width: 720px) {
  .login {
    background-image: url('./assets/Login.jpg');
  }
}

.autofill:-webkit-autofill,
.autofill:-webkit-autofill:hover,
.autofill:-webkit-autofill:focus {
  transition: background-color 5000s ease-in-out 0s;
  /* -webkit-text-fill-color: theme('colors.blue.300'); */
  -webkit-text-fill-color: #93c5fd;
}
@media (min-width: 720px) {
  .autofill:-webkit-autofill,
  .autofill:-webkit-autofill:hover,
  .autofill:-webkit-autofill:focus {
    /* -webkit-text-fill-color: theme('colors.blue.900'); */
    -webkit-text-fill-color: #1e3a8a;
  }
}
</style>
