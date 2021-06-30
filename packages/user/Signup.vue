<template>
  <div class="sign-up-mobile h-screen w-full md:min-h-xl flex justify-end dark:(filter brightness-80) md:sign-up-md">
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
        dark:text-white
        flex
      "
    >
      <div class="w-full text-center">
        <Logo :larger="20"></Logo>
        <div class="text-lg">{{ t('user.signup.title') }}</div>
      </div>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b-1 border-black dark:border-white">
            <icon-uil-user class="align-middle w-7" />
            <input
              v-model="userName"
              class="
                outline-none
                w-full
                bg-transparent
                placeholder-gray-900
                text-gray-900
                dark:placeholder-white dark:text-white
              "
              :placeholder="t('user.signup.username.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ usernameStatus }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black dark:border-white">
            <icon-uil-lock-open-alt class="align-middle w-7" />
            <input
              v-model="password"
              type="password"
              class="
                outline-none
                w-full
                bg-transparent
                placeholder-gray-900
                text-gray-900
                dark:placeholder-white dark:text-white
              "
              :placeholder="t('user.signup.password.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ passwordStatus }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black dark:border-white">
            <icon-uil-padlock class="align-middle w-7" />
            <input
              v-model="password2"
              type="password"
              class="
                outline-none
                w-full
                bg-transparent
                placeholder-gray-900
                text-gray-900
                dark:placeholder-white dark:text-white
              "
              :placeholder="t('user.signup.password2.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ password2Status }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black dark:border-white">
            <icon-uil-envelope class="align-middle w-7" />
            <input
              v-model="email"
              class="
                outline-none
                w-full
                bg-transparent
                placeholder-gray-900
                text-gray-900
                dark:placeholder-white dark:text-white
              "
              :placeholder="t('user.signup.email.placeholder')"
              @keydown.enter="signup"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ emailStatus }}</div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="signupStatus === 'loading'"
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
            @click="signup"
          >
            {{
              signupStatus === 'loading' ? t('user.signup.signup-status.loading') : t('user.signup.signup-status.ready')
            }}
          </button>
          <div v-if="signupStatus === 'error'" class="text-red-500">{{ errmsg }}</div>
          <RouterLink class="block text-right text-blue-600" to="/user/login">{{
            '←' + t('user.signup.login')
          }}</RouterLink>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full"></div>
      <div>© VoileLabs 2020-2021</div>
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
        bg-white
        text-gray-900
        bg-opacity-50
        filter
        drop-shadow-md
        backdrop-filter backdrop-blur-sm
        mr-50
        flex
      "
    >
      <div class="w-full">
        <Logo :larger="20"></Logo>
        <div class="text-lg text-center">{{ t('user.signup.title') }}</div>
      </div>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-user class="align-middle w-7" />
            <input
              v-model="userName"
              class="outline-none w-full bg-transparent placeholder-gray-900"
              :placeholder="t('user.signup.username.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ usernameStatus }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-lock-open-alt class="align-middle w-7" />
            <input
              v-model="password"
              type="password"
              class="outline-none w-full bg-transparent placeholder-gray-900"
              :placeholder="t('user.signup.password.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ passwordStatus }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-padlock class="align-middle w-7" />
            <input
              v-model="password2"
              type="password"
              class="outline-none w-full bg-transparent placeholder-gray-900"
              :placeholder="t('user.signup.password2.placeholder')"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ password2Status }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-envelope class="align-middle w-7" />
            <input
              v-model="email"
              class="outline-none w-full bg-transparent placeholder-gray-900"
              :placeholder="t('user.signup.email.placeholder')"
              @keydown.enter="signup"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ emailStatus }}</div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="signupStatus === 'loading'"
            class="
              w-full
              py-2
              border border-transparent
              rounded-md
              text-white
              bg-blue-600
              focus:outline-none focus:ring-2 focus:bg-blue-700
              disabled:bg-blue-300
              disabled:focus:bg-blue-300
              disabled:hover:bg-blue-300
              disabled:hover:cursor-not-allowed
            "
            @click="signup"
          >
            {{
              signupStatus === 'loading' ? t('user.signup.signup-status.loading') : t('user.signup.signup-status.ready')
            }}
          </button>
          <div v-if="signupStatus === 'error'" class="text-red-500">{{ errmsg }}</div>
          <RouterLink class="block text-blue-600 text-right hover:text-blue-800" to="/user/login">{{
            '←' + t('user.signup.login')
          }}</RouterLink>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full"></div>
      <div>© VoileLabs 2020-2021</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resDataStatus } from '@/common/lib/resDataStatus'
import { screenSizes } from '@/tailwindcss'
import Logo from '@/common/components/Logo.vue'

const { t } = useI18n()
const router = useRouter()
setSiteTitle(t('user.signup.title') + ' - PatchyVideo')

const signupStatus = ref<'ready' | 'loading' | 'error'>('ready')
const UsernameStatus = {
  fine: t('user.signup.username.username-status.fine'),
  tip: t('user.signup.username.username-status.tip'),
  msg: t('user.signup.username.username-status.msg'),
  res: t('user.signup.username.username-status.res'),
  err: t('user.signup.username.username-status.err'),
}
const usernameStatus = ref<string>(UsernameStatus.fine)
const PasswordStatus = {
  fine: t('user.signup.password.password-status.fine'),
  tip: t('user.signup.password.password-status.tip'),
  msg: t('user.signup.password.password-status.msg'),
}
const passwordStatus = ref<string>(PasswordStatus.fine)
const Password2Status = {
  fine: t('user.signup.password2.password2-status.fine'),
  tip: t('user.signup.password2.password2-status.tip'),
  msg: t('user.signup.password2.password2-status.msg'),
}
const password2Status = ref<string>(Password2Status.fine)
const emailFormat =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const EmailStatus = {
  fine: t('user.signup.email.email-status.fine'),
  tip: t('user.signup.email.email-status.tip'),
  msg: t('user.signup.email.email-status.msg'),
  res: t('user.signup.email.email-status.res'),
  err: t('user.signup.email.email-status.err'),
}
const emailStatus = ref<string>(EmailStatus.fine)

const userName = ref<string>('')
const password = ref<string>('')
const password2 = ref<string>('')
const email = ref<string>('')
const errmsg = ref<string>('')

async function signup(): Promise<void> {
  if (signupStatus.value === 'loading') return
  signupStatus.value = 'loading'

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
  if (!password2.value) {
    valid = false
    password2Status.value = Password2Status.tip
  } else if (password2.value != password.value) {
    valid = false
    password2Status.value = Password2Status.msg
  } else {
    password2Status.value = Password2Status.fine
  }
  if (!email.value) {
    valid = false
    emailStatus.value = EmailStatus.tip
  } else if (!emailFormat.test(email.value)) {
    valid = false
    emailStatus.value = EmailStatus.msg
  } else {
    emailStatus.value = EmailStatus.fine
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
      .then((data) => data.json())
      .then((res) => {
        // console.log(res)
        if (res.status != resDataStatus.SUCCEED) {
          usernameStatus.value = UsernameStatus.err
          valid = false
        }
        // 'res.data=true' means the user already exists
        else if (res.data) {
          usernameStatus.value = UsernameStatus.res
          valid = false
        }
      })
      .catch((err) => {
        // console.log(err)
        usernameStatus.value = UsernameStatus.err
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
      .then((data) => data.json())
      .then((res) => {
        // console.log(res)
        if (res.status != resDataStatus.SUCCEED) {
          emailStatus.value = EmailStatus.err
          valid = false
        }
        // 'res.data=true' means the user already exists
        else if (res.data) {
          emailStatus.value = EmailStatus.res
          valid = false
        }
      })
      .catch((err) => {
        // console.log(err)
        emailStatus.value = EmailStatus.err
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
    .then((data) => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) session = res.data
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
      session: session,
    }),
    credentials: 'include',
  })
    .then((data) => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) {
        router.push({ path: '/user/redirect', query: { from: 'sign-up' } })
      } else {
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
.sign-up-mobile {
  @apply bg-bottom;
  @apply bg-no-repeat;
  @apply bg-cover;
  background-image: url('./assets/SignupMobile.jpg');
}
@variants md {
  .md\:sign-up-md {
    @apply bg-bottom;
    @apply bg-no-repeat;
    @apply bg-cover;
    background-image: url('./assets/Signup.jpg');
  }
}
</style>
