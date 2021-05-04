<template>
  <div class="log-in h-screen w-full md:min-h-xl dark:filter-brightness">
    <!-- Desktop view -->
    <div
      class="log-in-box flex-wrap content-between w-80 h-full p-5 bg-white bg-opacity-50 blur-2 shadow ml-40 hidden md:flex"
    >
      <Logo :larger="20"></Logo>
      <div class="w-full space-y-5">
        <div class="flex w-full border-b-1 border-black">
          <icon-uil-user class="align-middle w-7" />
          <input
            class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
            placeholder="请输入用户名或邮箱"
          />
        </div>
        <div class="flex w-full border-b-1 border-black">
          <icon-uil-padlock class="align-middle w-7" />
          <input
            type="password"
            class="outline-none w-full bg-transparent placeholder-gray-900 text-gray-900"
            placeholder="请输入密码"
          />
        </div>
        <div class="space-y-1">
          <button
            class="w-full py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          >
            登录
          </button>
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
  @apply bg-center;
  @apply bg-no-repeat;
  @apply bg-cover;
  background-image: url('../common/assets/Login.jpg');
}
.log-in-box {
  filter: drop-shadow(0 0 0.25rem rgba(255, 255, 255, 0.25));
}
</style>
