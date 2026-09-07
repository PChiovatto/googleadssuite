<template>
  <div class="space-y-4">
    <!-- Toast Notification for Claim / Race Conditions / Drag Feedback -->
    <div
      v-if="toastMessage"
      class="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border transition-all animate-bounce"
      :class="toastSuccess ? 'bg-emerald-900 text-white border-emerald-700' : 'bg-rose-900 text-white border-rose-700'"
    >
      {{ toastMessage }}
    </div>

    <!-- Instructions Bar -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 py-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm border border-slate-700/60">
      <div class="flex items-center gap-2">
        <span class="text-base">🖐️</span>
        <span class="font-medium text-slate-200">
          <strong class="text-white font-bold">Pipeline Interativo:</strong> Arraste e solte os cards entre as colunas ou utilize os botões de ação rápida em cada etapa.
        </span>
      </div>
      <div class="flex items-center gap-3 text-[11px] text-slate-300">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> 1. Roleta</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> 2. Atendimento</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-400"></span> 3. Proposta</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-400"></span> 4. Ganho</span>
      </div>
    </div>

    <!-- Kanban Columns Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
      <!-- Column Template with Drag & Drop Dropzone -->
      <div
        v-for="col in columns"
        :key="col.id"
        @dragover.prevent="onDragOver(col.id)"
        @dragleave="onDragLeave(col.id)"
        @drop="onDrop(col.id)"
        class="rounded-2xl p-3 border transition-all flex flex-col min-h-[560px]"
        :class="[
          col.bgClass,
          activeOverCol === col.id ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/80 scale-[1.01]' : 'border-slate-200/80'
        ]"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="col.dotColor"></span>
            <span class="font-black text-xs text-slate-800 uppercase tracking-wider">{{ col.title }}</span>
          </div>
          <span class="text-xs font-black px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs border border-slate-200">
            {{ getColumnLeads(col.id).length }}
          </span>
        </div>

        <!-- Cards List -->
        <div class="space-y-3 flex-1 overflow-y-auto min-h-[100px]">
          <!-- Individual Lead Card (Draggable) -->
          <div
            v-for="lead in getColumnLeads(col.id)"
            :key="lead.id"
            draggable="true"
            @dragstart="onDragStart($event, lead)"
            @dragend="onDragEnd"
            class="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200/90 hover:shadow-md transition-all space-y-2.5 text-xs cursor-grab active:cursor-grabbing hover:border-slate-300 select-none relative group"
            :class="{ 'opacity-40 ring-2 ring-blue-400': draggedLeadId === lead.id }"
          >
            <!-- Lead Card Top Row: Name & Source -->
            <div class="flex items-start justify-between gap-1">
              <div class="flex-1 min-w-0">
                <button
                  type="button"
                  @click="$emit('openLeadDetails', lead)"
                  class="font-black text-sm text-slate-900 hover:text-blue-600 transition-colors text-left truncate block w-full"
                  title="Clique para ver Roteiro de IA e Detalhes"
                >
                  {{ lead.name }}
                </button>
                <div class="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                  <a
                    v-if="lead.phone"
                    :href="`tel:${lead.phone}`"
                    class="hover:text-blue-600 hover:underline"
                    @click.stop
                  >
                    📞 {{ lead.phone }}
                  </a>
                  <span v-else class="text-slate-400">Sem telefone</span>
                </div>
              </div>

              <!-- Source Badge -->
              <span
                class="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider shrink-0"
                :class="{
                  'bg-blue-50 text-blue-700 border border-blue-200': lead.source === 'GOOGLE_ADS',
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': lead.source === 'GOOGLE_LSA' || lead.source === 'GOOGLE_BUSINESS',
                  'bg-slate-100 text-slate-600': lead.source === 'ORGANIC'
                }"
              >
                {{ lead.source === 'GOOGLE_LSA' ? 'LSA' : lead.source === 'GOOGLE_ADS' ? 'Google Ads' : lead.source === 'GOOGLE_BUSINESS' ? 'GBP Maps' : 'Orgânico' }}
              </span>
            </div>

            <!-- Service & Location -->
            <p class="text-[11px] text-slate-700 line-clamp-2 font-medium bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
              🛠️ {{ lead.serviceInterested || lead.serviceType || 'Pintura Residencial Geral' }}
            </p>

            <!-- ValueTrack Tag & City -->
            <div v-if="lead.keyword || lead.city || lead.dealValue" class="flex flex-wrap gap-1 text-[9px]">
              <span v-if="lead.dealValue" class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold">
                💰 ${{ Number(lead.dealValue).toLocaleString('en-US') }}
              </span>
              <span v-if="lead.city" class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                📍 {{ lead.city }}
              </span>
              <span v-if="lead.keyword" class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono truncate max-w-[130px]" :title="lead.keyword">
                🔍 {{ lead.keyword }}
              </span>
            </div>

            <!-- Quick Stage Selector Dropdown -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
              <span class="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Mudar Etapa:</span>
              <select
                :value="lead.status"
                @change="changeLeadStatus(lead.id, $event.target.value)"
                :disabled="updatingStatusId === lead.id"
                class="text-[10px] font-bold py-1 px-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-800 transition-colors"
              >
                <option v-for="c in columns" :key="c.id" :value="c.id">
                  {{ c.title }}
                </option>
              </select>
            </div>

            <!-- Contextual Stage Action Buttons -->
            <div class="space-y-1.5">
              <!-- ETAPA 1: NOVO (Desbloqueio / Claim) -->
              <div v-if="lead.status === 'NOVO'">
                <button
                  type="button"
                  @click="claimLead(lead.id)"
                  :disabled="claimingId === lead.id"
                  class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase py-2 px-3 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all animate-pulse"
                >
                  <span>⚡ ASSUMIR & LIGAR</span>
                </button>
              </div>

              <!-- ETAPA 2: EM ATENDIMENTO -->
              <div v-else-if="lead.status === 'EM_ATENDIMENTO'" class="space-y-1">
                <button
                  type="button"
                  @click="changeLeadStatus(lead.id, 'PROPOSTA')"
                  :disabled="updatingStatusId === lead.id"
                  class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 px-2.5 rounded-lg shadow-2xs flex items-center justify-center gap-1 transition-all"
                >
                  <span>📝 Avançar para Proposta</span>
                  <span>→</span>
                </button>

                <div class="grid grid-cols-2 gap-1 pt-0.5">
                  <button
                    type="button"
                    @click="scheduleQuickEstimate(lead)"
                    :disabled="schedulingId === lead.id"
                    class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[10px] py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1"
                    title="Agendar visita presencial de orçamento e disparar SMS"
                  >
                    <span>📅 Agendar Visita</span>
                  </button>
                  <button
                    type="button"
                    @click="$emit('openLeadDetails', lead)"
                    class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[10px] py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1"
                  >
                    <span>💬 Roteiro IA</span>
                  </button>
                </div>

                <button
                  type="button"
                  @click="changeLeadStatus(lead.id, 'PERDIDO')"
                  :disabled="updatingStatusId === lead.id"
                  class="w-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 font-semibold text-[9px] py-0.5 rounded transition-colors"
                >
                  ✖ Descartar Lead / Perdido
                </button>
              </div>

              <!-- ETAPA 3: PROPOSTA ENVIADA -->
              <div v-else-if="lead.status === 'PROPOSTA'" class="space-y-1">
                <button
                  type="button"
                  @click="changeLeadStatus(lead.id, 'CONVERTIDO')"
                  :disabled="updatingStatusId === lead.id"
                  class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-1.5 px-2.5 rounded-lg shadow-2xs flex items-center justify-center gap-1 transition-all"
                >
                  <span>✔ Fechar / Marcar Ganho</span>
                  <span>🏆</span>
                </button>

                <!-- MA Contract Generator Button -->
                <button
                  type="button"
                  @click="generateLegalContract(lead)"
                  :disabled="generatingContractId === lead.id"
                  class="w-full bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-[10px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1"
                  title="Gerar Contrato Legal de Massachusetts (M.G.L. c. 142A) com Assinatura Digital e Depósito de 1/3"
                >
                  <span>📄 Gerar Contrato MA</span>
                  <span class="text-[9px] bg-orange-200 text-orange-900 px-1 rounded font-black">HIC</span>
                </button>

                <div class="grid grid-cols-2 gap-1 pt-0.5">
                  <button
                    type="button"
                    @click="generateStripeLink(lead)"
                    :disabled="creatingStripeId === lead.id"
                    class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[10px] py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1"
                    title="Gerar link de pagamento com cartão"
                  >
                    <span>💳 Stripe Link</span>
                  </button>
                  <button
                    type="button"
                    @click="changeLeadStatus(lead.id, 'PERDIDO')"
                    :disabled="updatingStatusId === lead.id"
                    class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[10px] py-1 px-1 rounded-md transition-colors"
                  >
                    <span>✖ Perdido</span>
                  </button>
                </div>
              </div>

              <!-- ETAPA 4: CONVERTIDO / GANHO -->
              <div v-else-if="lead.status === 'CONVERTIDO'" class="space-y-1">
                <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center text-emerald-800 font-extrabold text-[11px] flex items-center justify-center gap-1">
                  <span>🎉</span>
                  <span>CONTRATO FECHADO!</span>
                </div>

                <div class="grid grid-cols-2 gap-1 pt-0.5">
                  <button
                    type="button"
                    @click="sendOfflineConversion(lead)"
                    :disabled="sendingOfflineId === lead.id"
                    class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[10px] py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1"
                    title="Notifica Google Ads com GCLID para otimizar ROAS"
                  >
                    <span>🚀 Offline Ads</span>
                  </button>

                  <button
                    type="button"
                    @click="requestGoogleReview(lead)"
                    :disabled="requestingReviewId === lead.id"
                    class="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px] py-1 px-1 rounded-md transition-colors flex items-center justify-center gap-1"
                    title="Disparar SMS/E-mail solicitando avaliação 5 estrelas no Google Meu Negócio"
                  >
                    <span>⭐ Pedir Review</span>
                  </button>
                </div>

                <button
                  type="button"
                  @click="generateStripeLink(lead)"
                  :disabled="creatingStripeId === lead.id"
                  class="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[10px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <span>💳 Depósito / Pagamento Stripe</span>
                </button>
              </div>

              <!-- ETAPA 5: PERDIDO -->
              <div v-else-if="lead.status === 'PERDIDO'" class="space-y-1">
                <div class="bg-slate-100 border border-slate-200 rounded-lg p-1 text-center text-slate-500 font-medium text-[10px]">
                  Lead sem fit ou cancelado
                </div>
                <button
                  type="button"
                  @click="changeLeadStatus(lead.id, 'EM_ATENDIMENTO')"
                  :disabled="updatingStatusId === lead.id"
                  class="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] py-1 px-2 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <span>🔄 Reabrir Atendimento</span>
                </button>
              </div>
            </div>

            <!-- Consultant Badge Footer -->
            <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span class="flex items-center gap-1">
                <span>👤</span>
                <span class="font-bold text-slate-700 truncate max-w-[110px]">
                  {{ lead.owner?.name || (lead.status === 'NOVO' ? 'Na Roleta' : 'John Miller') }}
                </span>
              </span>
              <span v-if="lead.aiScore" class="font-black text-purple-700 bg-purple-50 border border-purple-200 px-1 rounded">
                AI: {{ lead.aiScore }}/10
              </span>
            </div>
          </div>

          <!-- Empty Column State -->
          <div
            v-if="getColumnLeads(col.id).length === 0"
            class="h-36 flex flex-col items-center justify-center text-[11px] text-slate-400 italic border-2 border-dashed border-slate-200/80 rounded-xl p-4 text-center"
          >
            <span>Arraste um lead para cá</span>
            <span class="text-[9px] text-slate-300 mt-1">Coluna vazia</span>
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

const emit = defineEmits(['refresh', 'openLeadDetails'])

const claimingId = ref(null)
const updatingStatusId = ref(null)
const creatingStripeId = ref(null)
const sendingOfflineId = ref(null)
const generatingContractId = ref(null)
const schedulingId = ref(null)
const requestingReviewId = ref(null)
const toastMessage = ref('')
const toastSuccess = ref(true)

// Drag and drop state
const draggedLead = ref(null)
const draggedLeadId = ref(null)
const activeOverCol = ref(null)

const columns = [
  { id: 'NOVO', title: '1. Novos (Na Roleta)', dotColor: 'bg-emerald-500', bgClass: 'bg-emerald-50/20' },
  { id: 'EM_ATENDIMENTO', title: '2. Em Atendimento', dotColor: 'bg-amber-500', bgClass: 'bg-amber-50/20' },
  { id: 'PROPOSTA', title: '3. Proposta Enviada', dotColor: 'bg-blue-500', bgClass: 'bg-blue-50/20' },
  { id: 'CONVERTIDO', title: '4. Fechado / Ganho', dotColor: 'bg-purple-500', bgClass: 'bg-purple-50/20' },
  { id: 'PERDIDO', title: '5. Perdido', dotColor: 'bg-slate-400', bgClass: 'bg-slate-100/60' }
]

function getColumnLeads(status) {
  return props.leads.filter((l) => l.status === status)
}

// HTML5 Drag and Drop Handlers
function onDragStart(event, lead) {
  draggedLead.value = lead
  draggedLeadId.value = lead.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', lead.id)
  }
}

function onDragEnd() {
  draggedLead.value = null
  draggedLeadId.value = null
  activeOverCol.value = null
}

function onDragOver(colId) {
  activeOverCol.value = colId
}

function onDragLeave(colId) {
  if (activeOverCol.value === colId) {
    activeOverCol.value = null
  }
}

async function onDrop(targetColId) {
  activeOverCol.value = null
  const currentLead = draggedLead.value
  draggedLead.value = null
  draggedLeadId.value = null

  if (!currentLead) return
  if (currentLead.status === targetColId) return

  await changeLeadStatus(currentLead.id, targetColId)
}

// Status transition
async function changeLeadStatus(leadId, newStatus) {
  updatingStatusId.value = leadId
  try {
    const res = await $fetch('/api/leads/update-status', {
      method: 'POST',
      body: { leadId, status: newStatus }
    })

    if (res.success) {
      const colTitle = columns.find(c => c.id === newStatus)?.title || newStatus
      toastSuccess.value = true
      toastMessage.value = `Lead movido com sucesso para "${colTitle}"!`
      emit('refresh')
    } else {
      toastSuccess.value = false
      toastMessage.value = res.error || 'Falha ao atualizar etapa do lead.'
    }
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Erro de conexão ao mover etapa.'
  } finally {
    updatingStatusId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 4000)
  }
}

// Claim Lead (Speed-to-lead)
async function claimLead(leadId) {
  claimingId.value = leadId
  try {
    const res = await $fetch('/api/leads/claim', {
      method: 'POST',
      body: { leadId }
    })

    if (res.success) {
      toastSuccess.value = true
      toastMessage.value = res.message || 'Lead assumido com sucesso!'
      emit('refresh')
    } else {
      toastSuccess.value = false
      toastMessage.value = res.message || 'Lead já assumido por outro consultor.'
      emit('refresh')
    }
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Falha ao assumir contato.'
  } finally {
    claimingId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 4000)
  }
}

// Google Ads Offline Conversion Dispatch
async function sendOfflineConversion(lead) {
  sendingOfflineId.value = lead.id
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
    toastMessage.value = res.message || 'Conversão Offline enviada ao Google Ads!'
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Erro ao enviar conversão offline.'
  } finally {
    sendingOfflineId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 4000)
  }
}

// Stripe Payment Link Generator
async function generateStripeLink(lead) {
  creatingStripeId.value = lead.id
  try {
    const res = await $fetch('/api/stripe/create-checkout', {
      method: 'POST',
      body: {
        leadId: lead.id,
        amount: lead.dealValue || 1500,
        description: lead.serviceInterested || 'Serviços de Pintura Contratados'
      }
    })

    if (res.success && res.checkoutUrl) {
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(res.checkoutUrl).catch(() => {})
      }
      toastSuccess.value = true
      toastMessage.value = '💳 Link Stripe gerado e copiado! Pronto para envio ao cliente.'
      emit('refresh')
      prompt('Link de pagamento Stripe gerado com sucesso! Copie para enviar ao cliente:', res.checkoutUrl)
    } else {
      toastSuccess.value = false
      toastMessage.value = 'Falha ao gerar link Stripe.'
    }
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Erro ao conectar ao Stripe.'
  } finally {
    creatingStripeId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 4500)
  }
}

// Massachusetts HIC Legal Contract Generator
async function generateLegalContract(lead) {
  generatingContractId.value = lead.id
  try {
    const res = await $fetch('/api/contracts/generate', {
      method: 'POST',
      body: {
        leadId: lead.id,
        totalAmount: lead.dealValue || 4500,
        title: `Contrato de Pintura Residencial MA - ${lead.serviceInterested || 'Serviços'}`
      }
    })

    if (res.success && res.signingUrl) {
      const fullUrl = window.location.origin + res.signingUrl
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl).catch(() => {})
      }
      toastSuccess.value = true
      toastMessage.value = `📄 Contrato MA gerado! Link de assinatura copiado: ${res.signingUrl}`
      emit('refresh')
      prompt('Contrato MA gerado (M.G.L. c. 142A)! Copie o link abaixo para enviar ao cliente assinar digitalmente:', fullUrl)
    } else {
      toastSuccess.value = false
      toastMessage.value = res.message || 'Erro ao gerar contrato.'
    }
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Falha ao conectar com o gerador de contratos.'
  } finally {
    generatingContractId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 5000)
  }
}

// Quick In-Home Estimate Scheduling with SMS Reminder
async function scheduleQuickEstimate(lead) {
  schedulingId.value = lead.id
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const res = await $fetch('/api/calendar/schedule', {
      method: 'POST',
      body: {
        leadId: lead.id,
        date: tomorrow.toISOString(),
        address: lead.address || `${lead.city || 'Boston'}, MA`,
        sendSms: true
      }
    })

    if (res.success) {
      toastSuccess.value = true
      toastMessage.value = `📅 Visita agendada para amanhã às 10h! SMS de confirmação enviado a ${lead.name}.`
      emit('refresh')
    } else {
      toastSuccess.value = false
      toastMessage.value = res.message || 'Erro ao agendar visita.'
    }
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Falha ao agendar visita.'
  } finally {
    schedulingId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 5000)
  }
}

// Google 5-Star Review Request Automation
async function requestGoogleReview(lead) {
  requestingReviewId.value = lead.id
  try {
    const res = await $fetch('/api/reputation/request-review', {
      method: 'POST',
      body: {
        leadId: lead.id,
        channel: 'BOTH'
      }
    })

    if (res.success) {
      toastSuccess.value = true
      toastMessage.value = `⭐ Solicitação de review Google enviada com sucesso para ${lead.name}!`
    } else {
      toastSuccess.value = false
      toastMessage.value = res.message || 'Falha ao enviar pedido de review.'
    }
  } catch (err) {
    toastSuccess.value = false
    toastMessage.value = 'Erro ao solicitar avaliação Google.'
  } finally {
    requestingReviewId.value = null
    setTimeout(() => {
      toastMessage.value = ''
    }, 5000)
  }
}
</script>
