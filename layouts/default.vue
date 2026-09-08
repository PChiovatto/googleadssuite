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
          <!-- Common / Executive: Overview -->
          <NuxtLink
            v-if="canAccessOverview"
            to="/"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Home class="w-4 h-4" />
            <span>Overview & KPIs</span>
          </NuxtLink>

          <!-- Master & CEO: Google Ads Dashboard -->
          <NuxtLink
            v-if="canAccessAds"
            to="/dashboard"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <LayoutDashboard class="w-4 h-4" />
            <span>Google Ads Analytics</span>
          </NuxtLink>

          <!-- Master, CEO & Sales: Leads & CRM Funnel -->
          <NuxtLink
            v-if="canAccessLeads"
            to="/dashboard/leads"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/leads' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <Users class="w-4 h-4" />
              <span>Leads Pipeline & CRM</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
              Kanban
            </span>
          </NuxtLink>

          <!-- Master, CEO & Sales: In-App Webmail -->
          <NuxtLink
            v-if="canAccessMail"
            to="/mail"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/mail' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <Inbox class="w-4 h-4 text-amber-400" />
              <span>Corporate Webmail</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
              SES In/Out
            </span>
          </NuxtLink>

          <!-- Master, CEO & Sales: Calendar & In-Home Estimates -->
          <NuxtLink
            v-if="canAccessCalendar"
            to="/dashboard/calendar"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/calendar' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Calendar class="w-4 h-4" />
            <span>Estimates & Dispatch</span>
          </NuxtLink>

          <!-- Master & CEO: Financial & Real ROAS -->
          <NuxtLink
            v-if="canAccessFinancials"
            to="/dashboard/financial"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/financial' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <TrendingUp class="w-4 h-4 text-emerald-400" />
              <span>Real ROAS & Job Costing</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 rounded bg-emerald-500/20 text-emerald-300">Stripe</span>
          </NuxtLink>

          <!-- Master, CEO & Sales: VoIP Dial & Recordings -->
          <NuxtLink
            v-if="canAccessCalls"
            to="/dashboard/calls"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/calls' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <PhoneCall class="w-4 h-4" />
            <span>VoIP Phone & Recordings</span>
          </NuxtLink>

          <!-- Master & CEO: Email Marketing Base & Broadcasts -->
          <NuxtLink
            v-if="canAccessMarketing"
            to="/dashboard/marketing"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/marketing' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Mail class="w-4 h-4" />
            <span>Campaigns & Email Mkt</span>
          </NuxtLink>

          <!-- Master, CEO & Field: Field Operations & GPS Geofencing (PWA) -->
          <NuxtLink
            v-if="canAccessField"
            to="/field"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/field' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <HardHat class="w-4 h-4 text-emerald-400" />
              <span>Field Operations & Timesheet</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
              PWA GPS
            </span>
          </NuxtLink>

          <!-- Customer Progress Tracker Portal Demo -->
          <NuxtLink
            v-if="canAccessField || canAccessOverview"
            to="/portal/tony-demo"
            target="_blank"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <div class="flex items-center gap-3">
              <Shield class="w-4 h-4 text-blue-400" />
              <span>Client Portal</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300">
              Live Demo ↗
            </span>
          </NuxtLink>

          <!-- Executive Management Section -->
          <div v-if="canAccessPerformance || canAccessSettings" class="pt-2">
            <span class="text-[9px] uppercase font-black tracking-widest text-slate-500 px-3.5 block mb-1">
              Executive Management
            </span>
            <NuxtLink
              v-if="canAccessPerformance"
              to="/admin/performance"
              class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              :class="$route.path === '/admin/performance' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-red-300 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center gap-3">
                <Award class="w-4 h-4 text-red-400" />
                <span>Team SLA & Job Costing</span>
              </div>
              <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-500/30 text-red-200">
                PRO
              </span>
            </NuxtLink>

            <!-- Master ONLY: Integrations & API Credentials -->
            <NuxtLink
              v-if="canAccessSettings"
              to="/settings"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all mt-1"
              :class="$route.path === '/settings' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <Sliders class="w-4 h-4" />
              <span>Integrations & Credentials</span>
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
              {{ currentUser?.name || 'Master Admin' }}
            </span>
            <span
              class="text-[9px] font-black uppercase tracking-wider block"
              :class="roleBadgeSidebar"
            >
              {{ roleIcon }} {{ roleTitle }}
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
            <img src="/emblem.png" alt="Tony's Emblem" class="w-7 h-7 rounded-full object-contain bg-white p-0.5 shadow-xs" />
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">Active Role:</span>
            <span
              class="text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
              :class="roleBadgeHeader"
            >
              <span>{{ roleIcon }}</span>
              <span>{{ currentUser?.name || 'Master Admin' }}</span>
              <span class="text-[10px] font-mono opacity-70">({{ currentUser?.role || 'MASTER' }})</span>
            </span>
          </div>
        </div>

        <!-- Right: Team Member Switcher (RBAC Mode Switch) & Actions -->
        <div class="flex items-center gap-3">
          <!-- Role Switcher for Multi-User Testing -->
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-[11px] font-bold text-slate-500 hidden md:inline">Switch User:</span>
            <select
              :value="currentUser?.id"
              @change="onSwitchUser($event.target.value)"
              class="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-2xs transition-colors"
            >
              <option v-for="u in teamUsers" :key="u.id" :value="u.id">
                {{ u.role === 'MASTER' ? '🛡️ Master: ' : (u.role === 'CEO' || u.role === 'MANAGER') ? '👑 CEO: ' : u.role === 'FIELD_WORKER' ? '👷 Field: ' : '👤 Sales: ' }} {{ u.name }}
              </option>
            </select>
          </div>

          <!-- Sync Button (Master & CEO Only) -->
          <button
            v-if="canAccessAds"
            @click="syncMetrics"
            :disabled="syncing"
            class="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': syncing }" />
            <span class="hidden sm:inline">{{ syncing ? 'Syncing...' : 'Sync Ads' }}</span>
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
import { ref, computed, onMounted } from 'vue'
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
  Inbox,
  HardHat,
  Shield
} from 'lucide-vue-next'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

const {
  currentUser,
  isMaster,
  isCeo,
  isManager,
  isSales,
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
  teamUsers,
  fetchAuth,
  switchUser
} = useWorkspaceAuth()

const roleTitle = computed(() => {
  if (isMaster.value) return 'MASTER ADMINISTRATOR'
  if (isCeo.value) return 'CEO & GENERAL MANAGER'
  if (isFieldWorker.value) return 'FIELD CREW'
  return 'SALES ESTIMATOR'
})

const roleIcon = computed(() => {
  if (isMaster.value) return '🛡️'
  if (isCeo.value) return '👑'
  if (isFieldWorker.value) return '👷'
  return '👤'
})

const roleBadgeSidebar = computed(() => {
  if (isMaster.value) return 'text-amber-400'
  if (isCeo.value) return 'text-purple-400'
  if (isFieldWorker.value) return 'text-blue-400'
  return 'text-emerald-400'
})

const roleBadgeHeader = computed(() => {
  if (isMaster.value) return 'bg-amber-50 text-amber-800 border-amber-200'
  if (isCeo.value) return 'bg-purple-50 text-purple-800 border-purple-200'
  if (isFieldWorker.value) return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-emerald-50 text-emerald-800 border-emerald-200'
})

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
    toastMessage.value = 'Failed to synchronize Google Ads metrics.'
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
