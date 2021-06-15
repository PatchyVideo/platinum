<template>
  <div class="log-in-mobile h-screen w-full md:min-h-xl dark:(filter brightness-80) md:log-in-md">
    <!-- Mobile view -->
    <div
      v-if="screenSizes['<md']"
      class="
        flex-wrap
        content-between
        w-full
        h-full
        p-5
        shadow
        flex
        filter
        drop-shadow-md
        backdrop-filter backdrop-blur-sm
        text-white
      "
    >
      <div class="w-full text-center">
        <Logo :larger="20"></Logo>
        <div class="text-lg">{{ t('user.login.title') }}</div>
      </div>
      <div class="w-full space-y-3">
        <div>
          <div class="flex w-full border-b-1 border-white">
            <icon-uil-user class="align-middle w-7" />
            <input
              v-model="userName"
              class="outline-none w-full bg-transparent placeholder-white"
              :placeholder="t('user.login.username.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ usernameStatus }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-white">
            <icon-uil-padlock class="align-middle w-7" />
            <input
              v-model="password"
              type="password"
              class="outline-none w-full bg-transparent placeholder-white"
              :placeholder="t('user.login.password.placeholder')"
              @keydown.enter="login"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ passwordStatus }}</div>
          <RouterLink class="block text-right text-xs text-blue-600" to="/user/forget-password">{{
            t('user.login.forget-password')
          }}</RouterLink>
        </div>
        <div class="space-y-1">
          <button
            :disabled="loginStatus === 'loading'"
            class="
              w-full
              py-2
              border border-transparent
              rounded-md
              text-white
              bg-blue-600
              focus:outline-none focus:ring-2 focus:bg-blue-700
              disabled:bg-blue-300 disabled:focus:bg-blue-300
            "
            @click="login"
          >
            {{ loginStatus === 'loading' ? t('user.login.login-status.loading') : t('user.login.login-status.ready') }}
          </button>
          <div v-if="loginStatus === 'error'" class="text-red-500">{{ errmsg }}</div>
          <RouterLink class="block text-blue-600" to="/user/signup">{{ t('user.login.signup') + '→' }}</RouterLink>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full"></div>
      <div>© PatchyVideo 2020-2021</div>
    </div>
    <!-- Desktop view -->
    <div
      v-else
      class="
        flex-wrap
        content-between
        w-80
        h-full
        p-5
        bg-white bg-opacity-50
        filter
        drop-shadow-md
        backdrop-filter backdrop-blur-sm
        ml-50
        text-black
        flex
      "
    >
      <div class="w-full">
        <Logo :larger="20"></Logo>
        <div class="text-lg text-center">{{ t('user.login.title') }}</div>
      </div>
      <div class="w-full space-y-3">
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-user class="align-middle w-7" />
            <input
              v-model="userName"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              :placeholder="t('user.login.username.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ usernameStatus }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-padlock class="align-middle w-7" />
            <input
              v-model="password"
              type="password"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              :placeholder="t('user.login.password.placeholder')"
              @keydown.enter="login"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ passwordStatus }}</div>
          <RouterLink class="block text-right text-xs text-blue-600" to="/user/forget-password">{{
            t('user.login.forget-password')
          }}</RouterLink>
        </div>
        <div class="space-y-1">
          <button
            :disabled="loginStatus === 'loading'"
            class="
              w-full
              py-2
              border border-transparent
              rounded-md
              text-white
              bg-blue-600
              hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:bg-blue-700
              disabled:bg-blue-300
              disabled:focus:bg-blue-300
              disabled:hover:bg-blue-300
              disabled:hover:cursor-not-allowed
            "
            @click="login"
          >
            {{ loginStatus === 'loading' ? t('user.login.login-status.loading') : t('user.login.login-status.ready') }}
          </button>
          <div v-if="loginStatus === 'error'" class="text-red-500">{{ errmsg }}</div>
          <RouterLink class="block text-blue-600 hover:text-blue-800" to="/user/signup">{{
            t('user.login.signup') + '→'
          }}</RouterLink>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full"></div>
      <div>© PatchyVideo 2020-2021</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resDataStatus } from '@/common/lib/resDataStatus'
import { setUserDataToLocalStorage, getUserDataFromLocalStorage } from '@/user'
import { screenSizes } from '@/tailwindcss'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import Logo from '@/common/components/Logo.vue'

const { t } = useI18n()
const router = useRouter()
setSiteTitle(t('user.login.title') + ' - PatchyVideo')

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

const userName = ref<string>('')
const password = ref<string>('')
const errmsg = ref<string>('')

async function login(): Promise<void> {
  if (loginStatus.value === 'loading') return
  loginStatus.value = 'loading'

  /* Form validation  */
  let valid = true
  if (!userName.value) {
    valid = false
    usernameStatus.value = UsernameStatus.tip
  } else if (userName.value.length < 2 || userName.value.length > 32) {
    valid = false
    usernameStatus.value = UsernameStatus.msg
  } else {
    usernameStatus.value = UsernameStatus.fine
  }
  if (!password.value) {
    valid = false
    passwordStatus.value = PasswordStatus.tip
  } else if (password.value.length < 6 || password.value.length > 64) {
    valid = false
    passwordStatus.value = PasswordStatus.msg
  } else {
    passwordStatus.value = PasswordStatus.fine
  }
  if (!valid) {
    loginStatus.value = 'ready'
    return
  }

  /* Login */
  let session = ''
  await fetch('https://patchyvideo.com/be/auth/get_session.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ type: 'LOGIN' }),
    credentials: 'include',
  })
    .then((data) => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) session = res.data
      else {
        loginStatus.value = 'error'
        errmsg.value = t('user.login.login-status.error')
      }
    })
    .catch((err) => {
      // console.log(err)
      loginStatus.value = 'error'
      errmsg.value = err
    })
  await fetch('https://patchyvideo.com/be/login.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      username: userName.value,
      password: password.value,
      session: session,
    }),
    credentials: 'include',
  })
    .then((data) => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) {
        loginStatus.value = 'ready'
        setUserDataToLocalStorage(
          res.data.username,
          res.data.image,
          res.data.access_control_status === 'admin' ? true : false,
          res.data.uid
        )
        getUserDataFromLocalStorage()
        router.push({ path: '/' })
        return
      } else if (res.status === resDataStatus.FAILED) {
        loginStatus.value = 'error'
        errmsg.value = t('user.login.login-status.failed')
      } else {
        loginStatus.value = 'error'
        errmsg.value = res.dataerr.reason
      }
    })
    .catch((err) => {
      // console.log(err)
      loginStatus.value = 'error'
      errmsg.value = err
    })
}
</script>

<style lang="postcss" scoped>
.log-in-mobile {
  @apply bg-bottom;
  @apply bg-no-repeat;
  @apply bg-cover;
  background-image: url('./assets/LoginMobile.jpg');
}
@variants md {
  .md\:log-in-md {
    @apply bg-center;
    @apply bg-no-repeat;
    @apply bg-cover;
    background-image: url('./assets/Login.jpg');
  }
}
</style>
