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

          <!-- Master, CEO & Sales: Unified Conversations Hub -->
          <NuxtLink
            v-if="canAccessLeads"
            to="/dashboard/conversations"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/conversations' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <MessageSquare class="w-4 h-4 text-emerald-400" />
              <span>Conversations Hub</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
              Omni + AI
            </span>
          </NuxtLink>

          <!-- Master, CEO & Sales: Interactive Estimates (Good/Better/Best) -->
          <NuxtLink
            v-if="canAccessLeads"
            to="/dashboard/estimates"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/estimates' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <FileText class="w-4 h-4 text-amber-400" />
              <span>Interactive Estimates</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
              3 Tiers
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

            <!-- Master ONLY: User Profiles & Role Configuration (RBAC) -->
            <NuxtLink
              v-if="canAccessSettings"
              to="/admin/users"
              class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all mt-1"
              :class="$route.path === '/admin/users' ? 'bg-[#D7070D] text-white shadow-md shadow-red-950/40 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
            >
              <div class="flex items-center gap-3">
                <UserCheck class="w-4 h-4 text-amber-400" />
                <span>Profile Configuration</span>
              </div>
              <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                MASTER
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

      <!-- User Active Session Card / Footer (Click to change photo) -->
      <div class="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <button
          @click="openMyAvatarModal"
          class="w-full text-left flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/80 transition-colors group cursor-pointer"
          title="Click to change your profile photo"
        >
          <div class="relative shrink-0">
            <img
              v-if="currentUser?.avatarUrl"
              :src="currentUser.avatarUrl"
              alt="User Avatar"
              class="w-8 h-8 rounded-full border border-slate-700 object-cover group-hover:border-red-500 transition-colors"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700 group-hover:border-red-500"
            >
              {{ currentUser?.name?.charAt(0) || 'U' }}
            </div>
            <span class="absolute -bottom-1 -right-1 text-[8px] bg-slate-900 border border-slate-700 rounded-full w-3.5 h-3.5 flex items-center justify-center">
              📷
            </span>
          </div>
          <div class="overflow-hidden flex-1">
            <span class="text-xs font-bold text-slate-200 block truncate leading-tight group-hover:text-white">
              {{ currentUser?.name || 'Master Admin' }}
            </span>
            <span
              class="text-[9px] font-black uppercase tracking-wider block"
              :class="roleBadgeSidebar"
            >
              {{ roleIcon }} {{ roleTitle }}
            </span>
          </div>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header Bar with RBAC Switcher -->
      <header class="h-16 bg-white border-b border-slate-200/80 px-5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <!-- Left: Account & Role Indicator (Click to change photo) -->
        <div class="flex items-center gap-3">
          <button
            @click="openMyAvatarModal"
            class="flex items-center gap-2 p-1 -ml-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group text-left"
            title="Click to update your photo"
          >
            <div class="relative shrink-0">
              <img
                v-if="currentUser?.avatarUrl"
                :src="currentUser.avatarUrl"
                alt="Avatar"
                class="w-7 h-7 rounded-full object-cover border border-slate-300 group-hover:border-red-500 transition-colors shadow-2xs"
              />
              <div
                v-else
                class="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center border border-slate-300"
              >
                {{ currentUser?.name?.charAt(0) || 'U' }}
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 text-[7px] bg-white border border-slate-300 rounded-full w-3 h-3 flex items-center justify-center shadow-xs">
                📷
              </span>
            </div>
            <span
              class="text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
              :class="roleBadgeHeader"
            >
              <span>{{ roleIcon }}</span>
              <span>{{ currentUser?.name || 'Master Admin' }}</span>
              <span class="text-[10px] font-mono opacity-70">({{ currentUser?.role || 'MASTER' }})</span>
            </span>
          </button>
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

      <!-- User Personal Avatar Upload Modal -->
      <div
        v-if="showMyAvatarModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div class="flex items-center gap-2">
              <span class="text-lg">📷</span>
              <div>
                <h3 class="font-black text-slate-900 text-sm leading-tight">Update Profile Photo</h3>
                <p class="text-[11px] text-slate-500 font-mono">{{ currentUser?.name }}</p>
              </div>
            </div>
            <button
              @click="showMyAvatarModal = false"
              class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="p-6 space-y-4 text-center">
            <!-- Photo Preview -->
            <div class="relative w-28 h-28 mx-auto">
              <img
                v-if="currentUser?.avatarUrl"
                :src="currentUser.avatarUrl"
                alt="Profile Photo"
                class="w-28 h-28 rounded-full object-cover border-4 border-[#D7070D]/20 shadow-md"
              />
              <div
                v-else
                class="w-28 h-28 rounded-full bg-slate-900 text-white font-black text-3xl flex items-center justify-center border-4 border-slate-200 shadow-md"
              >
                {{ currentUser?.name?.charAt(0) || 'U' }}
              </div>
            </div>

            <div class="space-y-2">
              <input
                type="file"
                ref="myFileInputRef"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                class="hidden"
                @change="onMyFileSelected($event)"
              />
              <button
                type="button"
                @click="$refs.myFileInputRef.click()"
                :disabled="uploadingMyAvatar"
                class="w-full py-2.5 px-4 rounded-xl bg-[#D7070D] hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Upload class="w-4 h-4" />
                <span>{{ uploadingMyAvatar ? 'Uploading Photo...' : 'Upload Photo from Computer' }}</span>
              </button>
              <p class="text-[11px] text-slate-400">
                Upload your picture so your colleagues know who is in the system. (JPG, PNG, WebP)
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                @click="clearMyAvatar"
                class="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Reset to Initial
              </button>
              <button
                type="button"
                @click="showMyAvatarModal = false"
                class="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
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
  Shield,
  UserCheck,
  Upload,
  MessageSquare,
  FileText,
  X
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

const showMyAvatarModal = ref(false)
const uploadingMyAvatar = ref(false)
const myFileInputRef = ref(null)

function openMyAvatarModal() {
  showMyAvatarModal.value = true
}

async function onMyFileSelected(event) {
  const file = event.target?.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit.')
    return
  }

  uploadingMyAvatar.value = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const base64 = e.target?.result
      const res = await $fetch('/api/upload/avatar', {
        method: 'POST',
        body: {
          image: base64,
          fileName: file.name,
          userId: currentUser.value?.id
        }
      })

      if (res?.success && res?.url) {
        if (currentUser.value) {
          currentUser.value.avatarUrl = res.url
        }
        toastMessage.value = 'Profile photo updated successfully!'
        setTimeout(() => {
          toastMessage.value = ''
        }, 4000)
        showMyAvatarModal.value = false
        // Refresh team users so all components and switchers get the new avatar
        await fetchAuth()
      } else {
        alert(res?.message || 'Failed to upload photo.')
      }
    } catch (err) {
      console.error('Failed to upload photo:', err)
      alert('Error updating profile photo.')
    } finally {
      uploadingMyAvatar.value = false
    }
  }
  reader.readAsDataURL(file)
}

async function clearMyAvatar() {
  if (!currentUser.value?.id) return
  try {
    await $fetch('/api/admin/users', {
      method: 'PUT',
      body: {
        id: currentUser.value.id,
        avatarUrl: ''
      }
    })
    if (currentUser.value) {
      currentUser.value.avatarUrl = ''
    }
    showMyAvatarModal.value = false
    toastMessage.value = 'Profile photo cleared.'
    setTimeout(() => {
      toastMessage.value = ''
    }, 4000)
    await fetchAuth()
  } catch (err) {
    if (currentUser.value) {
      currentUser.value.avatarUrl = ''
    }
    showMyAvatarModal.value = false
  }
}

onMounted(() => {
  fetchAuth()
})
</script>
