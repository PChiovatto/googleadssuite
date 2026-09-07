<template>
  <div class="space-y-4">
    <!-- Toast Notification for Claim / Race Conditions -->
    <div
      v-if="toastMessage"
      class="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border transition-all animate-bounce"
      :class="toastSuccess ? 'bg-emerald-900 text-white border-emerald-700' : 'bg-rose-900 text-white border-rose-700'"
    >
      {{ toastMessage }}
    </div>

    <!-- Kanban Columns Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
      <!-- Column Template -->
      <div
        v-for="col in columns"
        :key="col.id"
        class="bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-h-[500px]"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="col.dotColor"></span>
            <span class="font-bold text-xs text-slate-800 uppercase tracking-wider">{{ col.title }}</span>
          </div>
          <span class="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
            {{ getColumnLeads(col.id).length }}
          </span>
        </div>

        <!-- Cards List -->
        <div class="space-y-3 flex-1 overflow-y-auto">
          <div
            v-for="lead in getColumnLeads(col.id)"
            :key="lead.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all space-y-2.5 text-xs"
          >
            <!-- Lead Card Header -->
            <div class="flex items-start justify-between gap-1">
              <div>
                <span class="font-extrabold text-sm text-slate-900 block">{{ lead.name }}</span>
                <span class="text-[11px] text-slate-500 font-mono">{{ lead.phone || 'Sem telefone' }}</span>
              </div>

              <!-- Source Badge -->
              <span
                class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                :class="{
                  'bg-blue-50 text-blue-700 border border-blue-200': lead.source === 'GOOGLE_ADS',
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': lead.source === 'GOOGLE_LSA' || lead.source === 'GOOGLE_BUSINESS',
                  'bg-slate-100 text-slate-600': lead.source === 'ORGANIC'
                }"
              >
                {{ lead.source === 'GOOGLE_LSA' ? 'LSA Guaranteed' : lead.source === 'GOOGLE_ADS' ? 'Google Ads' : 'GBP Maps' }}
              </span>
            </div>

            <!-- Service & Location -->
            <p class="text-[11px] text-slate-700 line-clamp-2 font-medium">
              {{ lead.serviceInterested || 'Pintura Geral' }}
            </p>

            <!-- ValueTrack Tag -->
            <div v-if="lead.keyword || lead.city" class="flex flex-wrap gap-1 text-[9px]">
              <span v-if="lead.city" class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                📍 {{ lead.city }}
              </span>
              <span v-if="lead.keyword" class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono truncate max-w-[130px]">
                🔍 {{ lead.keyword }}
              </span>
            </div>

            <!-- Ownership Badge or Claim Button -->
            <div class="pt-2 border-t border-slate-100">
              <!-- UNCLAIMED: Speed-to-Lead Claim Button -->
              <div v-if="!lead.ownerId && lead.status === 'NOVO'">
                <button
                  @click="claimLead(lead.id)"
                  :disabled="claimingId === lead.id"
                  class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase py-2 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all animate-pulse"
                >
                  <span>⚡ ASSUMIR & LIGAR</span>
                </button>
              </div>

              <!-- CLAIMED: Owner Info -->
              <div v-else class="flex items-center justify-between text-[11px]">
                <span class="text-slate-500 flex items-center gap-1">
                  <span>👤</span>
                  <span class="font-bold text-slate-800 truncate max-w-[100px]">
                    {{ lead.owner?.name || 'John Miller' }}
                  </span>
                </span>

                <!-- Quick Status Shift or Offline Conversion -->
                <button
                  v-if="lead.status === 'CONVERTIDO'"
                  @click="sendOfflineConversion(lead)"
                  class="text-[9px] font-bold text-blue-600 hover:underline bg-blue-50 px-1.5 py-0.5 rounded"
                  title="Notificar algoritmo do Google Ads"
                >
                  🚀 Offline Ads
                </button>
              </div>
            </div>
          </div>

          <div v-if="getColumnLeads(col.id).length === 0" class="h-28 flex items-center justify-center text-[11px] text-slate-400 italic">
            Nenhum lead nesta etapa
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  leads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const claimingId = ref(null)
const toastMessage = ref('')
const toastSuccess = ref(true)

const columns = [
  { id: 'NOVO', title: '1. Novos (Na Roleta)', dotColor: 'bg-emerald-500' },
  { id: 'EM_ATENDIMENTO', title: '2. Em Atendimento', dotColor: 'bg-amber-500' },
  { id: 'PROPOSTA', title: '3. Proposta Enviada', dotColor: 'bg-blue-500' },
  { id: 'CONVERTIDO', title: '4. Fechado / Ganho', dotColor: 'bg-purple-500' },
  { id: 'PERDIDO', title: '5. Perdido', dotColor: 'bg-slate-400' }
]

function getColumnLeads(status) {
  return props.leads.filter((l) => l.status === status)
}

async function claimLead(leadId) {
  claimingId.value = leadId
  try {
    const res = await $fetch('/api/leads/claim', {
      method: 'POST',
      body: { leadId }
    })

    if (res.success) {
      toastSuccess.value = true
      toastMessage.value = res.message
      emit('refresh')
    } else {
      // Collision detected! Another consultant claimed it
      toastSuccess.value = false
      toastMessage.value = res.message
      emit('refresh')
    }
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Falha ao assumir contato.'
  } finally {
    claimingId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 5000)
  }
}

async function sendOfflineConversion(lead) {
  try {
    const res = await $fetch('/api/ads/offline-conversion', {
      method: 'POST',
      body: {
        leadId: lead.id,
        gclid: lead.gclid,
        dealValue: lead.dealValue || 3800
      }
    })
    toastSuccess.value = true
    toastMessage.value = res.message
    setTimeout(() => {
      toastMessage.value = ''
    }, 4000)
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Erro ao enviar conversão offline.'
  }
}
</script>
