export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  if (!user.value) {
    const route = useRoute()
    return navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
  }
})
