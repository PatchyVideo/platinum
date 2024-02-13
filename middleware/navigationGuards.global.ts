export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = await useAuth()

  if (to.path === '/notification' && !auth.isLogin)
    return navigateTo('/')
})
