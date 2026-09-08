<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <!-- Header with Search & Filter -->
    <div class="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-bold text-slate-900">Lead Pipeline & Inquiries</h3>
        <p class="text-xs text-slate-500">Inbound contacts captured via Google Ads and Google Business Profile</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="Search by name, phone, service..."
            class="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-48 sm:w-60 transition-all"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <!-- Source Filter -->
        <select
          v-model="sourceFilter"
          class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
        >
          <option value="ALL">All Sources</option>
          <option value="GOOGLE_ADS">Google Ads (Webhooks)</option>
          <option value="GOOGLE_BUSINESS">Google Business Profile</option>
          <option value="ORGANIC">Organic</option>
        </select>

        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="NOVO">Inbound / New</option>
          <option value="EM_ATENDIMENTO">In Discovery</option>
          <option value="PROPOSTA">Proposal Sent</option>
          <option value="CONVERTIDO">Closed Won</option>
          <option value="PERDIDO">Closed Lost</option>
        </select>
      </div>
    </div>

    <!-- Leads Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
            <th class="py-3.5 px-4">Source</th>
            <th class="py-3.5 px-4">Client / Contact</th>
            <th class="py-3.5 px-4">Scope / Service</th>
            <th class="py-3.5 px-3">Status</th>
            <th class="py-3.5 px-3 text-center">AI Score</th>
            <th class="py-3.5 px-4 text-right">Actions & Script</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="lead in filteredLeads"
            :key="lead.id"
            class="hover:bg-slate-50/60 transition-colors"
          >
            <!-- Source -->
            <td class="py-3.5 px-4">
              <!-- Omnichannel Source Badge -->
              <span
                v-if="lead.source === 'FACEBOOK_ADS' || lead.utmSource === 'META_FACEBOOK'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-blue-50 text-[#1877F2] border border-blue-200"
              >
                <span>📢</span>
                <svg class="w-2.5 h-2.5 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>facebook Ads</span>
              </span>
              <span
                v-else-if="lead.source === 'INSTAGRAM_ADS' || lead.utmSource === 'META_INSTAGRAM'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 text-rose-700 border border-rose-200"
              >
                <span>📷</span>
                <span>Instagram Ads</span>
              </span>
              <span
                v-else-if="lead.source === 'MICROSOFT_ADS' || lead.utmSource === 'MICROSOFT_BING'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-emerald-50 text-[#008373] border border-emerald-200"
              >
                <span class="w-2.5 h-2.5 rounded-xs bg-[#008373] text-white flex items-center justify-center font-black text-[8px] leading-none">b</span>
                <span>Bing Ads</span>
              </span>
              <span
                v-else-if="lead.source === 'TIKTOK_ADS' || lead.utmSource === 'TIKTOK'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-slate-900 text-white border border-slate-700"
              >
                <span>🎵</span>
                <span>TikTok Ads</span>
              </span>
              <span
                v-else-if="lead.source === 'GOOGLE_LSA' || lead.source === 'GOOGLE_BUSINESS'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-amber-50 text-amber-800 border border-amber-200"
              >
                <span>📍</span>
                <span>GMB / LSA</span>
              </span>
              <span
                v-else-if="lead.source === 'GOOGLE_ADS'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200"
              >
                <svg class="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24Z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15Z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                </svg>
                <span>Google Ads</span>
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200"
              >
                <span>🌐</span>
                <span>{{ lead.source || 'Organic' }}</span>
              </span>
              <div v-if="lead.campaignName" class="text-[10px] text-slate-400 mt-1 truncate max-w-[140px]" :title="lead.campaignName">
                {{ lead.campaignName }}
              </div>
            </td>

            <!-- Contact Name & Phone -->
            <td class="py-3.5 px-4">
              <div class="font-bold text-slate-900 text-sm">{{ lead.name }}</div>
              <div class="flex flex-col gap-0.5 mt-0.5 text-slate-500 text-[11px]">
                <a v-if="lead.phone" :href="`tel:${lead.phone}`" class="hover:text-blue-600 flex items-center gap-1">
                  📞 {{ lead.phone }}
                </a>
                <span v-if="lead.email" class="text-slate-400 truncate max-w-[180px]">
                  ✉️ {{ lead.email }}
                </span>
              </div>
            </td>

            <!-- Service Interested -->
            <td class="py-3.5 px-4 max-w-[220px]">
              <p class="font-medium text-slate-800 line-clamp-2" :title="lead.serviceInterested">
                {{ lead.serviceInterested || 'General Residential Painting' }}
              </p>
              <p v-if="lead.notes" class="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                "{{ lead.notes }}"
              </p>
            </td>

            <!-- Status Dropdown -->
            <td class="py-3.5 px-3">
              <select
                :value="lead.status"
                @change="updateLeadStatus(lead.id, $event.target.value)"
                class="text-[11px] font-semibold rounded-lg px-2 py-1 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                :class="{
                  'bg-emerald-50 text-emerald-700 border-emerald-200': lead.status === 'CONVERTIDO',
                  'bg-blue-50 text-blue-700 border-blue-200': lead.status === 'NOVO',
                  'bg-amber-50 text-amber-700 border-amber-200': lead.status === 'EM_ATENDIMENTO',
                  'bg-indigo-50 text-indigo-700 border-indigo-200': lead.status === 'PROPOSTA',
                  'bg-rose-50 text-rose-700 border-rose-200': lead.status === 'PERDIDO'
                }"
              >
                <option value="NOVO">● Inbound</option>
                <option value="EM_ATENDIMENTO">● In Discovery</option>
                <option value="PROPOSTA">📝 Proposal Sent</option>
                <option value="CONVERTIDO">✔ Closed Won</option>
                <option value="PERDIDO">✖ Closed Lost</option>
              </select>
            </td>

            <!-- AI Score -->
            <td class="py-3.5 px-3 text-center">
              <div v-if="lead.aiScore" class="inline-flex flex-col items-center">
                <span
                  class="font-black text-xs px-2 py-0.5 rounded-full"
                  :class="lead.aiScore >= 8 ? 'bg-purple-100 text-purple-800' : lead.aiScore >= 6 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'"
                >
                  {{ lead.aiScore }}/10
                </span>
                <span class="text-[9px] text-purple-600 font-semibold mt-0.5">Gemini AI</span>
              </div>
              <span v-else class="text-slate-300 text-[11px]">—</span>
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <!-- Stripe Checkout Button -->
                <button
                  @click="generateStripeLink(lead)"
                  class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                  title="Generate Stripe Deposit Link"
                >
                  <span>💳</span>
                  <span>Stripe</span>
                </button>

                <!-- Qualify with AI Button -->
                <button
                  @click="qualifyWithAi(lead.id)"
                  :disabled="qualifyingId === lead.id"
                  class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                  title="Qualify Lead & Generate Gemini Script"
                >
                  <Sparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': qualifyingId === lead.id }" />
                  <span>{{ qualifyingId === lead.id ? 'Analyzing...' : 'AI Qualify' }}</span>
                </button>

                <!-- WhatsApp Modal Button -->
                <button
                  @click="$emit('openLeadDetails', lead)"
                  class="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                  title="View Outreach Script"
                >
                  <MessageSquare class="w-3.5 h-3.5" />
                  <span>Script</span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredLeads.length === 0">
            <td colspan="6" class="py-10 text-center text-slate-400">
              No leads match the selected filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Sparkles, MessageSquare } from 'lucide-vue-next'

const props = defineProps({
  leads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh', 'openLeadDetails'])

const search = ref('')
const sourceFilter = ref('ALL')
const statusFilter = ref('ALL')
const qualifyingId = ref(null)

const filteredLeads = computed(() => {
  let list = [...props.leads]

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.serviceInterested && l.serviceInterested.toLowerCase().includes(q))
    )
  }

  if (sourceFilter.value !== 'ALL') {
    list = list.filter(l => l.source === sourceFilter.value)
  }

  if (statusFilter.value !== 'ALL') {
    list = list.filter(l => l.status === statusFilter.value)
  }

  return list
})

async function updateLeadStatus(leadId, status) {
  try {
    await $fetch('/api/leads/update-status', {
      method: 'POST',
      body: { leadId, status }
    })
    emit('refresh')
  } catch (err) {
    console.error('Failed to update lead status:', err)
  }
}

async function qualifyWithAi(leadId) {
  qualifyingId.value = leadId
  try {
    const res = await $fetch('/api/leads/qualify', {
      method: 'POST',
      body: { leadId }
    })
    if (res.success) {
      emit('refresh')
      emit('openLeadDetails', res.lead)
    }
  } catch (err) {
    console.error('Failed to qualify lead:', err)
  } finally {
    qualifyingId.value = null
  }
}

async function generateStripeLink(lead) {
  try {
    const res = await $fetch('/api/stripe/create-checkout', {
      method: 'POST',
      body: {
        leadId: lead.id,
        amount: lead.dealValue || 1500,
        description: lead.serviceInterested || 'Painting & Remodeling Services'
      }
    })
    if (res.success && res.checkoutUrl) {
      prompt('Stripe payment link generated successfully! Copy to send to client:', res.checkoutUrl)
      emit('refresh')
    }
  } catch (err) {
    alert('Failed to generate Stripe payment link.')
  }
}
</script>
