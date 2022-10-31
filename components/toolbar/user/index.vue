<script lang="ts" setup>
const auth = await useAuth()
</script>

<template>
  <template v-if="auth.isLogin">
    <ToolbarUserMenu />
  </template>

  <template v-else>
    <NuxtLink to="/user/login">
      <UserAvatar hide-title class="w-10 h-10 rounded-full" />
    </NuxtLink>
  </template>
</template>
