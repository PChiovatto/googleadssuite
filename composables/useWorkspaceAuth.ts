import { ref, computed } from 'vue'

const currentUser = ref<any>(null)
const teamUsers = ref<any[]>([])
const loadingAuth = ref(false)

export function useWorkspaceAuth() {
  const isManager = computed(() => currentUser.value?.role === 'MANAGER')
  const isConsultant = computed(() => currentUser.value?.role === 'CONSULTANT')

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
      console.error('Erro ao carregar autenticação do workspace:', err)
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
        // Refresh page or trigger reactivity
        window.location.reload()
      }
    } catch (err) {
      console.error('Erro ao alternar usuário:', err)
    } finally {
      loadingAuth.value = false
    }
  }

  return {
    currentUser,
    isManager,
    isConsultant,
    teamUsers,
    loadingAuth,
    fetchAuth,
    switchUser
  }
}
