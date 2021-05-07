<template>
  <div class="sign-up-mobile h-screen w-full md:min-h-xl flex justify-end dark:filter-brightness md:sign-up-md">
    <!-- Desktop view -->
    <div
      class="sign-up-box flex-wrap content-between w-80 h-full p-5 bg-white bg-opacity-50 blur-2 shadow mr-50 hidden md:flex"
    >
      <Logo :larger="20"></Logo>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-user class="align-middle w-7" />
            <input
              v-model="userName"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              placeholder="请输入用户名"
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
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              placeholder="请输入密码"
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
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              placeholder="请重复密码"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ password2Status }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-envelope class="align-middle w-7" />
            <input
              v-model="email"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              placeholder="请绑定邮箱"
              @keydown.enter="signup"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ emailStatus }}</div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="signupStatus === SignupStatus.loading"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300 disabled:hover:bg-blue-300 disabled:hover:cursor-not-allowed"
            @click="signup"
          >
            {{ signupStatus === SignupStatus.loading ? '注册中...' : '注册' }}
          </button>
          <div v-if="signupStatus === SignupStatus.error" class="text-red-500">{{ errmsg }}</div>
          <router-link class="block text-blue-600 text-right hover:text-blue-800" to="/user/login">←登录</router-link>
        </div>
      </div>
      <!-- This div is only for placeholder  -->
      <div class="h-20 w-full"></div>
      <div>© PatchyVideo 2020-2021</div>
    </div>

    <!-- Mobile view -->
    <div class="flex-wrap content-between w-full h-full p-5 blur-2 shadow dark:text-white flex md:hidden">
      <Logo class="text-black" :larger="20"></Logo>
      <div class="w-full space-y-2">
        <div>
          <div class="flex w-full border-b-1 border-black dark:border-white">
            <icon-uil-user class="align-middle w-7" />
            <input
              v-model="userName"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900 dark:placeholder-white"
              placeholder="请输入用户名"
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
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900 dark:placeholder-white"
              placeholder="请输入密码"
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
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900 dark:placeholder-white"
              placeholder="请重复密码"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ password2Status }}</div>
        </div>
        <div>
          <div class="flex w-full border-b-1 border-black dark:border-white">
            <icon-uil-envelope class="align-middle w-7" />
            <input
              v-model="email"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900 dark:placeholder-white"
              placeholder="请绑定邮箱"
              @keydown.enter="signup"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ emailStatus }}</div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="signupStatus === SignupStatus.loading"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300"
            @click="signup"
          >
            {{ signupStatus === SignupStatus.loading ? '注册中...' : '注册' }}
          </button>
          <div v-if="signupStatus === SignupStatus.error" class="text-red-500">{{ errmsg }}</div>
          <router-link class="block text-right text-gray-300" to="/user/login">←登录</router-link>
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
import { useRouter } from 'vue-router'
import { resDataStatus } from '@/common/lib/resDataStatus'
import Logo from '@/common/components/Logo.vue'

export default defineComponent({
  components: { Logo },
  props: {},
  setup() {
    const router = useRouter()
    setSiteTitle('注册 - PatchyVideo')

    enum SignupStatus {
      'ready' = 'ready',
      'loading' = 'loading',
      'error' = 'error',
    }
    const signupStatus = ref<string>(SignupStatus.ready)
    enum UsernameStatus {
      'fine' = ' ',
      'tip' = '请输入用户名！',
      'msg' = '长度在 2 到 32 个字符!',
      'res' = '该用户名已被注册！',
      'err' = '网络错误！',
    }
    const usernameStatus = ref<string>(UsernameStatus.fine)
    enum PasswordStatus {
      'fine' = ' ',
      'tip' = '请输入密码!',
      'msg' = '长度在 6 到 64 个字符!',
    }
    const passwordStatus = ref<string>(PasswordStatus.fine)
    enum Password2Status {
      'fine' = ' ',
      'tip' = '请再次输入密码!',
      'msg' = '两次密码输入不一致！',
    }
    const password2Status = ref<string>(Password2Status.fine)
    const emailFormat = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    enum EmailStatus {
      'fine' = ' ',
      'tip' = '请输入邮箱!',
      'msg' = '请输入正确的邮箱格式！',
      'res' = '该邮箱已被注册！',
      'err' = '网络错误！',
    }
    const emailStatus = ref<string>(EmailStatus.fine)

    const userName = ref<string>('')
    const password = ref<string>('')
    const password2 = ref<string>('')
    const email = ref<string>('')
    const errmsg = ref<string>('')

    async function signup(): Promise<void> {
      if (signupStatus.value === SignupStatus.loading) return
      signupStatus.value = SignupStatus.loading

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
            console.log(res)
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
        signupStatus.value = SignupStatus.ready
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
            signupStatus.value = SignupStatus.error
            errmsg.value = '未知错误'
          }
        })
        .catch((err) => {
          // console.log(err)
          signupStatus.value = SignupStatus.error
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
            router.push('/user/signup-redirect')
          } else {
            signupStatus.value = SignupStatus.error
            errmsg.value = res.dataerr.reason
          }
        })
        .catch((err) => {
          // console.log(err)
          signupStatus.value = SignupStatus.error
          errmsg.value = err
        })
    }

    return {
      SignupStatus,
      signupStatus,
      usernameStatus,
      passwordStatus,
      password2Status,
      emailStatus,
      userName,
      password,
      password2,
      email,
      errmsg,
      signup,
    }
  },
})
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
.sign-up-box {
  filter: drop-shadow(0 0 0.25rem rgba(255, 255, 255, 0.25));
}
</style>
