<template>
  <div class="space-y-6">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Gestão de Leads & CRM (Ads + GBP)</h1>
        <p class="text-xs text-slate-500">
          Recepção centralizada de leads do Google Ads (Webhooks) e Google Meu Negócio com roteiros via Gemini.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Simulate Google Ads Webhook Button -->
        <button
          @click="simulateWebhookLead"
          :disabled="simulating"
          class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
          title="Simula o envio de um formulário de extensão de anúncio do Google Ads"
        >
          <Send class="w-3.5 h-3.5" :class="{ 'animate-pulse': simulating }" />
          <span>{{ simulating ? 'Simulando...' : 'Testar Webhook Ads' }}</span>
        </button>

        <!-- Sync Google Meu Negócio Button -->
        <button
          @click="syncGbp"
          :disabled="syncingGbp"
          class="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': syncingGbp }" />
          <span>{{ syncingGbp ? 'Sincronizando...' : 'Puxar do Google Meu Negócio' }}</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards for Funnel & Leads -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <span class="text-[11px] font-semibold uppercase text-slate-500">Total no Funil</span>
        <div class="text-2xl font-black text-slate-900 mt-1">{{ stats.total || 0 }}</div>
        <span class="text-[10px] text-slate-400">Leads capturados</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm bg-emerald-50/20">
        <span class="text-[11px] font-semibold uppercase text-emerald-600">1. Novos (Roleta)</span>
        <div class="text-2xl font-black text-emerald-700 mt-1">{{ stats.newLeads || 0 }}</div>
        <span class="text-[10px] text-emerald-500">Aguardando atendimento</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm bg-amber-50/20">
        <span class="text-[11px] font-semibold uppercase text-amber-600">2. Em Atendimento</span>
        <div class="text-2xl font-black text-amber-700 mt-1">{{ stats.inProgress || 0 }}</div>
        <span class="text-[10px] text-amber-500">Em contato / negociação</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm bg-blue-50/20">
        <span class="text-[11px] font-semibold uppercase text-blue-600">3. Propostas</span>
        <div class="text-2xl font-black text-blue-700 mt-1">{{ stats.proposals || 0 }}</div>
        <span class="text-[10px] text-blue-500">Orçamentos enviados</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm bg-purple-50/20 col-span-2 sm:col-span-1">
        <span class="text-[11px] font-semibold uppercase text-purple-600">4. Fechados / Ganho</span>
        <div class="text-2xl font-black text-purple-700 mt-1">
          {{ stats.converted || 0 }} <span class="text-xs font-bold text-purple-500">({{ stats.total ? Math.round((stats.converted / stats.total) * 100) : 0 }}%)</span>
        </div>
        <span class="text-[10px] text-purple-500">Contratos convertidos</span>
      </div>
    </div>

    <!-- View Toggle Bar -->
    <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
      <span class="text-xs font-bold text-slate-700">Modo de Visualização do Pipeline:</span>
      <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
        <button
          @click="currentView = 'kanban'"
          class="px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
          :class="currentView === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <span>📋 Funil Kanban (Com Trava de Lead)</span>
        </button>
        <button
          @click="currentView = 'table'"
          class="px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5"
          :class="currentView === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
        >
          <span>📑 Tabela Detalhada</span>
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
                {{ selectedLead.source === 'GOOGLE_ADS' ? 'Google Ads' : 'Google Meu Negócio' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ selectedLead.phone }} • {{ selectedLead.email || 'Sem e-mail' }}
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
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Serviço Solicitado:</span>
            <p class="text-slate-900 font-semibold mt-0.5">{{ selectedLead.serviceInterested }}</p>
          </div>
          <div v-if="selectedLead.campaignName">
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Campanha de Origem:</span>
            <p class="text-slate-600 font-mono mt-0.5">{{ selectedLead.campaignName }}</p>
          </div>
          <div v-if="selectedLead.notes">
            <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Observações do Lead:</span>
            <p class="text-slate-600 italic mt-0.5">"{{ selectedLead.notes }}"</p>
          </div>
        </div>

        <!-- Gemini AI Qualification Section -->
        <div class="bg-gradient-to-tr from-purple-50 via-indigo-50/40 to-purple-50 rounded-xl p-4 border border-purple-200/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-purple-600" />
              <span>Diagnóstico do Gemini AI</span>
            </span>
            <span
              v-if="selectedLead.aiScore"
              class="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900"
            >
              Score: {{ selectedLead.aiScore }}/10
            </span>
          </div>

          <p class="text-xs text-purple-950 leading-relaxed font-medium">
            {{ selectedLead.aiQualification || 'Clique em "Qualificar IA" para gerar a análise estratégica deste lead.' }}
          </p>
        </div>

        <!-- Suggested WhatsApp Pitch -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>💬</span>
              <span>Roteiro de Abordagem WhatsApp / SMS</span>
            </span>

            <button
              v-if="selectedLead.whatsappScript"
              @click="copyScript(selectedLead.whatsappScript)"
              class="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Copiado!' : 'Copiar Mensagem' }}</span>
            </button>
          </div>

          <div class="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs font-sans leading-relaxed border border-slate-800">
            {{ selectedLead.whatsappScript || 'Gere a qualificação acima para obter a mensagem ideal para fechar a visita.' }}
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            @click="selectedLead = null"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Fechar
          </button>

          <a
            v-if="selectedLead.phone && selectedLead.whatsappScript"
            :href="generateWhatsAppUrl(selectedLead.phone, selectedLead.whatsappScript)"
            target="_blank"
            class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <span>Abrir no WhatsApp Web</span>
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
    console.error('Erro ao carregar leads:', err)
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
    console.error('Erro ao sincronizar GBP:', err)
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
        { column_id: 'CUSTOM_QUESTION', string_value: 'Pintura Interior e Teto com Massa Corrida' }
      ]
    }

    await $fetch('/api/webhooks/google-leads', {
      method: 'POST',
      body: mockPayload
    })

    await fetchLeads()
  } catch (err) {
    console.error('Erro ao simular webhook:', err)
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
    console.error('Falha ao copiar:', e)
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
