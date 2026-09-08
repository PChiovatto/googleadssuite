export default defineNuxtRouteMiddleware(async (to) => {
  // Allow internal endpoints or static routes
  if (to.path.startsWith('/_nuxt') || to.path.startsWith('/api') || to.path.startsWith('/favicon')) {
    return
  }

  // Public external client routes (e.g. client tracking portal, contract signatures)
  if (to.path.startsWith('/portal') || to.path.startsWith('/contracts')) {
    return
  }

  const { currentUser, fetchAuth, canAccessPath, getDefaultRoute } = useWorkspaceAuth()

  // Ensure active user is loaded
  if (!currentUser.value) {
    await fetchAuth()
  }

  const role = currentUser.value?.role

  // Check if current user role has access to destination route
  if (!canAccessPath(to.path)) {
    const destination = getDefaultRoute(role)
    if (to.path !== destination) {
      return navigateTo(destination)
    }
  }
})
