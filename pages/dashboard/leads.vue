<template>
  <div class="space-y-6">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Leads Pipeline & CRM (Google Ads + GBP)</h1>
        <p class="text-xs text-slate-500">
          Centralized lead intake from Google Ads lead form webhooks and Google Business Profile with Gemini AI discovery scripts.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Omnichannel Inbound Simulator Dropdown -->
        <div class="relative">
          <select
            @change="simulateOmnichannel($event.target.value); $event.target.value = ''"
            :disabled="simulating"
            class="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled selected>⚡ Ingest Omnichannel Lead...</option>
            <option value="FACEBOOK_ADS">📢 Facebook Ads (Megaphone Lead Gen)</option>
            <option value="INSTAGRAM_ADS">📷 Instagram Ads (Stories & Reels)</option>
            <option value="MICROSOFT_ADS">🟩 Microsoft Ads (Bing Search 'b')</option>
            <option value="TIKTOK_ADS">🎵 TikTok Ads (Lead Form)</option>
            <option value="GOOGLE_ADS">🎯 Google Ads (Search / PMax)</option>
            <option value="GOOGLE_BUSINESS">📍 Google Business Profile / LSA</option>
          </select>
        </div>

        <!-- Simulate Google Ads Webhook Button -->
        <button
          @click="simulateWebhookLead"
          :disabled="simulating"
          class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
          title="Simulates an inbound Google Ads lead form extension webhook"
        >
          <Send class="w-3.5 h-3.5" :class="{ 'animate-pulse': simulating }" />
          <span>{{ simulating ? 'Simulating...' : 'Test Ads Webhook' }}</span>
        </button>

        <!-- Sync Google Business Profile Button -->
        <button
          @click="syncGbp"
          :disabled="syncingGbp"
          class="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': syncingGbp }" />
          <span>{{ syncingGbp ? 'Syncing...' : 'Sync Google Business Profile' }}</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards for Funnel & Leads -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <span class="text-[11px] font-semibold uppercase text-slate-500">Total Pipeline Leads</span>
        <div class="text-2xl font-black text-slate-900 mt-1">{{ stats.total || 0 }}</div>
        <span class="text-[10px] text-slate-400">Captured inquiries</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm bg-emerald-50/20">
        <span class="text-[11px] font-semibold uppercase text-emerald-600">1. Inbound (Unclaimed)</span>
        <div class="text-2xl font-black text-emerald-700 mt-1">{{ stats.newLeads || 0 }}</div>
        <span class="text-[10px] text-emerald-500">Pending first touch</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm bg-amber-50/20">
        <span class="text-[11px] font-semibold uppercase text-amber-600">2. In Discovery</span>
        <div class="text-2xl font-black text-amber-700 mt-1">{{ stats.inProgress || 0 }}</div>
        <span class="text-[10px] text-amber-500">Active engagement</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm bg-blue-50/20">
        <span class="text-[11px] font-semibold uppercase text-blue-600">3. Proposals Sent</span>
        <div class="text-2xl font-black text-blue-700 mt-1">{{ stats.proposals || 0 }}</div>
        <span class="text-[10px] text-blue-500">Pending acceptance</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm bg-purple-50/20 col-span-2 sm:col-span-1">
        <span class="text-[11px] font-semibold uppercase text-purple-600">4. Closed Won</span>
        <div class="text-2xl font-black text-purple-700 mt-1">
          {{ stats.converted || 0 }} <span class="text-xs font-bold text-purple-500">({{ stats.total ? Math.round((stats.converted / stats.total) * 100) : 0 }}%)</span>
        </div>
        <span class="text-[10px] text-purple-500">Signed contracts</span>
      </div>
    </div>

    <!-- View Toggle Bar -->
    <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
      <span class="text-xs font-bold text-slate-700">Pipeline View:</span>
      <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
        <button
          @click="currentView = 'kanban'"
          class="px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
          :class="currentView === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <span>📋 Kanban Board (Speed-to-Lead Locked)</span>
        </button>
        <button
          @click="currentView = 'table'"
          class="px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
          :class="currentView === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <span>📑 Detailed Table View</span>
        </button>
      </div>
    </div>

    <!-- Kanban View -->
    <KanbanBoard
      v-if="currentView === 'kanban'"
      :leads="leads"
      @refresh="fetchLeads"
      @open-lead-details="openModal"
    />

    <!-- Leads Table Component -->
    <LeadsTable
      v-else
      :leads="leads"
      @refresh="fetchLeads"
      @open-lead-details="openModal"
    />


    <!-- Lead Details & WhatsApp AI Script Modal -->
    <div
      v-if="selectedLead"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="selectedLead = null"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900">{{ selectedLead.name }}</h2>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                :class="selectedLead.source === 'GOOGLE_ADS' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'"
              >
                {{ selectedLead.source === 'GOOGLE_ADS' ? 'Google Ads' : 'Google Business Profile' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ selectedLead.phone }} • {{ selectedLead.email || 'No email provided' }}
            </p>
          </div>

          <button
            @click="selectedLead = null"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <!-- Service & Notes Info -->
        <div class="space-y-3 bg-slate-50 rounded-xl p-4 text-xs border border-slate-200/70">
          <div>
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Requested Service / Scope:</span>
            <p class="text-slate-900 font-semibold mt-0.5">{{ selectedLead.serviceInterested }}</p>
          </div>
          <div v-if="selectedLead.campaignName">
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Origin Campaign:</span>
            <p class="text-slate-600 font-mono mt-0.5">{{ selectedLead.campaignName }}</p>
          </div>
          <div v-if="selectedLead.notes">
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Lead Project Notes:</span>
            <p class="text-slate-600 italic mt-0.5">"{{ selectedLead.notes }}"</p>
          </div>
        </div>

        <!-- Gemini AI Qualification Section -->
        <div class="bg-gradient-to-tr from-purple-50 via-indigo-50/40 to-purple-50 rounded-xl p-4 border border-purple-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-purple-600" />
              <span>Gemini AI Lead Intelligence</span>
            </span>
            <span
              v-if="selectedLead.aiScore"
              class="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900"
            >
              Score: {{ selectedLead.aiScore }}/10
            </span>
          </div>

          <p class="text-xs text-purple-950 leading-relaxed font-medium">
            {{ selectedLead.aiQualification || 'Click "AI Qualify" to generate predictive lead intelligence and job estimation.' }}
          </p>
        </div>

        <!-- Suggested WhatsApp Pitch -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>💬</span>
              <span>Recommended SMS / WhatsApp Script</span>
            </span>

            <button
              v-if="selectedLead.whatsappScript"
              @click="copyScript(selectedLead.whatsappScript)"
              class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Copied!' : 'Copy Message' }}</span>
            </button>
          </div>

          <div class="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs font-sans leading-relaxed border border-slate-800">
            {{ selectedLead.whatsappScript || 'Run AI qualification to generate tailored outreach messaging to book the walkthrough.' }}
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            @click="selectedLead = null"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>

          <a
            v-if="selectedLead.phone && selectedLead.whatsappScript"
            :href="generateWhatsAppUrl(selectedLead.phone, selectedLead.whatsappScript)"
            target="_blank"
            class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <span>Open WhatsApp Chat</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Send, RefreshCw, Sparkles, Copy, Check } from 'lucide-vue-next'

const leads = ref([])
const stats = ref({})
const selectedLead = ref(null)
const simulating = ref(false)
const syncingGbp = ref(false)
const copied = ref(false)
const currentView = ref('kanban')


async function fetchLeads() {
  try {
    const res = await $fetch('/api/leads')
    if (res.success) {
      leads.value = res.leads
      stats.value = res.stats
    }
  } catch (err) {
    console.error('Failed to load leads:', err)
  }
}

function openModal(lead) {
  selectedLead.value = lead
}

async function syncGbp() {
  syncingGbp.value = true
  try {
    const res = await $fetch('/api/gbp/sync')
    if (res.success) {
      await fetchLeads()
    }
  } catch (err) {
    console.error('Failed to sync GBP:', err)
  } finally {
    syncingGbp.value = false
  }
}

async function simulateWebhookLead() {
  simulating.value = true
  try {
    // Simulating Google Ads Lead Form payload
    const mockPayload = {
      lead_id: `g_lead_${Date.now()}`,
      campaign_id: '101',
      user_column_data: [
        { column_id: 'FULL_NAME', string_value: 'Marcus Silva' },
        { column_id: 'PHONE_NUMBER', string_value: '+1 (617) 555-8833' },
        { column_id: 'EMAIL', string_value: 'marcus.silva.boston@gmail.com' },
        { column_id: 'POSTAL_CODE', string_value: '02128' },
        { column_id: 'CUSTOM_QUESTION', string_value: 'Interior & Ceiling Painting with Drywall Repair' }
      ]
    }

    await $fetch('/api/webhooks/google-leads', {
      method: 'POST',
      body: mockPayload
    })

    await fetchLeads()
  } catch (err) {
    console.error('Failed to simulate webhook:', err)
  } finally {
    simulating.value = false
  }
}

async function simulateOmnichannel(channel) {
  if (!channel) return
  simulating.value = true
  try {
    const demos = {
      FACEBOOK_ADS: {
        source: 'FACEBOOK_ADS',
        utmSource: 'META_FACEBOOK',
        utmMedium: 'lead_ad',
        utmCampaign: 'Wakefield Exterior Siding & Trim Promo',
        name: 'Jessica Reynolds',
        phone: '+1 (781) 555-4029',
        email: 'jess.reynolds@gmail.com',
        city: 'Wakefield',
        state: 'MA',
        serviceInterested: 'Exterior Siding Painting & Deck Staining',
        dealValue: 4800.00
      },
      INSTAGRAM_ADS: {
        source: 'INSTAGRAM_ADS',
        utmSource: 'META_INSTAGRAM',
        utmMedium: 'lead_ad',
        utmCampaign: 'Modern Kitchen Cabinet Refinishing Reel',
        name: 'Liam Harrington',
        phone: '+1 (617) 555-9182',
        email: 'liam.harrington.design@gmail.com',
        city: 'Brookline',
        state: 'MA',
        serviceInterested: 'Kitchen Cabinet Spray Painting & Hardware',
        dealValue: 3950.00
      },
      MICROSOFT_ADS: {
        source: 'MICROSOFT_ADS',
        utmSource: 'MICROSOFT_BING',
        utmMedium: 'cpc',
        utmCampaign: 'Bing Commercial Painting Newton MA',
        name: 'David Goldberg (CPA Office)',
        phone: '+1 (617) 555-7310',
        email: 'david@goldbergassociates.com',
        city: 'Newton',
        state: 'MA',
        serviceInterested: 'Commercial Interior Office Repaint',
        dealValue: 7200.00
      },
      TIKTOK_ADS: {
        source: 'TIKTOK_ADS',
        utmSource: 'TIKTOK',
        utmMedium: 'lead_ad',
        utmCampaign: 'Satisfying Painting Before & After Viral Ad',
        name: 'Tyler Vance',
        phone: '+1 (978) 555-2244',
        email: 'tyler.vance99@gmail.com',
        city: 'Salem',
        state: 'MA',
        serviceInterested: 'Full Interior Living Room & Trim Package',
        dealValue: 3200.00
      },
      GOOGLE_ADS: {
        source: 'GOOGLE_ADS',
        utmSource: 'GOOGLE',
        utmMedium: 'cpc',
        utmCampaign: 'Search - Exterior Painting Massachusetts',
        name: 'Robert Sullivan',
        phone: '+1 (617) 555-3819',
        email: 'robert.sullivan@verizon.net',
        city: 'Melrose',
        state: 'MA',
        serviceInterested: 'Two-Story Colonial House Exterior Painting',
        dealValue: 6400.00
      },
      GOOGLE_BUSINESS: {
        source: 'GOOGLE_BUSINESS',
        utmSource: 'GOOGLE_LOCAL',
        utmMedium: 'local_pack',
        utmCampaign: 'GBP Local Pack Top 3 Placement',
        name: 'Amanda Chen',
        phone: '+1 (781) 555-6677',
        email: 'amanda.chen.ma@yahoo.com',
        city: 'Malden',
        state: 'MA',
        serviceInterested: 'Interior Drywall Patching & Accent Wall',
        dealValue: 2400.00
      }
    }

    const payload = demos[channel] || demos.FACEBOOK_ADS
    await $fetch('/api/webhooks/omnikanal', {
      method: 'POST',
      body: payload
    })
    await fetchLeads()
  } catch (err) {
    console.error('Failed to simulate omnichannel lead:', err)
  } finally {
    simulating.value = false
  }
}

async function copyScript(text) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

function generateWhatsAppUrl(phone, text) {
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}

onMounted(() => {
  fetchLeads()
})
</script>
