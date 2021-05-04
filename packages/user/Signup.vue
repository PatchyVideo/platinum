<template>
  <div class="log-in h-screen w-full md:min-h-xl flex justify-end dark:filter-brightness">
    <!-- Desktop view -->
    <div
      class="log-in-box flex-wrap content-between w-80 h-full p-5 bg-white bg-opacity-50 blur-2 shadow mr-50 hidden md:flex"
    >
      <Logo :larger="20"></Logo>
      <div class="w-full space-y-6">
        <div class="flex w-full border-b-1 border-black">
          <icon-uil-user class="align-middle w-7" />
          <input
            class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
            placeholder="请输入用户名"
          />
        </div>
        <div class="flex w-full border-b-1 border-black">
          <icon-uil-lock-open-alt class="align-middle w-7" />
          <input
            type="password"
            class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
            placeholder="请输入密码"
          />
        </div>
        <div class="flex w-full border-b-1 border-black">
          <icon-uil-padlock class="align-middle w-7" />
          <input
            type="password"
            class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
            placeholder="请重复密码"
          />
        </div>
        <div class="flex w-full border-b-1 border-black">
          <icon-uil-envelope class="align-middle w-7" />
          <input
            class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
            placeholder="请绑定邮箱"
          />
        </div>
        <div class="space-y-1">
          <button
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          >
            注册
          </button>
          <router-link class="block text-blue-600 text-right hover:text-blue-800" to="/user/login">←登录</router-link>
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
import Logo from '@/common/components/Logo.vue'

export default defineComponent({
  components: { Logo },
  props: {},
  setup() {
    return {}
  },
})
</script>

<style lang="postcss" scoped>
.log-in {
  @apply bg-bottom;
  @apply bg-no-repeat;
  @apply bg-cover;
  background-image: url('./assets/Signup.jpg');
}
.log-in-box {
  filter: drop-shadow(0 0 0.25rem rgba(255, 255, 255, 0.25));
}
</style>
