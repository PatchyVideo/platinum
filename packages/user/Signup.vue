<template>
  <div
    class="sign-up h-screen w-full md:min-h-xl flex justify-end bg-bottom bg-no-repeat bg-cover dark:filter dark:brightness-75"
  >
    <div
      class="flex flex-wrap content-between w-full md:w-80 h-full p-5 text-white lt-md:dark:text-white md:text-black bg-white bg-opacity-50 filter drop-shadow-md backdrop-filter backdrop-blur-sm lt-md:shadow md:mr-50"
    >
      <div class="w-full lt-md:text-center">
        <Logo :larger="20" />
        <div class="text-lg text-center" v-text="t('user.signup.title')" />
      </div>
      <form class="w-full space-y-2" autocomplete="on" @submit.prevent="signup">
        <div>
          <div class="flex w-full border-b border-black lt-md:dark:border-white">
            <div class="i-uil:user align-middle text-2xl" />
            <input
              v-model="userName"
              type="text"
              name="username"
              autocomplete="username"
              class="autofill outline-none w-full bg-transparent placeholder-gray-700 text-gray-700 lt-md:dark:placeholder-white lt-md:dark:text-white"
              :placeholder="t('user.signup.username.placeholder')"
            >
          </div>
          <div class="text-red-500 text-sm h-4" v-text="usernameStatus" />
        </div>
        <div>
          <div class="flex w-full border-b border-black lt-md:dark:border-white">
            <div class="i-uil:lock-open-alt align-middle text-2xl" />
            <input
              v-model="password"
              type="password"
              name="password"
              autocomplete="new-password"
              class="autofill outline-none w-full bg-transparent placeholder-gray-700 text-gray-700 lt-md:dark:placeholder-white lt-md:dark:text-white"
              :placeholder="t('user.signup.password.placeholder')"
            >
          </div>
          <div class="text-red-500 text-sm h-4" v-text="passwordStatus" />
        </div>
        <div>
          <div class="flex w-full border-b border-black lt-md:dark:border-white">
            <div class="i-uil:padlock align-middle text-2xl" />
            <input
              v-model="password2"
              type="password"
              name="re-password"
              autocomplete="new-password"
              class="autofill outline-none w-full bg-transparent placeholder-gray-700 text-gray-700 lt-md:dark:placeholder-white lt-md:dark:text-white"
              :placeholder="t('user.signup.password2.placeholder')"
            >
          </div>
          <div class="text-red-500 text-sm h-4" v-text="password2Status" />
        </div>
        <div>
          <div class="flex w-full border-b border-black lt-md:dark:border-white">
            <div class="i-uil:envelope align-middle text-2xl" />
            <input
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              class="autofill outline-none w-full bg-transparent placeholder-gray-700 text-gray-700 lt-md:dark:placeholder-white lt-md:dark:text-white"
              :placeholder="t('user.signup.email.placeholder')"
              @keydown.enter="signup"
            >
          </div>
          <div class="text-red-500 text-sm h-4" v-text="emailStatus" />
        </div>
        <div class="space-y-1">
          <button
            type="submit"
            :disabled="signupStatus === 'loading'"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300 disabled:hover:bg-blue-300 disabled:hover:cursor-not-allowed"
            v-text="
              signupStatus === 'loading' ? t('user.signup.signup-status.loading') : t('user.signup.signup-status.ready')
            "
          />
          <div v-if="signupStatus === 'error'" class="text-red-500" v-text="errmsg" />
          <RouterLink
            class="block text-blue-600 text-right hover:text-blue-800"
            to="/user/login"
          >
            {{ `←${t('user.signup.login')}` }}
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { resDataStatus } from '@/common/libs/resDataStatus'
import Logo from '@/common/components/Logo.vue'

const { t } = useI18n()
const router = useRouter()
setSiteTitle(`${t('user.signup.title')} - PatchyVideo`)

const signupStatus = ref<'ready' | 'loading' | 'error'>('ready')
const UsernameStatus = computed(() => ({
  fine: t('user.signup.username.username-status.fine'),
  tip: t('user.signup.username.username-status.tip'),
  msg: t('user.signup.username.username-status.msg'),
  res: t('user.signup.username.username-status.res'),
  err: t('user.signup.username.username-status.err'),
}))
const usernameStatus = ref<string>(UsernameStatus.value.fine)
const PasswordStatus = computed(() => ({
  fine: t('user.signup.password.password-status.fine'),
  tip: t('user.signup.password.password-status.tip'),
  msg: t('user.signup.password.password-status.msg'),
}))
const passwordStatus = ref<string>(PasswordStatus.value.fine)
const Password2Status = computed(() => ({
  fine: t('user.signup.password2.password2-status.fine'),
  tip: t('user.signup.password2.password2-status.tip'),
  msg: t('user.signup.password2.password2-status.msg'),
}))
const password2Status = ref<string>(Password2Status.value.fine)
const emailFormat
  = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const EmailStatus = computed(() => ({
  fine: t('user.signup.email.email-status.fine'),
  tip: t('user.signup.email.email-status.tip'),
  msg: t('user.signup.email.email-status.msg'),
  res: t('user.signup.email.email-status.res'),
  err: t('user.signup.email.email-status.err'),
}))
const emailStatus = ref<string>(EmailStatus.value.fine)

const userName = ref<string>('')
const password = ref<string>('')
const password2 = ref<string>('')
const email = ref<string>('')
const errmsg = ref<string>('')

async function signup(): Promise<void> {
  if (signupStatus.value === 'loading')
    return
  signupStatus.value = 'loading'

  /* Form validation  */
  let valid = true
  if (!userName.value) {
    valid = false
    usernameStatus.value = UsernameStatus.value.tip
  }
  else if (userName.value.length < 2 || userName.value.length > 32) {
    valid = false
    usernameStatus.value = UsernameStatus.value.msg
  }
  else {
    usernameStatus.value = UsernameStatus.value.fine
  }
  if (!password.value) {
    valid = false
    passwordStatus.value = PasswordStatus.value.tip
  }
  else if (password.value.length < 6 || password.value.length > 64) {
    valid = false
    passwordStatus.value = PasswordStatus.value.msg
  }
  else {
    passwordStatus.value = PasswordStatus.value.fine
  }
  if (!password2.value) {
    valid = false
    password2Status.value = Password2Status.value.tip
  }
  else if (password2.value !== password.value) {
    valid = false
    password2Status.value = Password2Status.value.msg
  }
  else {
    password2Status.value = Password2Status.value.fine
  }
  if (!email.value) {
    valid = false
    emailStatus.value = EmailStatus.value.tip
  }
  else if (!emailFormat.test(email.value)) {
    valid = false
    emailStatus.value = EmailStatus.value.msg
  }
  else {
    emailStatus.value = EmailStatus.value.fine
  }
  if (valid) {
    const fetchUser = fetch('https://patchyvideo.com/be/user/exists.do', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        username: userName.value,
      }),
      credentials: 'include',
    })
      .then(data => data.json())
      .then((res) => {
        // console.log(res)
        if (res.status !== resDataStatus.SUCCEED) {
          usernameStatus.value = UsernameStatus.value.err
          valid = false
        }
        // 'res.data=true' means the user already exists
        else if (res.data) {
          usernameStatus.value = UsernameStatus.value.res
          valid = false
        }
      })
      .catch(() => {
        // console.log(err)
        usernameStatus.value = UsernameStatus.value.err
        valid = false
      })
    const fetchEmail = fetch('https://patchyvideo.com/be/user/email_avail.do', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        email: email.value,
      }),
      credentials: 'include',
    })
      .then(data => data.json())
      .then((res) => {
        // console.log(res)
        if (res.status !== resDataStatus.SUCCEED) {
          emailStatus.value = EmailStatus.value.err
          valid = false
        }
        // 'res.data=true' means the user already exists
        else if (res.data) {
          emailStatus.value = EmailStatus.value.res
          valid = false
        }
      })
      .catch(() => {
        // console.log(err)
        emailStatus.value = EmailStatus.value.err
        valid = false
      })
    await fetchUser
    await fetchEmail
  }
  if (!valid) {
    signupStatus.value = 'ready'
    return
  }

  /* Sign up */
  let session = ''
  await fetch('https://patchyvideo.com/be/auth/get_session.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ type: 'SIGNUP' }),
    credentials: 'include',
  })
    .then(data => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) { session = res.data }
      else {
        signupStatus.value = 'error'
        errmsg.value = t('user.signup.signup-status.error')
      }
    })
    .catch((err) => {
      // console.log(err)
      signupStatus.value = 'error'
      errmsg.value = err
    })

  await fetch('https://patchyvideo.com/be/signup.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      username: userName.value,
      password: password.value,
      email: email.value,
      session,
    }),
    credentials: 'include',
  })
    .then(data => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) {
        router.push({ path: '/user/redirect', query: { from: 'sign-up' } })
      }
      else {
        signupStatus.value = 'error'
        errmsg.value = res.dataerr.reason
      }
    })
    .catch((err) => {
      // console.log(err)
      signupStatus.value = 'error'
      errmsg.value = err
    })
}
</script>

<style lang="postcss" scoped>
@media (max-width: 720px) {
  .sign-up {
    background-image: url('./assets/SignupMobile.jpg');
  }
}
@media (min-width: 720px) {
  .sign-up {
    background-image: url('./assets/Signup.jpg');
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
