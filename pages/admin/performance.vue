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

async function fetchPerformanceData() {
  try {
    const res = await $fetch('/api/admin/reports')
    if (res.success) {
      teamTotals.value = res.teamTotals
      leaderboard.value = res.leaderboard
      auditLogs.value = res.auditLogs
    }
  } catch (err) {
    console.error('Error fetching manager report:', err)
  }
}

onMounted(() => {
  fetchPerformanceData()
})
</script>
