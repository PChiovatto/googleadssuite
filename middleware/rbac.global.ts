export default defineNuxtRouteMiddleware(async (to) => {
  // Allow internal endpoints or static routes
  if (to.path.startsWith('/_nuxt') || to.path.startsWith('/api') || to.path.startsWith('/favicon')) {
    return
  }

  // Public external client routes (e.g. client tracking portal, contract signatures)
  if (to.path.startsWith('/portal') || to.path.startsWith('/contracts')) {
    return
  }

  const { currentUser, teamUsers, fetchAuth, switchUser, canAccessPath, getDefaultRoute } = useWorkspaceAuth()

  // Ensure active user is loaded
  if (!currentUser.value) {
    await fetchAuth()
  }

  // Handle emergency URL switch query param: ?switch=master, ?role=master, ?reset=1
  const switchQuery = (to.query.switch || to.query.role || '') as string
  if (
    to.query.reset === '1' ||
    switchQuery.toLowerCase() === 'master' ||
    switchQuery.toLowerCase() === 'admin'
  ) {
    if (teamUsers.value.length === 0) {
      await fetchAuth()
    }
    const master = teamUsers.value.find((u: any) => u.role === 'MASTER' || u.role === 'ADMIN')
    if (master && currentUser.value?.id !== master.id) {
      await switchUser(master.id)
      return navigateTo('/')
    }
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
