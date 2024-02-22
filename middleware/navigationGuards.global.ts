export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = await useAuth()

  if (to.meta.requiresAuth && !auth.isLogin)
    return navigateTo('/')
})
