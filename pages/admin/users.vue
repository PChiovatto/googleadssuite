<template>
  <div class="space-y-8 max-w-7xl mx-auto pb-16">
    <!-- Top Superadmin Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2.5 border border-amber-300">
          <span>🛡️</span>
          <span class="tracking-wide uppercase">CONFIDENTIAL • MASTER ADMINISTRATOR ONLY</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span>Team Profile & Access Configuration</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Configure and manage all corporate accounts, role hierarchies (RBAC), credentials, and job costing pay rates for Tony's Painting and Remodeling. Only the Master Administrator has access to this panel.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 bg-[#D7070D] hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-red-950/20 active:scale-95 cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          <span>Add New Profile</span>
        </button>
      </div>
    </div>

    <!-- Security RBAC Notice Banner -->
    <div class="bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
      <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-300/60 flex items-center justify-center text-lg shrink-0 mt-0.5">
        🔐
      </div>
      <div class="space-y-1 text-xs">
        <h4 class="font-bold text-slate-900 text-sm">Strict Master Administrator Boundary</h4>
        <p class="text-slate-600 leading-relaxed">
          This configuration module is strictly restricted to the <strong>Master Administrator</strong>. The CEO (Tony Silva), Sales Estimators, and Field Crew cannot access this page or view company credentials. Any unauthorized deep link is blocked by global RBAC middleware and redirected to the user's role landing page.
        </p>
      </div>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- Total Profiles -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">Total Accounts</span>
        <div class="text-2xl font-black text-slate-900 mt-1">{{ users.length }}</div>
        <span class="text-[10px] text-slate-500 font-semibold">Active team profiles</span>
      </div>

      <!-- Master Admins -->
      <div class="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs bg-amber-50/20">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase text-amber-800 tracking-wider">Master Admins</span>
          <span>🛡️</span>
        </div>
        <div class="text-2xl font-black text-amber-900 mt-1">{{ countByRole('MASTER') }}</div>
        <span class="text-[10px] text-amber-700 font-semibold">Full superadmin control</span>
      </div>

      <!-- CEO / Executive -->
      <div class="bg-white rounded-2xl p-4 border border-purple-200 shadow-xs bg-purple-50/20">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase text-purple-800 tracking-wider">CEO / Executive</span>
          <span>👑</span>
        </div>
        <div class="text-2xl font-black text-purple-900 mt-1">{{ countByRole('CEO') + countByRole('MANAGER') }}</div>
        <span class="text-[10px] text-purple-700 font-semibold">Operations & KPIs</span>
      </div>

      <!-- Sales Estimators -->
      <div class="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs bg-emerald-50/20">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">Sales Estimators</span>
          <span>👤</span>
        </div>
        <div class="text-2xl font-black text-emerald-900 mt-1">{{ countByRole('SALES') + countByRole('CONSULTANT') }}</div>
        <span class="text-[10px] text-emerald-700 font-semibold">Leads, Mail & VoIP</span>
      </div>

      <!-- Field Crew -->
      <div class="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs bg-blue-50/20">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase text-blue-800 tracking-wider">Field Crew</span>
          <span>👷</span>
        </div>
        <div class="text-2xl font-black text-blue-900 mt-1">{{ countByRole('FIELD_WORKER') }}</div>
        <span class="text-[10px] text-blue-700 font-semibold">GPS & Timesheets</span>
      </div>
    </div>

    <!-- Team Profiles Table / Management Console -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-slate-600" />
          <h3 class="font-bold text-slate-900 text-sm">System Users & Role Privileges</h3>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {{ users.length }} Profiles
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="text-slate-400 font-medium text-[11px]">Quick Action:</span>
          <span class="text-slate-600 font-bold">Edit profile details, reset role boundaries or simulate user session</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center text-slate-500 space-y-3">
        <RefreshCw class="w-6 h-6 animate-spin mx-auto text-[#D7070D]" />
        <p class="text-xs font-semibold">Loading system profiles from SQLite...</p>
      </div>

      <!-- Profiles List -->
      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="u in users"
          :key="u.id"
          class="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <!-- Left: User Avatar & Info -->
          <div class="flex items-center gap-3.5 min-w-[280px]">
            <div class="relative shrink-0">
              <img
                v-if="u.avatarUrl"
                :src="u.avatarUrl"
                :alt="u.name"
                class="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs"
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center border-2 border-slate-200"
              >
                {{ u.name?.charAt(0) || 'U' }}
              </div>
              <span
                class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px]"
                :title="u.role"
              >
                {{ getRoleIcon(u.role) }}
              </span>
            </div>

            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900 text-sm">{{ u.name }}</h4>
                <span
                  v-if="u.id === currentUser?.id"
                  class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300"
                >
                  YOU (ACTIVE)
                </span>
              </div>
              <p class="text-xs text-slate-500 font-mono">{{ u.email }}</p>
              <div class="flex items-center gap-2 pt-0.5">
                <span
                  class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                  :class="getRoleBadgeClass(u.role)"
                >
                  <span>{{ getRoleIcon(u.role) }}</span>
                  <span>{{ formatRoleTitle(u.role) }}</span>
                </span>
                <span class="text-[10px] text-slate-400 font-mono">
                  Added {{ new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Center: Scope of Access & Job Costing Rate -->
          <div class="flex-1 max-w-md space-y-1 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-700">Access Scope:</span>
              <span class="font-mono text-slate-500">{{ getRoleScope(u.role) }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-700">Labor / Wage Rate:</span>
              <span class="font-mono text-emerald-700 font-bold">
                ${{ (u.hourlyRate || 35.0).toFixed(2) }} / hr
                <span v-if="u.role === 'FIELD_WORKER'" class="text-[9px] text-slate-400 font-normal">(MA Prevailing)</span>
              </span>
            </div>
            <div v-if="u._count" class="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5 font-mono border-t border-slate-200/60 mt-1">
              <span>Leads: <strong>{{ u._count.leads }}</strong></span>
              <span>Time Logs: <strong>{{ u._count.timeLogs }}</strong></span>
              <span>Emails: <strong>{{ u._count.emails }}</strong></span>
            </div>
          </div>

          <!-- Right: Master Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Test As User (Simulate Session) -->
            <button
              @click="simulateUser(u.id)"
              :disabled="u.id === currentUser?.id"
              class="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Switch active session to test this profile's permissions"
            >
              <LogIn class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Simulate</span>
            </button>

            <!-- Edit Profile -->
            <button
              @click="openEditModal(u)"
              class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title="Edit Profile & Permissions"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Configure</span>
            </button>

            <!-- Delete Profile -->
            <button
              @click="confirmDelete(u)"
              :disabled="u.id === currentUser?.id || (u.role === 'MASTER' && countByRole('MASTER') <= 1)"
              class="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Remove User Profile"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT PROFILE MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">{{ isEditing ? '✏️' : '👤' }}</span>
            <div>
              <h3 class="font-black text-slate-900 text-base">
                {{ isEditing ? 'Configure Team Profile' : 'Create New Team Profile' }}
              </h3>
              <p class="text-[11px] text-slate-500 font-mono">Role-Based Access Control (RBAC)</p>
            </div>
          </div>
          <button
            @click="showModal = false"
            class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="submitProfileForm" class="p-6 space-y-4 text-xs">
          <!-- Name Field -->
          <div class="space-y-1">
            <label class="font-bold text-slate-700">Full Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Sarah Jenkins"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D7070D] focus:outline-none text-slate-900"
            />
          </div>

          <!-- Email Field -->
          <div class="space-y-1">
            <label class="font-bold text-slate-700">Corporate Email Address *</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="e.g., sarah@tonyspainting.com"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D7070D] focus:outline-none text-slate-900"
            />
          </div>

          <!-- Password Field -->
          <div class="space-y-1">
            <label class="font-bold text-slate-700">
              {{ isEditing ? 'Change Password (Optional)' : 'Default Password *' }}
            </label>
            <input
              v-model="form.password"
              type="text"
              :required="!isEditing"
              placeholder="e.g., tonys2026"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D7070D] focus:outline-none text-slate-900 font-mono"
            />
            <span class="text-[10px] text-slate-400">Used for signing in and credential authentication.</span>
          </div>

          <!-- Role Selector -->
          <div class="space-y-1">
            <label class="font-bold text-slate-700">System Role & Access Tier *</label>
            <select
              v-model="form.role"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D7070D] focus:outline-none text-slate-900 font-bold"
            >
              <option value="MASTER">🛡️ MASTER — System Administrator (Full Unrestricted Access + Settings)</option>
              <option value="CEO">👑 CEO — Tony Silva / General Manager (Executive Command, Settings Hidden)</option>
              <option value="SALES">👤 SALES — Estimator (Leads Pipeline, Webmail, VoIP Phone, Calendar)</option>
              <option value="FIELD_WORKER">👷 FIELD_WORKER — Field Crew (GPS Geofencing, Clock-In, Timesheet PWA)</option>
            </select>
          </div>

          <!-- Role Explanation Box -->
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <span>{{ getRoleIcon(form.role) }}</span>
              <span>Permission Preview: {{ formatRoleTitle(form.role) }}</span>
            </div>
            <p class="text-slate-600">{{ getRoleDetailedExplanation(form.role) }}</p>
          </div>

          <!-- Hourly Rate Field -->
          <div class="space-y-1">
            <label class="font-bold text-slate-700">Hourly Wage Rate ($ / hr)</label>
            <div class="relative">
              <span class="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
              <input
                v-model.number="form.hourlyRate"
                type="number"
                step="0.5"
                min="15"
                max="200"
                placeholder="35.00"
                class="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D7070D] focus:outline-none text-slate-900 font-mono font-bold"
              />
            </div>
            <span class="text-[10px] text-slate-400">
              Crucial for Job Costing & Net Profit calculations in Field Timesheets (MA standard: $32.00 - $45.00/hr).
            </span>
          </div>

          <!-- Profile Photo / Avatar Upload -->
          <div class="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-800 text-xs">Profile Photo (Avatar)</label>
              <span class="text-[10px] text-slate-400 font-mono">Custom photo for team recognition</span>
            </div>

            <div class="flex items-center gap-4">
              <!-- Avatar Preview -->
              <div class="relative shrink-0">
                <img
                  v-if="form.avatarUrl"
                  :src="form.avatarUrl"
                  alt="Avatar Preview"
                  class="w-16 h-16 rounded-full object-cover border-2 border-[#D7070D]/40 shadow-sm"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-full bg-slate-900 text-white font-black text-xl flex items-center justify-center border-2 border-slate-300"
                >
                  {{ form.name?.charAt(0) || 'U' }}
                </div>
                <button
                  v-if="form.avatarUrl"
                  type="button"
                  @click="form.avatarUrl = ''"
                  class="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-xs transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>

              <!-- Upload Button & Info -->
              <div class="space-y-1.5 flex-1">
                <input
                  type="file"
                  ref="fileInputRef"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  class="hidden"
                  @change="handleFileUpload($event)"
                />
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    @click="$refs.fileInputRef.click()"
                    :disabled="uploadingAvatar"
                    class="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Upload class="w-3.5 h-3.5 text-[#D7070D]" />
                    <span>{{ uploadingAvatar ? 'Uploading...' : 'Upload Photo from Computer' }}</span>
                  </button>
                </div>
                <p class="text-[10px] text-slate-500">
                  Select a photo of the person so the team can identify them. (JPG, PNG, WebP)
                </p>
              </div>
            </div>

            <!-- Optional Direct Link fallback -->
            <div class="pt-2 border-t border-slate-200/60">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Or enter Image URL:
              </label>
              <input
                v-model="form.avatarUrl"
                type="text"
                placeholder="https://... or /avatars/my-photo.jpg"
                class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 bg-white"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-5 py-2.5 rounded-xl bg-[#D7070D] hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw v-if="saving" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isEditing ? 'Save Changes' : 'Create Profile' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      class="fixed bottom-5 right-5 z-50 bg-slate-950 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-fade-in"
    >
      <span class="text-emerald-400 font-bold">✓</span>
      <span class="font-medium">{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  LogIn,
  RefreshCw,
  Upload,
  X,
  Camera
} from 'lucide-vue-next'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

const { isMaster, getDefaultRoute, currentUser, switchUser } = useWorkspaceAuth()

const users = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const toastMessage = ref('')
const uploadingAvatar = ref(false)
const fileInputRef = ref(null)

const form = ref({
  id: '',
  name: '',
  email: '',
  password: '',
  role: 'SALES',
  hourlyRate: 35.0,
  avatarUrl: ''
})

async function handleFileUpload(event) {
  const file = event.target?.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit. Please select a smaller photo.')
    return
  }

  uploadingAvatar.value = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const base64 = e.target?.result
      const res = await $fetch('/api/upload/avatar', {
        method: 'POST',
        body: {
          image: base64,
          fileName: file.name,
          userId: form.value.id || undefined
        }
      })

      if (res?.success && res?.url) {
        form.value.avatarUrl = res.url
        showToast('Photo uploaded successfully!')
      } else {
        alert(res?.message || 'Failed to upload photo.')
      }
    } catch (err) {
      console.error('Failed to upload photo:', err)
      alert('Error processing photo upload.')
    } finally {
      uploadingAvatar.value = false
    }
  }
  reader.readAsDataURL(file)
}

onMounted(async () => {
  if (!isMaster.value) {
    navigateTo(getDefaultRoute())
    return
  }
  await fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  try {
    const res = await $fetch('/api/admin/users')
    if (res?.success && res?.users) {
      users.value = res.users
    }
  } catch (err) {
    console.error('Failed to load users:', err)
  } finally {
    loading.value = false
  }
}

function countByRole(role) {
  return users.value.filter(u => u.role === role).length
}

function formatRoleTitle(role) {
  if (role === 'MASTER' || role === 'ADMIN') return 'Master Administrator'
  if (role === 'CEO' || role === 'MANAGER') return 'CEO & General Manager'
  if (role === 'FIELD_WORKER') return 'Field Crew Technician'
  return 'Sales Estimator'
}

function getRoleIcon(role) {
  if (role === 'MASTER' || role === 'ADMIN') return '🛡️'
  if (role === 'CEO' || role === 'MANAGER') return '👑'
  if (role === 'FIELD_WORKER') return '👷'
  return '👤'
}

function getRoleBadgeClass(role) {
  if (role === 'MASTER' || role === 'ADMIN') return 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
  if (role === 'CEO' || role === 'MANAGER') return 'bg-purple-50 text-purple-900 border-purple-300 font-bold'
  if (role === 'FIELD_WORKER') return 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
  return 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
}

function getRoleScope(role) {
  if (role === 'MASTER' || role === 'ADMIN') return 'Full Superadmin (All 12 Modules + Settings + RBAC)'
  if (role === 'CEO' || role === 'MANAGER') return 'Executive Command (All Dashboards, Settings Hidden)'
  if (role === 'FIELD_WORKER') return 'Field Operations PWA (GPS, Clock-In, Timesheet)'
  return 'Sales CRM Funnel (Leads, Webmail, VoIP Phone, Calendar)'
}

function getRoleDetailedExplanation(role) {
  if (role === 'MASTER') return 'Superadmin authority. Can access all dashboards, configure team profiles, view Google Cloud/Gemini API keys, and trigger ad synchronizations.'
  if (role === 'CEO') return 'Business executive. Can monitor financial metrics, conversion rates, campaigns, and dispatch. Integrations & Credentials (/settings) are blocked.'
  if (role === 'FIELD_WORKER') return 'Field painter / crew. Restricted strictly to the mobile Field Operations PWA (/field). Cannot view customer leads, financials, or webmail.'
  return 'Sales consultant. Authorized for customer acquisition: Leads Pipeline (/dashboard/leads), Corporate Webmail (/mail), VoIP Dialer (/dashboard/calls), and Calendar.'
}

function openCreateModal() {
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    email: '',
    password: 'tonys' + Math.floor(1000 + Math.random() * 9000),
    role: 'SALES',
    hourlyRate: 35.0,
    avatarUrl: ''
  }
  showModal.value = true
}

function openEditModal(user) {
  isEditing.value = true
  form.value = {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    password: '',
    role: user.role || 'SALES',
    hourlyRate: user.hourlyRate || 35.0,
    avatarUrl: user.avatarUrl || ''
  }
  showModal.value = true
}

async function submitProfileForm() {
  saving.value = true
  try {
    const endpoint = '/api/admin/users'
    const method = isEditing.value ? 'PUT' : 'POST'

    const res = await $fetch(endpoint, {
      method,
      body: form.value
    })

    if (res?.success) {
      showToast(res.message || 'Profile saved successfully.')
      showModal.value = false
      await fetchUsers()
    } else {
      alert(res?.message || 'Failed to save profile.')
    }
  } catch (err) {
    console.error('Error saving profile:', err)
    alert(err?.data?.message || err?.message || 'Error occurred.')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(user) {
  if (!confirm(`Are you sure you want to remove the profile for ${user.name} (${user.email})?`)) {
    return
  }

  try {
    const res = await $fetch('/api/admin/users', {
      method: 'DELETE',
      body: { id: user.id }
    })

    if (res?.success) {
      showToast(res.message || 'Profile removed.')
      await fetchUsers()
    } else {
      alert(res?.message || 'Failed to remove profile.')
    }
  } catch (err) {
    console.error('Error deleting user:', err)
    alert(err?.data?.message || 'Failed to delete profile.')
  }
}

async function simulateUser(userId) {
  await switchUser(userId)
}

function showToast(msg) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}
</script>
