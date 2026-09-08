<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Financial Analytics & Real ROAS</h1>
          <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Stripe & Google Ads Live</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Reconciliation of Google Ads API media costs with closed CRM contracts and settled Stripe deposits.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchFinancials"
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>Refresh Metrics</span>
        </button>
      </div>
    </div>

    <!-- Financial KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- Total Spend -->
      <div class="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs bg-rose-50/10">
        <span class="text-[11px] font-semibold uppercase text-rose-600">Google Ads Spend</span>
        <div class="text-2xl font-black text-rose-700 mt-1">
          ${{ Number(financials.totalAdSpend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-rose-500">{{ financials.totalAdClicks || 0 }} clicks received</span>
      </div>

      <!-- Real Closed Revenue -->
      <div class="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs bg-emerald-50/20">
        <span class="text-[11px] font-semibold uppercase text-emerald-600">Closed Revenue Won</span>
        <div class="text-2xl font-black text-emerald-700 mt-1">
          ${{ Number(financials.totalClosedRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-emerald-600 font-semibold">{{ financials.closedDealsCount || 0 }} closed contracts</span>
      </div>

      <!-- Real ROAS -->
      <div class="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs bg-purple-50/20">
        <span class="text-[11px] font-semibold uppercase text-purple-600">Real ROAS (Revenue Return)</span>
        <div class="text-2xl font-black text-purple-700 mt-1">
          {{ financials.realRoas || 0 }}x
        </div>
        <span class="text-[10px] text-purple-500">Per $1 ad spend</span>
      </div>

      <!-- Real CAC -->
      <div class="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs bg-blue-50/20">
        <span class="text-[11px] font-semibold uppercase text-blue-600">Real Blended CAC</span>
        <div class="text-2xl font-black text-blue-700 mt-1">
          ${{ Number(financials.realCac || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-blue-500">Customer Acquisition Cost</span>
      </div>

      <!-- Net Profit After Ads -->
      <div class="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs bg-indigo-50/20 col-span-2 lg:col-span-1">
        <span class="text-[11px] font-semibold uppercase text-indigo-600">Gross Margin After Ads</span>
        <div class="text-2xl font-black text-indigo-700 mt-1">
          ${{ Number(financials.netProfitAfterAds || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <span class="text-[10px] text-indigo-500 font-bold">{{ financials.profitMarginPercent || 0 }}% gross profit margin</span>
      </div>
    </div>

    <!-- Campaign Breakdown Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Campaign Performance & Real ROAS</h2>
          <p class="text-[11px] text-slate-500">Direct comparison of Google Ads expenditure vs. signed contract revenue</p>
        </div>
        <span class="text-[11px] font-mono text-slate-400">Currency: USD ($)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="py-3 px-4">Campaign</th>
              <th class="py-3 px-4">Channel / Type</th>
              <th class="py-3 px-4 text-right">Google Spend ($)</th>
              <th class="py-3 px-4 text-center">Closed Won Deals</th>
              <th class="py-3 px-4 text-right">Contracted Revenue ($)</th>
              <th class="py-3 px-4 text-center">Real ROAS</th>
              <th class="py-3 px-4 text-right">CAC ($)</th>
              <th class="py-3 px-4 text-center">Recommendation</th>
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
                  {{ c.status === 'HIGH_PERFORMER' ? 'Scale Target' : 'Optimize' }}
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
        <h3 class="text-sm font-bold text-slate-900">Top Performing Keywords (ROAS > 15x)</h3>
        <span class="text-xs text-slate-400">Granular ValueTrack Attribution</span>
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
            <span>Revenue:</span>
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
    console.error('Failed to fetch financial metrics:', err)
  }
}

onMounted(() => {
  fetchFinancials()
})
</script>
