<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <!-- Header with Search & Filter -->
    <div class="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-bold text-slate-900">Pipeline de Leads & Atendimento</h3>
        <p class="text-xs text-slate-500">Contatos capturados via Google Ads e Google Meu Negócio</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nome, fone, serviço..."
            class="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-48 sm:w-60 transition-all"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <!-- Source Filter -->
        <select
          v-model="sourceFilter"
          class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
        >
          <option value="ALL">Todas as Origens</option>
          <option value="GOOGLE_ADS">Google Ads (Webhooks)</option>
          <option value="GOOGLE_BUSINESS">Google Meu Negócio</option>
          <option value="ORGANIC">Orgânico</option>
        </select>

        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
        >
          <option value="ALL">Todos os Status</option>
          <option value="NOVO">Novo</option>
          <option value="EM_ATENDIMENTO">Em Atendimento</option>
          <option value="CONVERTIDO">Convertido</option>
          <option value="PERDIDO">Perdido</option>
        </select>
      </div>
    </div>

    <!-- Leads Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
            <th class="py-3.5 px-4">Origem</th>
            <th class="py-3.5 px-4">Cliente / Contato</th>
            <th class="py-3.5 px-4">Serviço de Interesse</th>
            <th class="py-3.5 px-3">Status</th>
            <th class="py-3.5 px-3 text-center">Score IA</th>
            <th class="py-3.5 px-4 text-right">Ações & Roteiro</th>
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
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                :class="{
                  'bg-blue-50 text-blue-700 border border-blue-200': lead.source === 'GOOGLE_ADS',
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': lead.source === 'GOOGLE_BUSINESS',
                  'bg-slate-100 text-slate-700 border border-slate-200': lead.source === 'ORGANIC'
                }"
              >
                <span v-if="lead.source === 'GOOGLE_ADS'">🎯 Ads Form</span>
                <span v-else-if="lead.source === 'GOOGLE_BUSINESS'">📍 Meu Negócio</span>
                <span v-else>🌐 Orgânico</span>
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
                {{ lead.serviceInterested || 'Pintura Residencial Geral' }}
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
                  'bg-rose-50 text-rose-700 border-rose-200': lead.status === 'PERDIDO'
                }"
              >
                <option value="NOVO">● Novo</option>
                <option value="EM_ATENDIMENTO">● Em Atendimento</option>
                <option value="CONVERTIDO">✔ Convertido</option>
                <option value="PERDIDO">✖ Perdido</option>
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
                <!-- Qualify with AI Button -->
                <button
                  @click="qualifyWithAi(lead.id)"
                  :disabled="qualifyingId === lead.id"
                  class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                  title="Qualificar Lead e Gerar Roteiro com Gemini"
                >
                  <Sparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': qualifyingId === lead.id }" />
                  <span>{{ qualifyingId === lead.id ? 'Analisando...' : 'Qualificar IA' }}</span>
                </button>

                <!-- WhatsApp Modal Button -->
                <button
                  @click="$emit('openLeadDetails', lead)"
                  class="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs"
                  title="Ver Roteiro de WhatsApp"
                >
                  <MessageSquare class="w-3.5 h-3.5" />
                  <span>Roteiro</span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredLeads.length === 0">
            <td colspan="6" class="py-10 text-center text-slate-400">
              Nenhum lead encontrado para os filtros selecionados.
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
    console.error('Falha ao atualizar status do lead:', err)
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
    console.error('Erro ao qualificar lead:', err)
  } finally {
    qualifyingId.value = null
  }
}
</script>
