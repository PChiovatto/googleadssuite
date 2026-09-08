<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>✉️ Base de E-mail Marketing & Audiências</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase tracking-wider">
            TCPA / US Compliant
          </span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
            Amazon SES Native
          </span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Nutrição automatizada de leads capturados no Google Ads via Amazon SES e exportação para Google Customer Match
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openBroadcastModal"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
        >
          <span>🚀</span>
          <span>Nova Campanha de E-mail</span>
        </button>
        <button
          @click="exportCsv"
          class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
        >
          <span>📥</span>
          <span>Exportar CSV</span>
        </button>
      </div>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-xs font-semibold text-slate-500 block mb-1">Total de Inscritos</span>
        <div class="flex items-baseline justify-between">
          <span class="text-2xl font-black text-slate-900">{{ metrics.totalSubscribers }}</span>
          <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">100% Opt-in</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-xs font-semibold text-slate-500 block mb-1">Clientes Convertidos</span>
        <div class="flex items-baseline justify-between">
          <span class="text-2xl font-black text-emerald-600">{{ metrics.convertedSubscribers }}</span>
          <span class="text-[10px] text-slate-400 font-medium">Prontos para pós-venda</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-xs font-semibold text-slate-500 block mb-1">Taxa Média de Abertura</span>
        <div class="flex items-baseline justify-between">
          <span class="text-2xl font-black text-indigo-600">{{ metrics.averageOpenRate }}</span>
          <span class="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">Alto Engajamento</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <span class="text-xs font-semibold text-slate-500 block mb-1">Taxa de Clique (CTR)</span>
        <div class="flex items-baseline justify-between">
          <span class="text-2xl font-black text-purple-600">{{ metrics.averageClickRate }}</span>
          <span class="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">Estimativas</span>
        </div>
      </div>
    </div>

    <!-- Subscriber List Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nome, e-mail ou cidade..."
            class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            @input="loadContacts"
          />
          <select
            v-model="statusFilter"
            @change="loadContacts"
            class="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
          >
            <option value="ALL">Todos os Segmentos</option>
            <option value="NOVO">Novos Leads</option>
            <option value="EM_ATENDIMENTO">Em Atendimento</option>
            <option value="PROPOSTA">Proposta Enviada</option>
            <option value="CONVERTIDO">Convertidos</option>
          </select>
        </div>

        <span class="text-xs text-slate-500 font-medium">
          Exibindo {{ contacts.length }} contatos verificados
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
            <tr>
              <th class="py-3 px-4">Nome & E-mail</th>
              <th class="py-3 px-4">Telefone</th>
              <th class="py-3 px-4">Localização (US)</th>
              <th class="py-3 px-4">Serviço de Interesse</th>
              <th class="py-3 px-4">Tags & Segmentos</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr v-for="contact in contacts" :key="contact.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-3 px-4">
                <span class="font-bold text-slate-900 block">{{ contact.name }}</span>
                <span class="text-[11px] text-blue-600">{{ contact.email }}</span>
              </td>
              <td class="py-3 px-4 text-slate-600 font-mono text-[11px]">
                {{ contact.phone || 'N/A' }}
              </td>
              <td class="py-3 px-4">
                <span class="text-slate-800">{{ contact.city || 'Boston' }}, {{ contact.state || 'MA' }}</span>
                <span v-if="contact.zipCode" class="text-[10px] text-slate-400 block">ZIP: {{ contact.zipCode }}</span>
              </td>
              <td class="py-3 px-4 text-slate-600">
                {{ contact.serviceInterested || contact.serviceType || 'Pintura Residencial' }}
              </td>
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="(tag, tIdx) in contact.tagsList"
                    :key="tIdx"
                    class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="{
                    'bg-emerald-100 text-emerald-700': contact.status === 'CONVERTIDO',
                    'bg-blue-100 text-blue-700': contact.status === 'EM_ATENDIMENTO',
                    'bg-amber-100 text-amber-700': contact.status === 'NOVO',
                    'bg-purple-100 text-purple-700': contact.status === 'PROPOSTA'
                  }"
                >
                  {{ contact.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  @click="sendIndividualFollowup(contact)"
                  class="text-blue-600 hover:text-blue-800 font-bold text-[11px] underline"
                >
                  Follow-up
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Broadcast Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scale-in">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-black text-slate-900">Disparar Campanha de E-mail</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Segmento Alvo</label>
            <select
              v-model="broadcastForm.segment"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Todos os Inscritos (Total Reach)</option>
              <option value="NOVO">Apenas Novos Leads (Sem Resposta)</option>
              <option value="PROPOSTA">Leads com Proposta Pendente</option>
              <option value="CONVERTIDO">Clientes Convertidos (Pós-Venda & Retenção)</option>
            </select>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block font-bold text-slate-700">Assunto do E-mail *</label>
              <button
                @click="generateAIEmailContent"
                class="text-purple-600 hover:text-purple-700 text-[11px] font-bold flex items-center gap-1"
              >
                <span>✨ Gerar com GPT-4o</span>
              </button>
            </div>
            <input
              v-model="broadcastForm.subject"
              type="text"
              placeholder="e.g. Free On-Site Estimate: Get Your Home Ready for the Season"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Conteúdo do E-mail (HTML) *</label>
            <textarea
              v-model="broadcastForm.bodyHtml"
              rows="6"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
              placeholder="<p>Hi there,</p><p>We are offering 15% off exterior prep work this month in Boston...</p>"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            @click="showModal = false"
            class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            @click="dispatchBroadcast"
            :disabled="broadcasting"
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {{ broadcasting ? 'Enviando...' : 'Confirmar e Enviar Campanha' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const contacts = ref([])
const metrics = ref({
  totalSubscribers: 0,
  convertedSubscribers: 0,
  averageOpenRate: '38.4%',
  averageClickRate: '12.1%'
})

const searchQuery = ref('')
const statusFilter = ref('ALL')
const showModal = ref(false)
const broadcasting = ref(false)

const broadcastForm = ref({
  segment: 'ALL',
  subject: '',
  bodyHtml: ''
})

async function loadContacts() {
  try {
    const res = await $fetch('/api/marketing/emails', {
      query: {
        search: searchQuery.value,
        status: statusFilter.value
      }
    })
    if (res.success) {
      contacts.value = res.contacts
      metrics.value = res.metrics
    }
  } catch (err) {
    console.error('Error loading contacts:', err)
  }
}

function openBroadcastModal() {
  broadcastForm.value.subject = "Tony's Painting and Remodeling: Free In-Home Estimate This Week"
  broadcastForm.value.bodyHtml = `<div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
  <h2 style="color: #ff7902;">Tony's Painting and Remodeling</h2>
  <p>Hello homeowner,</p>
  <p>Are you considering an interior or exterior refresh for your property in Greater Boston? We have licensed crews available for <strong>free on-site estimates</strong> this week.</p>
  <ul>
    <li>Licensed & Insured since 2015</li>
    <li>Complete prep work: power washing, caulking, rotted wood replacement</li>
    <li>Zero upfront deposit required to quote</li>
  </ul>
  <p><a href="#quote-form" style="background:#fc0000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:30px; font-weight:bold; display:inline-block;">SCHEDULE FREE QUOTE</a></p>
  <p style="font-size:11px; color:#888; margin-top:20px;">Tony's Painting and Remodeling Corp. Reply STOP to opt out.</p>
</div>`
  showModal.value = true
}

async function generateAIEmailContent() {
  try {
    const res = await $fetch('/api/ai/followup', {
      method: 'POST',
      body: {}
    })
    if (res.followup) {
      broadcastForm.value.subject = res.followup.emailSubject || broadcastForm.value.subject
      broadcastForm.value.bodyHtml = res.followup.emailBodyHtml || broadcastForm.value.bodyHtml
    }
  } catch (err) {
    console.error('Error generating AI email:', err)
  }
}

async function dispatchBroadcast() {
  broadcasting.value = true
  try {
    const res = await $fetch('/api/marketing/broadcast', {
      method: 'POST',
      body: {
        ...broadcastForm.value,
        sendVia: 'AMAZON_SES'
      }
    })
    if (res.success) {
      alert(`Campanha disparada com sucesso via Amazon SES para ${res.recipientsCount} contatos!`)
      showModal.value = false
    }
  } catch (err) {
    alert('Erro ao enviar campanha de e-mail.')
  } finally {
    broadcasting.value = false
  }
}

function sendIndividualFollowup(contact) {
  alert(`Disparando follow-up individual para ${contact.name} (${contact.email})...`)
}

function exportCsv() {
  const headers = ['Name', 'Email', 'Phone', 'City', 'State', 'Service', 'Status']
  const rows = contacts.value.map(c => [
    `"${c.name}"`,
    `"${c.email || ''}"`,
    `"${c.phone || ''}"`,
    `"${c.city || ''}"`,
    `"${c.state || ''}"`,
    `"${c.serviceInterested || ''}"`,
    `"${c.status}"`
  ])
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `leads_email_marketing_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadContacts()
})
</script>
