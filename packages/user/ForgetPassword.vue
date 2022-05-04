<template>
  <div
    class="forget-password h-screen w-full md:min-h-xl flex justify-end bg-center bg-no-repeat bg-cover dark:filter dark:brightness-75"
  >
    <!-- Mobile view -->
    <div
      v-if="screenSizes['<md']"
      class="flex-wrap content-between w-full h-full p-5 shadow text-white flex filter drop-shadow-md backdrop-filter backdrop-blur-sm"
    >
      <div class="w-full text-center">
        <Logo :larger="20" />
        <div class="text-lg">
          {{ t('user.forget-password.title') }}
        </div>
      </div>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b border-white">
            <div class="i-uil:envelope align-middle text-2xl" />
            <input
              v-model="email"
              class="outline-none w-full bg-transparent placeholder-white"
              :placeholder="t('user.forget-password.email.placeholder')"
              @keydown.enter="sendEmail"
            >
          </div>
          <div class="text-red-500 text-sm h-4">
            {{ emailStatus }}
          </div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="sendStatus === 'loading'"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300"
            @click="sendEmail"
          >
            {{
              sendStatus === 'loading'
                ? t('user.forget-password.send-status.loading')
                : t('user.forget-password.send-status.ready')
            }}
          </button>
          <div v-if="sendStatus === 'error'" class="text-red-500">
            {{ errmsg }}
          </div>
          <RouterLink class="block text-right text-blue-600" to="/user/login">
            {{
              `←${t('user.forget-password.login')}`
            }}
          </RouterLink>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full" />
      <div>© VoileLabs 2019-2022</div>
    </div>
    <!-- Desktop view -->
    <div
      v-else
      class="flex mr-50 p-5 w-80 h-full flex-wrap content-between text-black bg-white bg-opacity-50 filter drop-shadow-md backdrop-filter backdrop-blur-sm"
    >
      <div class="w-full">
        <Logo :larger="20" />
        <div class="text-lg text-center">
          {{ t('user.forget-password.title') }}
        </div>
      </div>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b border-black">
            <div class="i-uil:envelope align-middle text-2xl" />
            <input
              v-model="email"
              class="outline-none w-full bg-transparent placeholder-gray-700 text-gray-700"
              :placeholder="t('user.forget-password.email.placeholder')"
              @keydown.enter="sendEmail"
            >
          </div>
          <div class="text-red-500 text-sm h-4">
            {{ emailStatus }}
          </div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="sendStatus === 'loading'"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300 disabled:hover:bg-blue-300 disabled:hover:cursor-not-allowed"
            @click="sendEmail"
          >
            {{
              sendStatus === 'loading'
                ? t('user.forget-password.send-status.loading')
                : t('user.forget-password.send-status.ready')
            }}
          </button>
          <div v-if="sendStatus === 'error'" class="text-red-500">
            {{ errmsg }}
          </div>
          <RouterLink class="block text-blue-600 text-right hover:text-blue-800" to="/user/login">
            {{
              `←${t('user.forget-password.login')}`
            }}
          </RouterLink>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full" />
      <div>© VoileLabs 2019-2022</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setSiteTitle } from '@/common/libs/setSiteTitle'
import { locale } from '@/locales'
import { resDataStatus } from '@/common/libs/resDataStatus'
import Logo from '@/common/components/Logo.vue'
import { screenSizes } from '@/css'
import { MessageType, PvMessage } from '@/ui/libs/PvMessage'

const { t } = useI18n()
setSiteTitle(`${t('user.forget-password.title')} - PatchyVideo`)

const sendStatus = ref<'ready' | 'loading' | 'error'>('ready')
const emailFormat
  = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const EmailStatus = {
  fine: t('user.forget-password.email.email-status.fine'),
  tip: t('user.forget-password.email.email-status.tip'),
  msg: t('user.forget-password.email.email-status.msg'),
}
const emailStatus = ref<string>(EmailStatus.fine)

const email = ref<string>('')
const errmsg = ref<string>(' ')

async function sendEmail(): Promise<void> {
  if (sendStatus.value === 'loading')
    return
  sendStatus.value = 'loading'

  /* Form validation  */
  let valid = true
  if (!email.value) {
    valid = false
    emailStatus.value = EmailStatus.tip
  }
  else if (!emailFormat.test(email.value)) {
    valid = false
    emailStatus.value = EmailStatus.msg
  }
  else {
    emailStatus.value = EmailStatus.fine
  }
  if (!valid) {
    sendStatus.value = 'ready'
    return
  }
  await fetch('https://patchyvideo.com/be/user/request_resetpass.do', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      email: email.value,
      lang: locale.value,
    }),
    credentials: 'include',
  })
    .then(data => data.json())
    .then((res) => {
      // console.log(res)
      if (res.status === resDataStatus.SUCCEED) {
        sendStatus.value = 'ready'
        PvMessage({ message: t('user.forget-password.send-status.successful'), type: MessageType.warning })
      }
      else if (res.status === resDataStatus.FAILED) {
        sendStatus.value = 'error'
        errmsg.value = t('user.forget-password.send-status.failed')
      }
      else {
        sendStatus.value = 'error'
        errmsg.value = t('user.forget-password.send-status.error')
      }
    })
    .catch((err) => {
      // console.log(err)
      sendStatus.value = 'error'
      errmsg.value = err
    })
}
</script>

<style lang="postcss" scoped>
@media (max-width: 720px) {
  .forget-password {
    background-image: url('./assets/LoginMobile.jpg');
  }
}
@media (min-width: 720px) {
  .forget-password {
    background-image: url('./assets/Login.jpg');
  }
}
</style>
