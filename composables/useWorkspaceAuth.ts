import { ref, computed } from 'vue'

const currentUser = ref<any>(null)
const teamUsers = ref<any[]>([])
const loadingAuth = ref(false)

export function useWorkspaceAuth() {
  const isMaster = computed(() => currentUser.value?.role === 'MASTER' || currentUser.value?.role === 'ADMIN')
  const isCeo = computed(() => currentUser.value?.role === 'CEO' || currentUser.value?.role === 'MANAGER')
  const isManager = computed(() => isMaster.value || isCeo.value) // Backward compatibility
  const isSales = computed(() => currentUser.value?.role === 'SALES' || currentUser.value?.role === 'CONSULTANT')
  const isConsultant = computed(() => isSales.value) // Backward compatibility
  const isFieldWorker = computed(() => currentUser.value?.role === 'FIELD_WORKER')

  // Feature permission checks
  // 1. Settings / Credentials / Integrations: ONLY MASTER
  const canAccessSettings = computed(() => isMaster.value)

  // 2. Overview / Google Ads Analytics / Real ROAS / Marketing / Performance: MASTER or CEO
  const canAccessOverview = computed(() => isMaster.value || isCeo.value)
  const canAccessAds = computed(() => isMaster.value || isCeo.value)
  const canAccessFinancials = computed(() => isMaster.value || isCeo.value)
  const canAccessMarketing = computed(() => isMaster.value || isCeo.value)
  const canAccessPerformance = computed(() => isMaster.value || isCeo.value)

  // 3. Leads CRM / Webmail / VoIP Phone / Estimates Calendar: MASTER, CEO, or SALES
  const canAccessLeads = computed(() => isMaster.value || isCeo.value || isSales.value)
  const canAccessMail = computed(() => isMaster.value || isCeo.value || isSales.value)
  const canAccessCalls = computed(() => isMaster.value || isCeo.value || isSales.value)
  const canAccessCalendar = computed(() => isMaster.value || isCeo.value || isSales.value)

  // 4. Field operations & Timesheet: MASTER, CEO, or FIELD_WORKER
  const canAccessField = computed(() => isMaster.value || isCeo.value || isFieldWorker.value)

  function getDefaultRoute(role?: string): string {
    const r = role || currentUser.value?.role
    if (r === 'FIELD_WORKER') return '/field'
    if (r === 'SALES' || r === 'CONSULTANT') return '/dashboard/leads'
    return '/'
  }

  function canAccessPath(path: string): boolean {
    const r = currentUser.value?.role
    if (!r || r === 'MASTER' || r === 'ADMIN') return true

    if (r === 'FIELD_WORKER') {
      return (
        path === '/field' ||
        path.startsWith('/field/') ||
        path.startsWith('/portal') ||
        path.startsWith('/contracts')
      )
    }

    if (r === 'SALES' || r === 'CONSULTANT') {
      return (
        path === '/dashboard/leads' ||
        path.startsWith('/dashboard/leads/') ||
        path === '/mail' ||
        path.startsWith('/mail/') ||
        path === '/dashboard/calls' ||
        path.startsWith('/dashboard/calls/') ||
        path === '/dashboard/calendar' ||
        path.startsWith('/dashboard/calendar/') ||
        path.startsWith('/portal') ||
        path.startsWith('/contracts')
      )
    }

    if (r === 'CEO' || r === 'MANAGER') {
      // CEO cannot access /settings
      if (path === '/settings' || path.startsWith('/settings/')) {
        return false
      }
      return true
    }

    return true
  }

  async function fetchAuth() {
    loadingAuth.value = true
    try {
      const [meRes, usersRes] = await Promise.all([
        $fetch('/api/auth/me') as Promise<any>,
        $fetch('/api/auth/users') as Promise<any>
      ])

      if (meRes?.success && meRes?.user) {
        currentUser.value = meRes.user
      }

      if (usersRes?.success && usersRes?.users) {
        teamUsers.value = usersRes.users
      }
    } catch (err) {
      console.error('Error loading workspace auth:', err)
    } finally {
      loadingAuth.value = false
    }
  }

  async function switchUser(userId: string) {
    loadingAuth.value = true
    try {
      const res = await $fetch('/api/auth/switch', {
        method: 'POST',
        body: { userId }
      }) as any

      if (res?.success && res?.user) {
        currentUser.value = res.user
        const targetRoute = getDefaultRoute(res.user.role)
        window.location.href = targetRoute
      }
    } catch (err) {
      console.error('Error switching user:', err)
    } finally {
      loadingAuth.value = false
    }
  }

  return {
    currentUser,
    isMaster,
    isCeo,
    isManager,
    isSales,
    isConsultant,
    isFieldWorker,
    canAccessSettings,
    canAccessOverview,
    canAccessAds,
    canAccessFinancials,
    canAccessMarketing,
    canAccessPerformance,
    canAccessLeads,
    canAccessMail,
    canAccessCalls,
    canAccessCalendar,
    canAccessField,
    canAccessPath,
    getDefaultRoute,
    teamUsers,
    loadingAuth,
    fetchAuth,
    switchUser
  }
}
