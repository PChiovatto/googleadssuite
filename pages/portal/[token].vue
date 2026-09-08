<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
    <!-- Top Announcement Bar -->
    <div class="bg-[#D7070D] text-white text-xs py-2 px-4 text-center font-bold tracking-wider flex items-center justify-center gap-3 shadow-xs">
      <span>🛡️ MASSACHUSETTS HIC REGISTRATION #204891</span>
      <span class="hidden sm:inline">• 5-YEAR WRITTEN WARRANTY</span>
      <span>• REAL-TIME PROJECT TRACKING</span>
    </div>

    <!-- Portal Header -->
    <header class="bg-white border-b border-slate-200 py-6 px-4 shadow-xs">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div class="flex items-center gap-4">
          <div class="bg-white p-2 rounded-2xl shadow-md border border-slate-100 shrink-0">
            <img src="/emblem.png" alt="Tony's Remodeling" class="w-14 h-14 object-contain" />
          </div>
          <div>
            <span class="text-[10px] font-black uppercase tracking-widest text-[#D7070D] block">
              EXCLUSIVE HOMEOWNER PORTAL
            </span>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {{ data?.lead?.name || 'Valued Client' }} — Project Progress Hub
            </h1>
            <p class="text-xs text-slate-500 font-mono mt-0.5">
              📍 {{ data?.lead?.address || data?.lead?.city || 'Massachusetts' }} • {{ data?.lead?.serviceInterested || 'Painting & Remodeling' }}
            </p>
          </div>
        </div>

        <div class="text-center sm:text-right">
          <span class="text-[10px] font-mono text-slate-400 block uppercase">Project Reference Code</span>
          <span class="text-sm font-black font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            {{ data?.lead?.portalToken || $route.params.token }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Portal Content -->
    <main class="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div v-if="loading" class="p-16 text-center text-sm text-slate-400">
        Loading your project details...
      </div>

      <div v-else-if="error" class="p-12 bg-red-50 border-2 border-red-200 rounded-3xl text-center space-y-2">
        <span class="text-2xl">⚠️</span>
        <h3 class="text-base font-bold text-red-900">Project Not Located</h3>
        <p class="text-xs text-red-700">{{ error }}</p>
      </div>

      <div v-else class="space-y-6">
        <!-- 1. PROGRESS TIMELINE HERO -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Current Progress</span>
              <h2 class="text-lg sm:text-xl font-black text-slate-900">
                Milestone: <span class="text-[#D7070D]">{{ formatStageName(data?.lead?.status) }}</span>
              </h2>
            </div>
            <span class="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start sm:self-auto">
              Crew Active in Massachusetts
            </span>
          </div>

          <!-- Visual Progress Steps -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div
              v-for="(step, idx) in stagesList"
              :key="step.key"
              class="p-3 rounded-2xl border transition-all text-center space-y-1.5"
              :class="idx <= currentStageIndex ? 'bg-red-50/70 border-red-300 text-slate-900 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'"
            >
              <div class="w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold font-mono"
                   :class="idx <= currentStageIndex ? 'bg-[#D7070D] text-white' : 'bg-slate-300 text-slate-600'">
                {{ idx < currentStageIndex ? '✓' : idx + 1 }}
              </div>
              <span class="text-[11px] font-black block leading-tight">{{ step.title }}</span>
              <span class="text-[9px] block text-slate-500">{{ step.subtitle }}</span>
            </div>
          </div>
        </div>

        <!-- 2. PHOTOS OF THE JOB PROGRESS -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2.5">
              <Camera class="w-5 h-5 text-[#D7070D]" />
              <div>
                <h3 class="text-base font-black text-slate-900">Daily Field Photos & Execution Logs</h3>
                <p class="text-xs text-slate-500">Real-time photos uploaded directly from the job site by our lead crew</p>
              </div>
            </div>
            <span class="text-xs font-mono text-slate-400">{{ data?.photos?.length || 2 }} photos</span>
          </div>

          <!-- Photo Gallery Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              v-for="(photo, i) in (data?.photos?.length ? data.photos : samplePhotos)"
              :key="i"
              class="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900"
            >
              <img
                :src="photo.url"
                alt="Job Site Progress"
                class="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span class="text-[10px] font-black uppercase text-red-400 tracking-wider">
                  {{ photo.type === 'PROGRESSO_OBRA' ? 'Daily Progress' : 'Initial Condition' }}
                </span>
                <p class="text-xs font-medium text-slate-100 line-clamp-2 mt-0.5">
                  {{ photo.aiAnalysis || 'Surface preparation, power sanding, and adjacent masking completed.' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. CONTRACT, WARRANTY & STRIPE DEPOSIT -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Contract & Warranty Details -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Shield class="w-5 h-5 text-emerald-600" />
              <h3 class="text-sm font-black text-slate-900 uppercase">Warranty & Legal Specifications</h3>
            </div>

            <div class="space-y-3 text-xs text-slate-700">
              <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <span class="font-bold block">🛡️ 5-Year Written Warranty:</span>
                <p class="text-[11px] text-emerald-800 leading-relaxed">
                  Complete warranty protection against premature peeling, blistering, and adhesion failure on all prepared surfaces.
                </p>
              </div>

              <div class="space-y-1.5 pt-1">
                <div class="flex justify-between py-1 border-b border-slate-100">
                  <span class="text-slate-500">Legal Contract #:</span>
                  <span class="font-bold text-slate-800">{{ data?.contract?.contractNumber || 'HIC-2026-001' }}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-100">
                  <span class="text-slate-500">State Registration:</span>
                  <span class="font-bold text-slate-800">MA HIC #204891</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-slate-500">Total Contract Value:</span>
                  <span class="font-black text-slate-900 text-sm">
                    ${{ Number(data?.contract?.totalAmount || data?.lead?.dealValue || 8500).toLocaleString('en-US') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial & Stripe Deposit Card -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <CreditCard class="w-5 h-5 text-[#D7070D]" />
                <h3 class="text-sm font-black text-slate-900 uppercase">Payment & Deposit Status</h3>
              </div>

              <div class="mt-4 space-y-3 text-xs">
                <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span class="text-[10px] text-slate-500 font-bold uppercase block">Initial Deposit (1/3 Legal Cap)</span>
                    <span class="text-xl font-black text-slate-900 mt-0.5 block font-mono">
                      ${{ Number(data?.contract?.depositAmount || 2833).toLocaleString('en-US') }}
                    </span>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                        :class="data?.contract?.signed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                    {{ data?.contract?.signed ? '✓ PAID VIA STRIPE' : 'PENDING APPROVAL' }}
                  </span>
                </div>

                <p class="text-[11px] text-slate-500 leading-relaxed">
                  Payments are securely processed via 256-bit encrypted Stripe checkout in full compliance with Massachusetts Home Improvement Contractor regulations.
                </p>
              </div>
            </div>

            <!-- Direct Contact Button -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500">Questions about your project?</span>
              <a href="tel:+16175550198" class="font-bold text-[#D7070D] hover:underline flex items-center gap-1">
                <span>📞 Call Project Manager</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 4. ZENITH PILLAR: REFERRAL PROGRAM & $150 CASHBACK -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-700 relative overflow-hidden">
          <div class="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-44 h-44 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div class="space-y-2 max-w-xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold border border-red-500/30">
                <span>🎁</span>
                <span>Official Tony's Referral Program</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                Refer a Neighbor or Friend & Earn <span class="text-red-500">$150 via Stripe</span>!
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Your neighbor receives <strong class="text-white">$100 welcome credit</strong> on their project, and as soon as their contract is signed, you receive <strong class="text-emerald-400">$150 direct cashback</strong> via Stripe or credit toward future remodeling.
              </p>
            </div>

            <div class="flex-shrink-0 bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3 sm:w-80">
              <span class="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">Your Exclusive Referral Link:</span>
              <div class="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/10 text-xs font-mono">
                <span class="truncate text-red-300 flex-1">
                  https://tonysremodeling.com/ref/{{ data?.lead?.referralToken || 'tony-vip' }}
                </span>
                <button
                  @click="copyReferralLink"
                  class="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 transition-colors"
                >
                  {{ copied ? 'Copied!' : 'Copy Link' }}
                </button>
              </div>
              <span class="text-[10px] text-slate-400 block text-center">
                ✓ Automatic payout via Stripe Instant Transfer
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Camera,
  Shield,
  CreditCard
} from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const route = useRoute()
const token = route.params.token

const data = ref(null)
const loading = ref(true)
const error = ref(null)

const stagesList = [
  { key: 'NOVO', title: '1. Estimate', subtitle: 'Initial request' },
  { key: 'PROPOSTA', title: '2. Proposal', subtitle: 'On-site walkthrough' },
  { key: 'CONVERTIDO', title: '3. Approved', subtitle: 'Contract signed' },
  { key: 'EM_EXECUCAO', title: '4. In Progress', subtitle: 'On-site execution' },
  { key: 'FINALIZADO', title: '5. Completed', subtitle: 'Walkthrough & warranty' }
]

const currentStageIndex = computed(() => {
  const status = data.value?.lead?.status || 'EM_EXECUCAO'
  const map = {
    NOVO: 0,
    EM_ATENDIMENTO: 1,
    PROPOSTA: 1,
    CONVERTIDO: 2,
    EM_EXECUCAO: 3,
    FINALIZADO: 4
  }
  return map[status] !== undefined ? map[status] : 3
})

const samplePhotos = [
  {
    url: 'https://doorbridgefix.com/wp-content/uploads/2026/03/IMG_2084-scaled.jpg',
    type: 'PROGRESSO_OBRA',
    aiAnalysis: 'Exterior painting in progress: power scraping, oil primer, and elastomeric caulking completed.'
  },
  {
    url: 'https://doorbridgefix.com/wp-content/uploads/2026/03/IMG_2237-scaled.jpg',
    type: 'FOTO_ORIGINAL',
    aiAnalysis: 'Custom kitchen cabinetry prepped and masked for airless spray painting with satin lacquer finish.'
  }
]

onMounted(async () => {
  await fetchPortalData()
})

async function fetchPortalData() {
  loading.value = true
  error.value = null
  try {
    const res = await $fetch(`/api/portal/${token}`)
    if (res?.success) {
      data.value = res
    } else {
      error.value = res?.message || 'Unable to load project details.'
    }
  } catch (err) {
    console.error('Error fetching homeowner portal:', err)
    error.value = 'Link expired or invalid.'
  } finally {
    loading.value = false
  }
}

function formatStageName(status) {
  const names = {
    NOVO: 'Initial Estimate Received',
    EM_ATENDIMENTO: 'In Technical Discovery',
    PROPOSTA: 'Formal Proposal Sent',
    CONVERTIDO: 'Contract Executed & Scheduled',
    EM_EXECUCAO: 'Active On-Site Execution',
    FINALIZADO: 'Project 100% Completed'
  }
  return names[status] || 'Active On-Site Execution'
}

const copied = ref(false)

function copyReferralLink() {
  const link = `https://tonysremodeling.com/ref/${data.value?.lead?.referralToken || 'tony-vip'}`
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(link)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  }
}
</script>
