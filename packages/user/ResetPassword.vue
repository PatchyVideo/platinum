<template>
  <div
    class="reset-password h-screen w-full md:min-h-xl bg-bottom bg-no-repeat bg-cover dark:filter dark:brightness-75"
  >
    <!-- Mobile view -->
    <div
      v-if="screenSizes['<md']"
      class="flex-wrap content-between w-full h-full p-5 shadow filter drop-shadow-md backdrop-filter backdrop-blur-sm flex"
    >
      <div class="w-full text-center">
        <Logo :larger="20" />
        <div class="text-lg">
          {{ t('user.reset-password.title') }}
        </div>
      </div>
      <div class="w-full space-y-3">
        <div>
          <div class="flex w-full border-b border-black dark:border-white">
            <div class="i-uil:padlock align-middle text-2xl" />
            <input
              v-model="password"
              type="password"
              class="outline-none w-full bg-transparent placeholder-gray-700 text-gray-700 dark:placeholder-white dark:text-white"
              :placeholder="t('user.reset-password.password.placeholder')"
            >
          </div>
          <div class="text-red-500 text-sm h-4">
            {{ passwordStatus }}
          </div>
        </div>
        <div>
          <div class="flex w-full border-b border-black dark:border-white">
            <div class="i-uil:padlock align-middle text-2xl" />
            <input
              v-model="password2"
              type="password"
              class="outline-none w-full bg-transparent placeholder-gray-700 text-gray-700 dark:placeholder-white dark:text-white"
              :placeholder="t('user.reset-password.password2.placeholder')"
              @keydown.enter="reset"
            >
          </div>
          <div class="text-red-500 text-sm h-4">
            {{ password2Status }}
          </div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="resetStatus === 'loading'"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300"
            @click="reset"
          >
            {{
              resetStatus === 'loading'
                ? t('user.reset-password.reset-status.loading')
                : t('user.reset-password.reset-status.ready')
            }}
          </button>
          <div v-if="resetStatus === 'error'" class="text-red-500">
            {{ errmsg }}
          </div>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full" />
      <div>© VoileLabs 2019-2022</div>
    </div>
    <!-- Desktop view -->
    <div
      v-else
      class="flex-wrap content-between w-80 h-full p-5 bg-white bg-opacity-50 filter drop-shadow-md backdrop-filter backdrop-blur-sm ml-48 text-black flex"
    >
      <div class="w-full">
        <Logo :larger="20" />
        <div class="text-lg text-center">
          {{ t('user.reset-password.title') }}
        </div>
      </div>
      <div class="w-full space-y-3">
        <div>
          <div class="flex w-full border-b border-black">
            <div class="i-uil:padlock align-middle text-2xl" />
            <input
              v-model="password"
              type="password"
              class="outline-none w-full bg-transparent placeholder-gray-700 text-gray-700"
              :placeholder="t('user.reset-password.password.placeholder')"
            >
          </div>
          <div class="text-red-500 text-sm h-4">
            {{ passwordStatus }}
          </div>
        </div>
        <div>
          <div class="flex w-full border-b border-black">
            <div class="i-uil:padlock align-middle text-2xl" />
            <input
              v-model="password2"
              type="password"
              class="outline-none w-full bg-transparent placeholder-gray-700 text-gray-700"
              :placeholder="t('user.reset-password.password2.placeholder')"
              @keydown.enter="reset"
            >
          </div>
          <div class="text-red-500 text-sm h-4">
            {{ password2Status }}
          </div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="resetStatus === 'loading'"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300 disabled:hover:bg-blue-300 disabled:hover:cursor-not-allowed"
            @click="reset"
          >
            {{
              resetStatus === 'loading'
                ? t('user.reset-password.reset-status.loading')
                : t('user.reset-password.reset-status.ready')
            }}
          </button>
          <div v-if="resetStatus === 'error'" class="text-red-500">
            {{ errmsg }}
          </div>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full" />
      <div>© VoileLabs 2019-2022</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { screenSizes } from '@/css'
import { resDataStatus } from '@/common/libs/resDataStatus'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import Logo from '@/common/components/Logo.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
setSiteTitle(`${t('user.reset-password.title')} - PatchyVideo`)

const resetStatus = ref<'ready' | 'loading' | 'error'>('ready')
const PasswordStatus = {
  fine: t('user.reset-password.password.password-status.fine'),
  tip: t('user.reset-password.password.password-status.tip'),
  msg: t('user.reset-password.password.password-status.msg'),
}
const passwordStatus = ref<string>(PasswordStatus.fine)
const Password2Status = {
  fine: t('user.reset-password.password2.password2-status.fine'),
  tip: t('user.reset-password.password2.password2-status.tip'),
  msg: t('user.reset-password.password2.password2-status.msg'),
}
const password2Status = ref<string>(Password2Status.fine)

const password = ref<string>()
const password2 = ref<string>()
const resetKey = computed(() => route.query.key)
const errmsg = ref<string>('')

async function reset(): Promise<void> {
  if (resetStatus.value === 'loading')
    return
  resetStatus.value = 'loading'

  /* Form validation  */
  let valid = true
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
  if (!password2.value) {
    valid = false
    password2Status.value = Password2Status.tip
  }
  else if (password2.value !== password.value) {
    valid = false
    password2Status.value = Password2Status.msg
  }
  else {
    password2Status.value = Password2Status.fine
  }
  if (!resetKey.value) {
    resetStatus.value = 'error'
    errmsg.value = t('user.reset-password.reset-status.error')
    return
  }
  if (!valid) {
    resetStatus.value = 'ready'
    return
  }

  await fetch('https://patchyvideo.com/be/user/resetpass.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      reset_key: resetKey.value,
      new_pass: password.value,
    }),
    credentials: 'include',
  })
    .then(data => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) {
        router.push({ path: '/user/redirect', query: { from: 'reset-password' } })
      }
      else {
        resetStatus.value = 'error'
        errmsg.value = res.dataerr.reason
      }
    })
    .catch((err) => {
      // console.log(err)
      resetStatus.value = 'error'
      errmsg.value = err
    })
}
</script>

<style lang="postcss" scoped>
@media (max-width: 720px) {
  .reset-password {
    background-image: url('./assets/SignupMobile.jpg');
  }
}
@media (min-width: 720px) {
  .reset-password {
    background-image: url('./assets/Signup.jpg');
  }
}
</style>
