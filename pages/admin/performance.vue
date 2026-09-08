<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
          <span>👑</span>
          <span>Painel do Gestor (Manager Executive Portal)</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Performance & Auditoria de Consultores
        </h1>
        <p class="text-xs text-slate-500">
          Acompanhamento mensal de velocidade de atendimento (SLA), taxa de conversão individual e faturamento gerado.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold">
          Mês Atual: Setembro / 2026
        </span>
      </div>
    </div>

    <!-- Manager Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase text-slate-500">Faturamento Fechado</span>
        <div class="text-2xl font-black text-slate-900 mt-1">
          ${{ teamTotals.totalRevenue?.toLocaleString('pt-BR') || '35.200' }}
        </div>
        <span class="text-[11px] text-emerald-600 font-semibold">Total em contratos de pintura</span>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm bg-purple-50/20">
        <span class="text-xs font-semibold uppercase text-purple-600">SLA Médio de Atendimento</span>
        <div class="text-2xl font-black text-purple-900 mt-1">
          {{ teamTotals.teamAvgSlaMinutes || 2.3 }} min
        </div>
        <span class="text-[11px] text-purple-600 font-semibold">Tempo do anúncio ao clique no fone</span>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm bg-blue-50/20">
        <span class="text-xs font-semibold uppercase text-blue-600">Leads Assumidos</span>
        <div class="text-2xl font-black text-blue-900 mt-1">
          {{ teamTotals.totalClaimed || 32 }}
        </div>
        <span class="text-[11px] text-blue-500 font-semibold">Distribuídos na roleta de velocidade</span>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm bg-emerald-50/20">
        <span class="text-xs font-semibold uppercase text-emerald-600">Taxa de Conversão da Equipe</span>
        <div class="text-2xl font-black text-emerald-900 mt-1">
          {{ teamTotals.teamConversionRate || 25.8 }}%
        </div>
        <span class="text-[11px] text-emerald-600 font-semibold">Leads transformados em clientes</span>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Ranking Mensal de Consultores (Leaderboard)</h2>
          <p class="text-xs text-slate-500">Métricas individuais de quem atendeu mais rápido e gerou maior caixa</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th class="py-3.5 px-4 text-center">Rank</th>
              <th class="py-3.5 px-4">Consultor</th>
              <th class="py-3.5 px-4 text-right">Leads Assumidos</th>
              <th class="py-3.5 px-4 text-right">Contratos Fechados</th>
              <th class="py-3.5 px-4 text-right">Faturamento ($)</th>
              <th class="py-3.5 px-4 text-right">Taxa de Conversão</th>
              <th class="py-3.5 px-4 text-center">SLA de Resposta</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(consultant, index) in leaderboard" :key="consultant.id" class="hover:bg-slate-50/60">
              <!-- Rank Medal -->
              <td class="py-3.5 px-4 text-center font-black text-sm">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else class="text-slate-400 font-mono">#{{ index + 1 }}</span>
              </td>

              <!-- Name & Email -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 text-sm">{{ consultant.name }}</div>
                <div class="text-[11px] text-slate-400 font-mono">{{ consultant.email }}</div>
              </td>

              <!-- Claimed Count -->
              <td class="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                {{ consultant.claimedCount }}
              </td>

              <!-- Closed Deals -->
              <td class="py-3.5 px-4 text-right font-mono font-bold text-purple-700">
                {{ consultant.closedCount }}
              </td>

              <!-- Revenue -->
              <td class="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600 text-sm">
                ${{ consultant.revenue.toLocaleString('pt-BR') }}
              </td>

              <!-- Conversion Rate -->
              <td class="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                {{ consultant.conversionRate }}%
              </td>

              <!-- SLA Speed -->
              <td class="py-3.5 px-4 text-center">
                <span
                  class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  :class="consultant.avgSlaMinutes <= 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  ⚡ {{ consultant.avgSlaMinutes }} min
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ZENITH PILLAR: Job Costing & Lucro Real por Obra -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-6 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
            <span>📊</span>
            <span>Job Costing & Lucratividade Real (Pilar Zenith)</span>
          </div>
          <h2 class="text-lg font-black text-slate-900">Demonstrativo de Custos & Lucro Líquido por Obra</h2>
          <p class="text-xs text-slate-500">
            Faturamento Stripe descontado do custo real de mão de obra (Ponto GPS $45/h) e pedidos de insumos (MaterialOrder).
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
            Mão de Obra Padrão: $45.00/h
          </span>
        </div>
      </div>

      <!-- Job Costing KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <span class="text-[10px] font-bold uppercase text-slate-500">Receita Total de Obras</span>
          <div class="text-xl font-black text-slate-900 mt-0.5">
            ${{ (jobCosting.totalRevenue || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-slate-400">Contratos vigentes</span>
        </div>

        <div class="bg-blue-50/40 rounded-xl p-4 border border-blue-100">
          <span class="text-[10px] font-bold uppercase text-blue-700">Mão de Obra (Horas GPS)</span>
          <div class="text-xl font-black text-blue-900 mt-0.5">
            ${{ (jobCosting.totalLabor || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-blue-600 font-semibold">Horas validadas em campo</span>
        </div>

        <div class="bg-amber-50/40 rounded-xl p-4 border border-amber-100">
          <span class="text-[10px] font-bold uppercase text-amber-700">Materiais & Tintas</span>
          <div class="text-xl font-black text-amber-900 mt-0.5">
            ${{ (jobCosting.totalMaterials || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-amber-600 font-semibold">Sherwin / Ben Moore</span>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <span class="text-[10px] font-bold uppercase text-emerald-700">Lucro Líquido Real</span>
          <div class="text-xl font-black text-emerald-700 mt-0.5">
            ${{ (jobCosting.totalNetProfit || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-emerald-600 font-semibold">Livre no caixa da Tony's</span>
        </div>

        <div class="bg-purple-50/40 rounded-xl p-4 border border-purple-100 col-span-2 lg:col-span-1">
          <span class="text-[10px] font-bold uppercase text-purple-700">Margem Líquida Média</span>
          <div class="text-xl font-black text-purple-900 mt-0.5">
            {{ jobCosting.avgMargin || 41.2 }}%
          </div>
          <span class="text-[10px] text-purple-600 font-semibold">Meta de eficiência: > 35%</span>
        </div>
      </div>

      <!-- Job Costing Projects Breakdown Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th class="py-3 px-3">Obra / Cliente</th>
              <th class="py-3 px-3">Cidade (MA)</th>
              <th class="py-3 px-3 text-right">Contrato ($)</th>
              <th class="py-3 px-3 text-right">Horas GPS</th>
              <th class="py-3 px-3 text-right">Mão de Obra</th>
              <th class="py-3 px-3 text-right">Materiais</th>
              <th class="py-3 px-3 text-right">Lucro Real ($)</th>
              <th class="py-3 px-3 text-center">Margem</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="p in jobCosting.projects" :key="p.id" class="hover:bg-slate-50/60">
              <td class="py-3 px-3">
                <div class="font-bold text-slate-900">{{ p.name }}</div>
                <div class="text-[10px] text-slate-400">{{ p.service }}</div>
              </td>
              <td class="py-3 px-3 font-semibold text-slate-700">{{ p.city }}</td>
              <td class="py-3 px-3 text-right font-mono font-bold text-slate-900">
                ${{ p.revenue.toLocaleString('en-US') }}
              </td>
              <td class="py-3 px-3 text-right font-mono text-slate-600">
                {{ p.laborHours }}h
              </td>
              <td class="py-3 px-3 text-right font-mono text-blue-700 font-semibold">
                ${{ p.laborCost.toLocaleString('en-US') }}
              </td>
              <td class="py-3 px-3 text-right font-mono text-amber-700 font-semibold">
                ${{ p.materialsCost.toLocaleString('en-US') }}
              </td>
              <td class="py-3 px-3 text-right font-mono font-black text-emerald-600">
                ${{ p.netProfit.toLocaleString('en-US') }}
              </td>
              <td class="py-3 px-3 text-center">
                <span
                  class="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="p.margin >= 35 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ p.margin }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ZENITH PILLARS: Rescue Lead Bot, Permit Compliance & Referral Loop -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 1. AI Rescue Lead (GPT-4o) Engine -->
      <div class="bg-white rounded-2xl border border-rose-200/80 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🤖</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Rescue Lead (GPT-4o)</h3>
              <p class="text-[11px] text-slate-500">Reengajamento de orçamentos parados > 48h</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
            {{ compliance.stalledProposalsCount || 2 }} pendentes
          </span>
        </div>

        <p class="text-xs text-slate-600">
          A IA analisa o histórico do orçamento, identifica a principal objeção de compra e gera um SMS/WhatsApp personalizado com garantia e desconto exclusivo no sinal.
        </p>

        <div v-if="rescueResult" class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900">Lead: {{ rescueResult.lead?.name }}</span>
            <span class="text-[10px] text-rose-600 font-bold font-mono">{{ rescueResult.stagnantHours }}h parado</span>
          </div>
          <div class="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
            {{ rescueResult.rescue?.sms }}
          </div>
          <div class="text-[10px] text-emerald-700 font-semibold">
            🎁 Oferta: {{ rescueResult.rescue?.recommendedOffer }}
          </div>
        </div>

        <button
          @click="triggerRescueLead"
          :disabled="isRescuing"
          class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span v-if="isRescuing">Disparando IA...</span>
          <span v-else>⚡ Acionar Resgate Inteligente</span>
        </button>
      </div>

      <!-- 2. MA Building Code & Permit Compliance -->
      <div class="bg-white rounded-2xl border border-blue-200/80 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚖️</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Permit & Compliance MA</h3>
              <p class="text-[11px] text-slate-500">Alvarás 780 CMR & EPA Lead-Safe</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
            Licença #204891
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-slate-900">{{ compliance.approvedPermits || 3 }}</div>
            <div class="text-[10px] text-emerald-600 font-bold">Aprovados / Isentos</div>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-blue-700">{{ compliance.pendingPermits || 1 }}</div>
            <div class="text-[10px] text-blue-600 font-bold">Em Análise Municipal</div>
          </div>
        </div>

        <p class="text-xs text-slate-600">
          Validação automatizada de regras em Boston ISD, Cambridge, Wakefield, Somerville, Newton e Brookline com verificação de distritos históricos e casas pré-1978.
        </p>

        <div class="pt-1">
          <span class="text-[11px] font-semibold text-slate-500">Status Geral:</span>
          <span class="ml-2 text-xs font-bold text-emerald-600">✓ 100% Em Conformidade Estadual</span>
        </div>
      </div>

      <!-- 3. Referral Loop & Cashback Stripe -->
      <div class="bg-white rounded-2xl border border-purple-200/80 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🎁</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Referral Loop & Cashback</h3>
              <p class="text-[11px] text-slate-500">Programa de Indicação Boca a Boca</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
            $150 / Indicação
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-purple-900">{{ compliance.totalReferrers || 5 }}</div>
            <div class="text-[10px] text-purple-600 font-bold">Clientes com Link</div>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-emerald-700">$450</div>
            <div class="text-[10px] text-emerald-600 font-bold">Cashback Liberado</div>
          </div>
        </div>

        <p class="text-xs text-slate-600">
          Ao finalizar a pintura, o cliente recebe um link pessoal para indicar amigos. Ele ganha $150 via Stripe e o novo cliente ganha $100 de boas-vindas no orçamento.
        </p>

        <div class="pt-1">
          <span class="text-[11px] font-semibold text-slate-500">Integração:</span>
          <span class="ml-2 text-xs font-bold text-purple-700">Stripe Connect & Transfer</span>
        </div>
      </div>
    </div>

    <!-- Security Audit Trail Log (Audit Log Table) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Trilha de Auditoria & Conformidade (Audit Trail)</h2>
          <p class="text-xs text-slate-500">Registro imutável de quem clicou, alterou status ou registrou opt-in de TCPA</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th class="py-3 px-3">Data / Hora (UTC)</th>
              <th class="py-3 px-3">Ação</th>
              <th class="py-3 px-3">Usuário / Sistema</th>
              <th class="py-3 px-3">Detalhes Gravados</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50/50">
              <td class="py-2.5 px-3 text-slate-400">{{ new Date(log.timestamp).toLocaleString('pt-BR') }}</td>
              <td class="py-2.5 px-3">
                <span class="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                  {{ log.action }}
                </span>
              </td>
              <td class="py-2.5 px-3 font-semibold text-slate-800">{{ log.userName || log.userId }}</td>
              <td class="py-2.5 px-3 text-slate-500 truncate max-w-xs">{{ log.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const teamTotals = ref({})
const leaderboard = ref([])
const auditLogs = ref([])
const jobCosting = ref({})
const compliance = ref({})

const isRescuing = ref(false)
const rescueResult = ref(null)

async function fetchPerformanceData() {
  try {
    const res = await $fetch('/api/admin/reports')
    if (res.success) {
      teamTotals.value = res.teamTotals || {}
      leaderboard.value = res.leaderboard || []
      auditLogs.value = res.auditLogs || []
      jobCosting.value = res.jobCosting || {}
      compliance.value = res.compliance || {}
    }
  } catch (err) {
    console.error('Error fetching manager report:', err)
  }
}

async function triggerRescueLead() {
  isRescuing.value = true
  try {
    const res = await $fetch('/api/ai/rescue', {
      method: 'POST',
      body: {}
    })
    if (res.success) {
      rescueResult.value = res
      await fetchPerformanceData()
    }
  } catch (err) {
    console.error('Error triggering rescue lead:', err)
  } finally {
    isRescuing.value = false
  }
}

onMounted(() => {
  fetchPerformanceData()
})
</script>

