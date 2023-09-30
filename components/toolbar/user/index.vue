<script lang="ts" setup>
const props = defineProps<{
  fetchNote: boolean
}>()

const route = useRoute()
const auth = await useAuth()
</script>

<template>
  <div>
    <template v-if="auth.isLogin">
      <ToolbarUserMenu :fetch-note="props.fetchNote" />
    </template>

    <template v-else>
      <NuxtLink :to="{ path: '/user/login', query: { from: route.path } }">
        <UserAvatar hide-title class="w-10 h-10 rounded-full" />
      </NuxtLink>
    </template>
  </div>
</template>
