<template>
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div>
        <!-- App Logo & Title -->
        <div class="p-4 border-b border-slate-800 bg-slate-950/70">
          <div class="bg-white rounded-2xl p-2.5 shadow-md flex items-center justify-center border border-slate-200">
            <img
              src="/logo.png"
              alt="Tony's Remodeling - Painting & Carpentry"
              class="w-full h-auto max-h-12 object-contain mx-auto"
            />
          </div>
          <div class="flex items-center justify-between mt-2.5 px-1">
            <span class="text-[9px] font-black uppercase tracking-wider text-[#D7070D] flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-[#D7070D] animate-pulse"></span>
              SHOWROOM WORKSPACE
            </span>
            <span class="text-[9px] font-bold text-slate-400 uppercase font-mono">
              MA HIC #204891
            </span>
          </div>
        </div>

        <!-- Navigation Links (Dynamic RBAC) -->
        <nav class="p-3.5 space-y-1.5">
          <!-- Common: Overview -->
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Home class="w-4 h-4" />
            <span>Início & Visão Geral</span>
          </NuxtLink>

          <!-- Manager Only: Google Ads Dashboard -->
          <NuxtLink
            v-if="isManager"
            to="/dashboard"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <LayoutDashboard class="w-4 h-4" />
            <span>Painel de Anúncios</span>
          </NuxtLink>

          <!-- Common: Leads & CRM Funnel -->
          <NuxtLink
            to="/dashboard/leads"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/leads' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <Users class="w-4 h-4" />
              <span>Funil de Leads & CRM</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
              Kanban
            </span>
          </NuxtLink>

          <!-- Common: In-App Webmail (Gmail Style) -->
          <NuxtLink
            to="/mail"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/mail' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <Inbox class="w-4 h-4 text-amber-400" />
              <span>Webmail In-App (SES)</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
              Gmail UI
            </span>
          </NuxtLink>

          <!-- Common: Calendar & In-Home Estimates -->
          <NuxtLink
            to="/dashboard/calendar"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/calendar' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Calendar class="w-4 h-4" />
            <span>Agenda & In-Home Estimates</span>
          </NuxtLink>

          <!-- Manager Only: Financial & Real ROAS -->
          <NuxtLink
            v-if="isManager"
            to="/dashboard/financial"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/financial' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <TrendingUp class="w-4 h-4 text-emerald-400" />
              <span>ROAS Real & Financeiro</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 rounded bg-emerald-500/20 text-emerald-300">Stripe</span>
          </NuxtLink>

          <!-- Common: VoIP Dial & Recordings -->
          <NuxtLink
            to="/dashboard/calls"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/calls' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <PhoneCall class="w-4 h-4" />
            <span>Central VoIP & Áudios</span>
          </NuxtLink>

          <!-- Common: Email Marketing Base & Broadcasts -->
          <NuxtLink
            to="/dashboard/marketing"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/marketing' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Mail class="w-4 h-4" />
            <span>Campanhas & E-mail Mkt</span>
          </NuxtLink>

          <!-- Restricted Manager Section -->
          <div v-if="isManager" class="pt-2">
            <span class="text-[9px] uppercase font-black tracking-widest text-slate-500 px-3.5 block mb-1">
              Painel Executivo (Manager)
            </span>
            <NuxtLink
              to="/admin/performance"
              class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              :class="$route.path === '/admin/performance' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-red-300 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center gap-3">
                <Award class="w-4 h-4 text-red-400" />
                <span>Ranking & SLA da Equipe</span>
              </div>
              <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/30 text-red-200">
                PRO
              </span>
            </NuxtLink>

            <NuxtLink
              to="/settings"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all mt-1"
              :class="$route.path === '/settings' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <Sliders class="w-4 h-4" />
              <span>Conexões & Credenciais</span>
            </NuxtLink>
          </div>
        </nav>
      </div>

      <!-- User Active Session Card / Footer -->
      <div class="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
        <div class="flex items-center gap-2.5">
          <img
            :src="currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'"
            alt="User Avatar"
            class="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
          />
          <div class="overflow-hidden flex-1">
            <span class="text-xs font-bold text-slate-200 block truncate leading-tight">
              {{ currentUser?.name || 'Tony Silva (Owner & GM)' }}
            </span>
            <span
              class="text-[9px] font-black uppercase tracking-wider block"
              :class="isManager ? 'text-purple-400' : 'text-emerald-400'"
            >
              {{ isManager ? '👑 GESTOR' : '👤 CONSULTOR' }}
            </span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header Bar with RBAC Switcher -->
      <header class="h-16 bg-white border-b border-slate-200/80 px-5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <!-- Left: Account & Role Indicator -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2.5">
            <img src="/emblem.png" alt="Tony's Emblem" class="w-7 h-7 rounded-full object-contain shadow-xs" />
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">Perfil Ativo:</span>
            <span
              class="text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
              :class="isManager ? 'bg-red-50 text-[#D7070D] border-red-200' : 'bg-slate-100 text-slate-800 border-slate-200'"
            >
              <span>{{ isManager ? '👑' : '👤' }}</span>
              <span>{{ currentUser?.name || 'Tony Silva (Owner & GM)' }}</span>
              <span class="text-[10px] font-mono opacity-70">({{ currentUser?.role || 'MANAGER' }})</span>
            </span>
          </div>
        </div>

        <!-- Right: Team Member Switcher (RBAC Mode Switch) & Actions -->
        <div class="flex items-center gap-3">
          <!-- Role Switcher for Multi-User Testing -->
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-[11px] font-bold text-slate-500 hidden md:inline">Simular Usuário:</span>
            <select
              :value="currentUser?.id"
              @change="onSwitchUser($event.target.value)"
              class="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-2xs transition-colors"
            >
              <option v-for="u in teamUsers" :key="u.id" :value="u.id">
                {{ u.role === 'MANAGER' ? '👑 Gestor: ' : '👤 Consultor: ' }} {{ u.name }}
              </option>
            </select>
          </div>

          <!-- Sync Button (Manager Only) -->
          <button
            v-if="isManager"
            @click="syncMetrics"
            :disabled="syncing"
            class="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': syncing }" />
            <span class="hidden sm:inline">{{ syncing ? 'Sincronizando...' : 'Sync Ads' }}</span>
          </button>
        </div>
      </header>

      <!-- Sync Toast Notification -->
      <div
        v-if="toastMessage"
        class="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in"
      >
        <span>✓</span>
        <span>{{ toastMessage }}</span>
      </div>

      <!-- Page Content -->
      <main class="flex-1 p-5 md:p-7 max-w-7xl w-full mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Home,
  LayoutDashboard,
  Users,
  PhoneCall,
  Mail,
  Award,
  Sliders,
  RefreshCw,
  Calendar,
  TrendingUp,
  Inbox
} from 'lucide-vue-next'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

const { currentUser, isManager, isConsultant, teamUsers, fetchAuth, switchUser } = useWorkspaceAuth()

const syncing = ref(false)
const toastMessage = ref('')

function onSwitchUser(userId) {
  switchUser(userId)
}

async function syncMetrics() {
  syncing.value = true
  try {
    const res = await $fetch('/api/ads/sync')
    if (res.success) {
      toastMessage.value = res.message
      setTimeout(() => {
        toastMessage.value = ''
      }, 4000)
    }
  } catch (error) {
    toastMessage.value = 'Falha ao sincronizar métricas.'
    setTimeout(() => {
      toastMessage.value = ''
    }, 4000)
  } finally {
    syncing.value = false
  }
}

onMounted(() => {
  fetchAuth()
})
</script>
