<template>
  <div class="log-in h-screen w-full md:min-h-xl dark:filter-brightness">
    <!-- Desktop view -->
    <div
      class="log-in-box flex-wrap content-between w-80 h-full p-5 bg-white bg-opacity-50 blur-2 shadow ml-50 hidden md:flex"
    >
      <Logo :larger="20"></Logo>
      <div class="w-full space-y-3">
        <div>
          <div class="flex w-full border-b-1 border-black">
            <icon-uil-user class="align-middle w-7" />
            <input
              v-model="userName"
              class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
              placeholder="请输入用户名或邮箱"
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
              placeholder="请输入密码"
              @keydown.enter="login"
            />
          </div>
          <div class="text-red-500 text-sm h-4">{{ passwordStatus }}</div>
        </div>
        <div class="space-y-1">
          <button
            :disabled="loginStatus === LoginStatus.loading"
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700 disabled:bg-blue-300 disabled:focus:bg-blue-300 disabled:hover:bg-blue-300 disabled:hover:cursor-not-allowed"
            @click="login"
          >
            {{ loginStatus === LoginStatus.loading ? '登录中...' : '登录' }}
          </button>
          <div v-if="loginStatus === LoginStatus.error" class="text-red-500">{{ errmsg }}</div>
          <router-link class="block text-blue-600 hover:text-blue-800" to="/user/signup">注册→</router-link>
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
import { useRouter } from 'vue-router'
import { resDataStatus } from '@/common/lib/resDataStatus'
import { setUserDataToLocalStorage, getUserDataFromLocalStorage } from '@/user/index'
import { setSiteTitle } from '@/common/lib/setSiteTitle'
import Logo from '@/common/components/Logo.vue'

export default defineComponent({
  components: { Logo },
  props: {},
  setup() {
    const router = useRouter()
    setSiteTitle('登录 - PatchyVideo')

    enum LoginStatus {
      'ready' = 'ready',
      'loading' = 'loading',
      'error' = 'error',
    }
    const loginStatus = ref<string>(LoginStatus.ready)
    enum UsernameStatus {
      'fine' = ' ',
      'tip' = '请输入用户名或邮箱！',
      'msg' = '长度在 2 到 32 个字符!',
    }
    const usernameStatus = ref<string>(UsernameStatus.fine)
    enum PasswordStatus {
      'fine' = ' ',
      'tip' = '请输入密码!',
      'msg' = '长度在 6 到 64 个字符!',
    }
    const passwordStatus = ref<string>(PasswordStatus.fine)

    const userName = ref<string>('')
    const password = ref<string>('')
    const errmsg = ref<string>('')

    async function login(): Promise<void> {
      if (loginStatus.value === LoginStatus.loading) return
      loginStatus.value = LoginStatus.loading

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
        loginStatus.value = LoginStatus.ready
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
            loginStatus.value = LoginStatus.error
            errmsg.value = '未知错误'
          }
        })
        .catch((err) => {
          // console.log(err)
          loginStatus.value = LoginStatus.error
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
            loginStatus.value = LoginStatus.ready
            setUserDataToLocalStorage(
              res.data.username,
              res.data.image,
              res.data.access_control_status === 'admin' ? true : false
            )
            getUserDataFromLocalStorage()
            router.push({ path: '/' })
            return
          } else if (res.status === resDataStatus.FAILED) {
            loginStatus.value = LoginStatus.error
            errmsg.value = '用户名或密码错误！'
          } else {
            loginStatus.value = LoginStatus.error
            errmsg.value = res.dataerr.reason
          }
        })
        .catch((err) => {
          // console.log(err)
          loginStatus.value = LoginStatus.error
          errmsg.value = err
        })
    }
    return { LoginStatus, loginStatus, usernameStatus, passwordStatus, userName, password, errmsg, login }
  },
})
</script>

<style lang="postcss" scoped>
.log-in {
  @apply bg-center;
  @apply bg-no-repeat;
  @apply bg-cover;
  background-image: url('./assets/Login.jpg');
}
.log-in-box {
  filter: drop-shadow(0 0 0.25rem rgba(255, 255, 255, 0.25));
}
</style>
