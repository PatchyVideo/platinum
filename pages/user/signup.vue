<script setup lang="ts">
import type { GlobalComponents } from 'vue'

definePageMeta({
  layout: false,
})

const router = useRouter()
const { t } = useI18n()

useHead({
  title: () => `${t('user.signup.title')}`,
})

const usernameEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)
const passwordEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)
const passwordRepEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)
const emailEl = shallowRef<InstanceType<GlobalComponents['PFormInput']> | null>(null)

const username = ref('')
const password = ref('')
const passwordRep = ref('')
const email = ref('')
const emailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function usernameValidator(value: string) {
  return value.length >= 2 && value.length <= 32
}
const usernameValid = computed(() => usernameValidator(username.value))
function passwordValidator(value: string) {
  return value.length >= 6 && value.length <= 32
}
const passwordValid = computed(() => passwordValidator(password.value))
function passwordRepValidator(value: string) {
  return value === password.value
}
const passwordRepValid = computed(() => passwordRepValidator(passwordRep.value))
function emailRepValidator(value: string) {
  return emailFormat.test(value)
}
const emailValid = computed(() => emailRepValidator(email.value))

// When "user name exists!" or "email is already been used!" appears for seveal times,
// user will doubts whether the page stucks, this count is used to show the page works.
const errorCount = ref(0)

const loading = ref<0 | 1 | 2>(0)
const signupError = ref<string>()
async function signup() {
  if (!username.value) {
    signupError.value = t('user.signup.username.username-status.tip')
    usernameEl.value?.focus()
    return
  }
  if (!usernameValid.value) {
    signupError.value = t('user.signup.username.username-status.msg')
    usernameEl.value?.focus()
    return
  }
  if (!password.value) {
    signupError.value = t('user.signup.password.password-status.tip')
    passwordEl.value?.focus()
    return
  }
  if (!passwordValid.value) {
    signupError.value = t('user.signup.password.password-status.msg')
    passwordEl.value?.focus()
    return
  }
  if (!passwordRep.value) {
    signupError.value = t('user.signup.password2.password2-status.tip')
    passwordRepEl.value?.focus()
    return
  }
  if (!passwordRepValid.value) {
    signupError.value = t('user.signup.password2.password2-status.msg')
    passwordRepEl.value?.focus()
    return
  }
  if (!email.value) {
    signupError.value = t('user.signup.email.email-status.tip')
    emailEl.value?.focus()
    return
  }
  if (!emailValid.value) {
    signupError.value = t('user.signup.email.email-status.msg')
    emailEl.value?.focus()
    return
  }

  loading.value = 1
  let fin = true

  try {
    try {
      const data = await $fetch<{
        status: 'SUCCEED' | 'FAILED' | 'ERROR'
        data?: string
      }>('https://patchyvideo.com/be/user/email_avail.do', {
        method: 'POST',
        body: {
          email: email.value,
        },
      })

      // 'res.data=true' means the email already been used
      if (data.data) {
        errorCount.value++
        signupError.value = t('user.signup.email.email-status.res') + (errorCount.value >= 3 ? `(${errorCount.value})` : '')
        return
      }
      else if (data.status !== 'SUCCEED') {
        signupError.value = t('user.signup.email.email-status.err')
        return
      }
    }
    catch (err) {
      signupError.value = String(err)
      return
    }

    try {
      const data = await $fetch<{
        status: 'SUCCEED' | 'FAILED' | 'ERROR'
        data?: string
      }>('https://patchyvideo.com/be/user/exists.do', {
        method: 'POST',
        body: {
          username: username.value,
        },
      })

      // 'res.data=true' means the user already exists
      if (data.data) {
        errorCount.value++
        signupError.value = t('user.signup.username.username-status.res') + (errorCount.value >= 3 ? `(${errorCount.value})` : '')
        return
      }
      else if (data.status !== 'SUCCEED') {
        signupError.value = t('user.signup.username.username-status.err')
        return
      }
    }
    catch (err) {
      signupError.value = String(err)
      return
    }

    let session = ''
    try {
      const data = await $fetch<{
        status: 'SUCCEED' | 'FAILED' | 'ERROR'
        data?: string
      }>('https://patchyvideo.com/be/auth/get_session.do', {
        method: 'POST',
        body: {
          type: 'SIGNUP',
        },
      })

      if (data.status !== 'SUCCEED') {
        signupError.value = t('user.signup.signup-status.error')
        return
      }

      session = data.data!
    }
    catch (err) {
      signupError.value = String(err)
      return
    }

    try {
      const data = await $fetch<{
        status: 'SUCCEED' | 'FAILED' | 'ERROR'
        dataerr?: {
          reason: string
        }
      }>('https://patchyvideo.com/be/signup.do', {
        method: 'POST',
        body: {
          username: username.value,
          password: password.value,
          email: email.value,
          session,
        },
      })

      if (data.status !== 'SUCCEED') {
        signupError.value = data.dataerr?.reason
        return
      }
    }
    catch (err) {
      signupError.value = String(err)
      return
    }

    loading.value = 2
    setTimeout(() => {
      router.push({ path: '/user/login', query: { from: 'signup' } })
    }, 1500)
    fin = false
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
        class="flex m-5 md:m-auto px-8 md:px-10 pt-5 pb-8 md:py-12 w-full max-w-108 flex-col gap-3 md:gap-6 rounded-md shadow-xl shadow-purple-400/60 bg-white/80 ring-2 ring-purple-400 dark:bg-gray-800/70 dark:ring-gray-600 dark:text-gray-200 dark:shadow-gray-700"
        @submit.prevent="signup"
      >
        <div class="flex mb-2 mx-auto items-center">
          <NuxtLink to="/">
            <Logo :larger="8" />
          </NuxtLink>

          <span class="ml-2 pl-4 text-lg border-l-2 border-gray-400">{{ t('user.signup.title') }}</span>
        </div>

        <div v-if="signupError" class="p-2 text-rose-600 rounded-lg ring-2 ring-rose-400 bg-white/50">
          <p class="text-center">
            {{ signupError }}
          </p>
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="emailEl"
            v-model="email"
            :label="t('user.signup.email.email-label')"
            type="text"
            :validator="emailRepValidator"
            @enter="() => emailEl?.focus()"
          />
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="usernameEl"
            v-model="username"
            :label="t('user.signup.username.username-label')"
            type="text"
            :validator="usernameValidator"
            @enter="() => passwordEl?.focus()"
          />
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="passwordEl"
            v-model="password"
            :label="t('user.signup.password.password-label')"
            type="password"
            :validator="passwordValidator"
            @enter="signup"
          />
        </div>

        <div class="flex flex-nowrap gap-1 items-end">
          <PFormInput
            ref="passwordRepEl"
            v-model="passwordRep"
            :label="t('user.signup.password.password-rep-label')"
            type="password"
            :validator="passwordRepValidator"
            @enter="signup"
          />
        </div>

        <div class="mt-2">
          <button
            class="focus:outline-none w-full py-2 text-white font-bold rounded-md bg-purple-500 disabled:bg-purple-300 hover:bg-purple-600 disabled:hover:bg-purple-300"
            type="submit"
            :disabled="loading > 0"
          >
            {{ loading === 2
              ? t('user.signup.signup-status.success')
              : loading === 1
                ? t('user.signup.signup-status.loading')
                : t('user.signup.signup-status.ready') }}
          </button>
        </div>

        <div class="flex -mt-2 justify-center gap-2 text-purple-600 text-sm">
          <NuxtLink :to="{ path: '/user/login', query: { from: 'signup' } }">
            {{ t('user.signup.signup-status.back-login') }}
          </NuxtLink>
          <span class="text-gray-400">|</span>
          <NuxtLink to="/user/forget-password">
            {{ t('user.signup.signup-status.forget-password') }}
          </NuxtLink>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>
