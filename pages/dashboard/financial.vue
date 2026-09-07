<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Relatório Financeiro & ROAS Real</h1>
          <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Stripe & Google Ads Live</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Cruzamento dos custos de mídia da Google Ads API com os contratos reais fechados no CRM e depósitos liquidados.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchFinancials"
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>Atualizar Métricas</span>
        </button>
      </div>
    </div>

    <!-- Financial KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- Total Spend -->
      <div class="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs bg-rose-50/10">
        <span class="text-[11px] font-semibold uppercase text-rose-600">Investimento Google Ads</span>
        <div class="text-2xl font-black text-rose-700 mt-1">
          ${{ Number(financials.totalAdSpend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-rose-500">{{ financials.totalAdClicks || 0 }} cliques recebidos</span>
      </div>

      <!-- Real Closed Revenue -->
      <div class="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs bg-emerald-50/20">
        <span class="text-[11px] font-semibold uppercase text-emerald-600">Faturamento Real Fechado</span>
        <div class="text-2xl font-black text-emerald-700 mt-1">
          ${{ Number(financials.totalClosedRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-emerald-600 font-semibold">{{ financials.closedDealsCount || 0 }} contratos fechados</span>
      </div>

      <!-- Real ROAS -->
      <div class="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs bg-purple-50/20">
        <span class="text-[11px] font-semibold uppercase text-purple-600">ROAS Real (Retorno em $)</span>
        <div class="text-2xl font-black text-purple-700 mt-1">
          {{ financials.realRoas || 0 }}x
        </div>
        <span class="text-[10px] text-purple-500">Para cada $1 investido</span>
      </div>

      <!-- Real CAC -->
      <div class="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs bg-blue-50/20">
        <span class="text-[11px] font-semibold uppercase text-blue-600">CAC Real por Cliente</span>
        <div class="text-2xl font-black text-blue-700 mt-1">
          ${{ Number(financials.realCac || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-blue-500">Custo de Aquisição</span>
      </div>

      <!-- Net Profit After Ads -->
      <div class="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs bg-indigo-50/20 col-span-2 lg:col-span-1">
        <span class="text-[11px] font-semibold uppercase text-indigo-600">Lucro Bruto Líquido</span>
        <div class="text-2xl font-black text-indigo-700 mt-1">
          ${{ Number(financials.netProfitAfterAds || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-indigo-500 font-bold">Margem de {{ financials.profitMarginPercent || 0 }}%</span>
      </div>
    </div>

    <!-- Campaign Breakdown Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Performance e Retorno por Campanha</h2>
          <p class="text-[11px] text-slate-500">Comparação direta do investimento do Google com a receita real de contratos</p>
        </div>
        <span class="text-[11px] font-mono text-slate-400">Moeda: USD ($)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="py-3 px-4">Campanha</th>
              <th class="py-3 px-4">Tipo</th>
              <th class="py-3 px-4 text-right">Gasto Google ($)</th>
              <th class="py-3 px-4 text-center">Contratos Fechados</th>
              <th class="py-3 px-4 text-right">Receita Contratada ($)</th>
              <th class="py-3 px-4 text-center">ROAS Real</th>
              <th class="py-3 px-4 text-right">CAC ($)</th>
              <th class="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in campaigns" :key="c.campaignName" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-3 px-4 font-bold text-slate-900">{{ c.campaignName }}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 font-mono">
                  {{ c.channel }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                ${{ Number(c.spend).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="py-3 px-4 text-center font-bold text-slate-900">{{ c.closedDeals }}</td>
              <td class="py-3 px-4 text-right font-mono text-emerald-600 font-bold">
                ${{ Number(c.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="py-3 px-4 text-center">
                <span class="px-2 py-0.5 rounded-full font-black text-xs bg-purple-100 text-purple-800">
                  {{ c.roas }}x
                </span>
              </td>
              <td class="py-3 px-4 text-right font-mono text-slate-600">${{ c.cac }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  :class="c.status === 'HIGH_PERFORMER' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ c.status === 'HIGH_PERFORMER' ? 'Escalar Lance' : 'Otimizar' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top Keywords Breakdown -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">Palavras-Chave Mais Lucrativas (ROAS > 15x)</h3>
        <span class="text-xs text-slate-400">Rastreamento ValueTrack Granular</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="kw in topKeywords"
          :key="kw.keyword"
          class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
        >
          <span class="font-mono text-xs font-black text-slate-900 block truncate">
            🔍 {{ kw.keyword }}
          </span>
          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <span class="text-slate-500">ROAS:</span>
            <span class="font-black text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">{{ kw.roas }}x</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-600">
            <span>Receita:</span>
            <span class="font-bold text-emerald-700">${{ Number(kw.revenue).toLocaleString('en-US') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const financials = ref({})
const campaigns = ref([])
const topKeywords = ref([])

async function fetchFinancials() {
  try {
    const res = await $fetch('/api/analytics/financial')
    if (res.success) {
      financials.value = res.financials || {}
      campaigns.value = res.campaignBreakdown || []
      topKeywords.value = res.topKeywords || []
    }
  } catch (err) {
    console.error('Erro ao buscar dados financeiros:', err)
  }
}

onMounted(() => {
  fetchFinancials()
})
</script>
