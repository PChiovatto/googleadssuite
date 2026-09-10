<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          📄 Orçamentos Interativos (Good / Better / Best)
        </h1>
        <p class="text-sm text-slate-400">
          Crie e envie propostas digitais com 3 pacotes, add-ons opcionais, assinatura digital e depósito Stripe 1/3 (Lei MA HIC).
        </p>
      </div>

      <button 
        @click="showCreateModal = true"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition"
      >
        <span>➕ Nova Proposta Interativa</span>
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs font-semibold text-slate-400">Total de Orçamentos</div>
        <div class="text-2xl font-black text-white mt-1">{{ estimates.length }}</div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs font-semibold text-emerald-400">Aprovados / Ganhos</div>
        <div class="text-2xl font-black text-emerald-400 mt-1">
          {{ estimates.filter(e => e.status === 'ACCEPTED').length }}
        </div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs font-semibold text-amber-400">Aguardando Resposta</div>
        <div class="text-2xl font-black text-amber-400 mt-1">
          {{ estimates.filter(e => e.status === 'SENT').length }}
        </div>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div class="text-xs font-semibold text-slate-400">Ticket Médio (Good/Better/Best)</div>
        <div class="text-2xl font-black text-white mt-1">
          ${{ averageTicket.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Estimates Table -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-bold text-sm text-white">Propostas Emitidas</h3>
        <button @click="loadEstimates" class="text-xs text-slate-400 hover:text-white transition">
          🔄 Atualizar
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-sm text-slate-400">
        Carregando orçamentos...
      </div>

      <div v-else-if="estimates.length === 0" class="text-center py-16 text-slate-400">
        <p class="text-base font-semibold text-white mb-1">Nenhum orçamento emitido ainda</p>
        <p class="text-xs mb-4">Clique no botão acima para criar sua primeira proposta interativa de 3 níveis.</p>
        <button 
          @click="showCreateModal = true"
          class="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
        >
          Criar Proposta Agora
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th class="p-4">Cliente / Imóvel</th>
              <th class="p-4">Título da Proposta</th>
              <th class="p-4">Status</th>
              <th class="p-4">Valores (3 Níveis)</th>
              <th class="p-4">Total / Depósito</th>
              <th class="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 text-slate-300">
            <tr v-for="est in estimates" :key="est.id" class="hover:bg-slate-800/40 transition">
              <td class="p-4">
                <div class="font-bold text-white text-sm">{{ est.lead?.name }}</div>
                <div class="text-slate-400 text-[11px]">{{ est.lead?.city || 'Newton' }}, MA • {{ est.lead?.phone }}</div>
              </td>
              <td class="p-4">
                <div class="font-medium text-white">{{ est.title }}</div>
                <div class="text-slate-400 text-[11px]">{{ formatDate(est.createdAt) }}</div>
              </td>
              <td class="p-4">
                <span 
                  :class="[
                    'px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase',
                    est.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  ]"
                >
                  {{ est.status === 'ACCEPTED' ? '✓ Aprovado & Assinado' : '● Enviado ao Cliente' }}
                </span>
              </td>
              <td class="p-4 font-mono text-[11px]">
                <div>🥉 Good: ${{ est.goodPrice.toLocaleString() }}</div>
                <div class="text-red-400 font-bold">🥈 Better: ${{ est.betterPrice.toLocaleString() }}</div>
                <div>🥇 Best: ${{ est.bestPrice.toLocaleString() }}</div>
              </td>
              <td class="p-4">
                <div class="text-sm font-black text-emerald-400">${{ est.totalAmount.toLocaleString() }}</div>
                <div class="text-slate-400 text-[11px]">Sinal 1/3: ${{ est.depositAmount.toLocaleString() }}</div>
              </td>
              <td class="p-4 text-right space-x-2">
                <a 
                  :href="`/estimate/${est.token}`" 
                  target="_blank"
                  class="inline-block px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                >
                  Visualizar ↗
                </a>
                <button 
                  @click="copyEstimateLink(est.token)"
                  class="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 font-semibold border border-red-500/30 transition"
                >
                  Copiar Link
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span>➕ Criar Nova Proposta Interativa</span>
          </h2>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div class="space-y-4">
          <!-- Select Lead -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Selecionar Lead do CRM</label>
            <select 
              v-model="newForm.leadId"
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none"
            >
              <option value="" disabled>Escolha um lead...</option>
              <option v-for="l in availableLeads" :key="l.id" :value="l.id">
                {{ l.name }} • {{ l.serviceInterested || 'Pintura' }} ({{ l.city || 'MA' }})
              </option>
            </select>
          </div>

          <!-- Proposal Title -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Título da Proposta</label>
            <input 
              v-model="newForm.title"
              type="text"
              class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <!-- 3 Tiers Price Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1">🥉 Good Price ($)</label>
              <input v-model.number="newForm.goodPrice" type="number" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-red-400 mb-1">🥈 Better Price ($)</label>
              <input v-model.number="newForm.betterPrice" type="number" class="w-full px-3 py-2 bg-slate-900 border border-red-500/50 rounded-lg text-white font-mono text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-amber-400 mb-1">🥇 Best Price ($)</label>
              <input v-model.number="newForm.bestPrice" type="number" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm" />
            </div>
          </div>

          <!-- Auto Dispatch Checkboxes -->
          <div class="flex items-center gap-6 text-xs text-slate-300">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="newForm.sendSms" class="rounded text-red-600" />
              <span>Enviar Link por SMS (Twilio)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="newForm.sendEmail" class="rounded text-red-600" />
              <span>Enviar Link por E-mail (SES)</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button @click="showCreateModal = false" class="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700">
            Cancelar
          </button>
          <button 
            @click="submitCreateEstimate"
            :disabled="creating || !newForm.leadId"
            class="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition disabled:opacity-50"
          >
            {{ creating ? 'Gerando...' : '🚀 Gerar e Enviar Proposta' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const estimates = ref([])
const availableLeads = ref([])
const showCreateModal = ref(false)
const creating = ref(false)

const newForm = ref({
  leadId: '',
  title: 'Proposta de Pintura & Reforma Residencial - Tony\'s Remodeling',
  goodPrice: 5400,
  betterPrice: 7800,
  bestPrice: 10900,
  sendSms: true,
  sendEmail: true
})

const loadEstimates = async () => {
  loading.value = true
  try {
    const res = await $fetch('/api/estimates/list')
    estimates.value = res.estimates || []
  } catch (err) {
    console.error('Erro ao listar orçamentos:', err)
  } finally {
    loading.value = false
  }
}

const loadLeads = async () => {
  try {
    const res = await $fetch('/api/leads')
    availableLeads.value = res.leads || []
    if (availableLeads.value.length > 0 && !newForm.value.leadId) {
      newForm.value.leadId = availableLeads.value[0].id
    }
  } catch (err) {
    console.error('Erro ao carregar leads:', err)
  }
}

const averageTicket = computed(() => {
  if (estimates.value.length === 0) return 0
  const sum = estimates.value.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
  return Math.round(sum / estimates.value.length)
})

const copyEstimateLink = (token) => {
  const url = `${window.location.origin}/estimate/${token}`
  navigator.clipboard.writeText(url)
  alert(`Link copiado para a área de transferência:\n${url}`)
}

const submitCreateEstimate = async () => {
  creating.value = true
  try {
    const res = await $fetch('/api/estimates/create', {
      method: 'POST',
      body: newForm.value
    })
    showCreateModal.value = false
    await loadEstimates()
    alert(`Proposta criada com sucesso!\nLink do cliente: ${res.estimateUrl}`)
  } catch (err) {
    alert(err.data?.message || 'Erro ao criar proposta')
  } finally {
    creating.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
  loadEstimates()
  loadLeads()
})
</script>
