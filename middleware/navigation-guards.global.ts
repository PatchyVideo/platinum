export default defineNuxtRouteMiddleware(async (to, _from) => {
  const auth = await useAuth()

  if (to.meta.requiresAuth && !auth.isLogin)
    return navigateTo('/')
})
