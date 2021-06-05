<template>
  <div
    class="
      forget-password-mobile
      h-screen
      w-full
      md:min-h-xl
      flex
      justify-end
      dark:(filter
      brightness-80)
      md:forget-password-md
    "
  >
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
        text-white
        flex
        filter
        drop-shadow-md
        backdrop-filter backdrop-blur-sm
      "
    >
      <div class="w-full text-center">
        <Logo :larger="20"></Logo>
        <div class="text-lg">{{ t('user.forget-password.title') }}</div>
      </div>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b-1 border-white">
            <icon-uil-envelope class="align-middle w-7" />
            <input
              v-model="email"
              class="outline-none w-full bg-transparent placeholder-white"
              :placeholder="t('user.forget-password.email.placeholder')"
              @keydown.enter="sendEmail"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ emailStatus }}</div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="sendStatus === SendStatus.loading"
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
            @click="sendEmail"
          >
            {{
              sendStatus === SendStatus.loading
                ? t('user.forget-password.send-status.loading')
                : t('user.forget-password.send-status.ready')
            }}
          </button>
          <div v-if="sendStatus === SendStatus.error" class="text-red-500">{{ errmsg }}</div>
          <router-link class="block text-right text-blue-600" to="/user/login">{{
            '←' + t('user.forget-password.login')
          }}</router-link>
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
        mr-50
        text-black
        flex
      "
    >
      <div class="w-full">
        <Logo :larger="20"></Logo>
        <div class="text-lg text-center">{{ t('user.forget-password.title') }}</div>
      </div>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-envelope class="align-middle w-7" />
            <input
              v-model="email"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              :placeholder="t('user.forget-password.email.placeholder')"
              @keydown.enter="sendEmail"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ emailStatus }}</div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="sendStatus === SendStatus.loading"
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
            @click="sendEmail"
          >
            {{
              sendStatus === SendStatus.loading
                ? t('user.forget-password.send-status.loading')
                : t('user.forget-password.send-status.ready')
            }}
          </button>
          <div v-if="sendStatus === SendStatus.error" class="text-red-500">{{ errmsg }}</div>
          <router-link class="block text-blue-600 text-right hover:text-blue-800" to="/user/login">{{
            '←' + t('user.forget-password.login')
          }}</router-link>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full"></div>
      <div>© PatchyVideo 2020-2021</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import { useI18n } from 'vue-i18n'
import { locale } from '@/locales'
import { resDataStatus } from '@/common/lib/resDataStatus'
import Logo from '@/common/components/Logo.vue'
import { screenSizes } from '@/tailwindcss'

export default defineComponent({
  components: { Logo },
  props: {},
  setup() {
    const { t } = useI18n()
    setSiteTitle(t('user.forget-password.title') + ' - PatchyVideo')

    enum SendStatus {
      'ready' = 'ready',
      'loading' = 'loading',
      'error' = 'error',
    }
    const sendStatus = ref<SendStatus>(SendStatus.ready)
    const emailFormat =
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const EmailStatus = {
      fine: t('user.forget-password.email.email-status.fine'),
      tip: t('user.forget-password.email.email-status.tip'),
      msg: t('user.forget-password.email.email-status.msg'),
    }
    const emailStatus = ref<string>(EmailStatus.fine)

    const email = ref<string>('')
    const errmsg = ref<string>(' ')

    async function sendEmail(): Promise<void> {
      if (sendStatus.value === SendStatus.loading) return
      sendStatus.value = SendStatus.loading

      /* Form validation  */
      let valid = true
      if (!email.value) {
        valid = false
        emailStatus.value = EmailStatus.tip
      } else if (!emailFormat.test(email.value)) {
        valid = false
        emailStatus.value = EmailStatus.msg
      } else {
        emailStatus.value = EmailStatus.fine
      }
      if (!valid) {
        sendStatus.value = SendStatus.ready
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
        .then((data) => data.json())
        .then((res) => {
          // console.log(res)
          if (res.status === resDataStatus.SUCCEED) {
            sendStatus.value = SendStatus.ready
            alert(t('user.forget-password.send-status.successful'))
          } else if (res.status === resDataStatus.FAILED) {
            sendStatus.value = SendStatus.error
            errmsg.value = t('user.forget-password.send-status.failed')
          } else {
            sendStatus.value = SendStatus.error
            errmsg.value = t('user.forget-password.send-status.error')
          }
        })
        .catch((err) => {
          // console.log(err)
          sendStatus.value = SendStatus.error
          errmsg.value = err
        })
    }

    return {
      t,
      screenSizes,
      email,
      errmsg,
      emailStatus,
      SendStatus,
      sendStatus,
      sendEmail,
    }
  },
})
</script>

<style lang="postcss" scoped>
.forget-password-mobile {
  @apply bg-center;
  @apply bg-no-repeat;
  @apply bg-cover;
  background-image: url('./assets/LoginMobile.jpg');
}
@variants md {
  .md\:forget-password-md {
    @apply bg-center;
    @apply bg-no-repeat;
    @apply bg-cover;
    background-image: url('./assets/Login.jpg');
  }
}
</style>
