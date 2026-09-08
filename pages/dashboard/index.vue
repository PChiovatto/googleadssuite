<template>
  <div class="space-y-6">
    <!-- Header & Status Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Google Ads & AI Executive Dashboard</h1>
        <p class="text-xs text-slate-500">
          Last Synced: {{ formattedLastSync }} •
          <span class="font-medium text-slate-700">Account: Tony's Painting and Remodeling Inc.</span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="text-xs px-3 py-1 rounded-full font-semibold"
          :class="isDemoMode ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'"
        >
          {{ isDemoMode ? 'Demo Mode (Benchmarked Data)' : 'Live Google Ads Account (GAQL)' }}
        </span>
      </div>
    </div>

    <!-- Notice Banner if in Demo Mode -->
    <div v-if="isDemoMode" class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
      <span class="text-base">💡</span>
      <div class="space-y-0.5">
        <p class="font-bold">Dashboard is operating with industry-benchmarked data for local painting & remodeling.</p>
        <p class="text-amber-800/90">
          To synchronize live Google Ads data, configure your API credentials in your <code class="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file or visit the <NuxtLink to="/settings" class="underline font-bold">Settings</NuxtLink> page.
        </p>
      </div>
    </div>

    <!-- Primary KPIs (Row 1) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Total Spend"
        :value="totals.cost"
        prefix="$"
        icon="dollar"
        color="rose"
        :trend="8.4"
      />
      <MetricsCard
        title="Conversions"
        :value="totals.conversions"
        icon="target"
        color="emerald"
        :trend="14.2"
      />
      <MetricsCard
        title="Avg. CPA"
        :value="totals.cpa"
        prefix="$"
        icon="trending"
        color="purple"
        :trend="-5.1"
      />
      <MetricsCard
        title="Overall ROAS"
        :value="totals.roas"
        suffix="x"
        icon="award"
        color="emerald"
        :trend="11.8"
      />
    </div>

    <!-- Secondary KPIs (Row 2) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Impressions"
        :value="totals.impressions"
        icon="eye"
        color="blue"
      />
      <MetricsCard
        title="Clicks"
        :value="totals.clicks"
        icon="click"
        color="cyan"
      />
      <MetricsCard
        title="Avg. CTR"
        :value="totals.avgCtr"
        suffix="%"
        icon="percent"
        color="amber"
      />
      <MetricsCard
        title="Avg. CPC"
        :value="totals.avgCpc"
        prefix="$"
        icon="dollar"
        color="blue"
      />
    </div>

    <!-- Core Grid: Left 2 Cols (Data & Keywords) / Right 1 Col (Gemini AI Consultant) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Left 2 Cols -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Campaigns Data Table -->
        <DataTable :campaigns="campaigns" />

        <!-- Top Keywords Performance Table -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-bold text-slate-900">Top Spend & High-Performance Keywords</h3>
              <p class="text-xs text-slate-500">Quality Score (1-10) and Cost Per Click (CPC) analysis</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                  <th class="py-3 px-3">Keyword</th>
                  <th class="py-3 px-2">Match Type</th>
                  <th class="py-3 px-2 text-center">Quality Score</th>
                  <th class="py-3 px-3 text-right">Clicks</th>
                  <th class="py-3 px-3 text-right">Cost</th>
                  <th class="py-3 px-3 text-right">Avg. CPC</th>
                  <th class="py-3 px-3 text-right">Conv.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="kw in keywords" :key="kw.id || kw.keyword" class="hover:bg-slate-50/60">
                  <td class="py-3 px-3 font-semibold text-slate-800">
                    {{ kw.keyword }}
                  </td>
                  <td class="py-3 px-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {{ kw.matchType }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-center">
                    <span
                      class="inline-block px-2 py-0.5 rounded font-bold text-[11px]"
                      :class="kw.qualityScore >= 8 ? 'bg-emerald-50 text-emerald-700' : kw.qualityScore >= 6 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'"
                    >
                      {{ kw.qualityScore ? `${kw.qualityScore}/10` : 'N/A' }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-right font-mono">{{ kw.clicks.toLocaleString('en-US') }}</td>
                  <td class="py-3 px-3 text-right font-mono font-semibold">${{ kw.cost.toFixed(2) }}</td>
                  <td class="py-3 px-3 text-right font-mono">${{ kw.cpc.toFixed(2) }}</td>
                  <td class="py-3 px-3 text-right font-mono font-bold text-emerald-600">{{ kw.conversions }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right 1 Col (Gemini AI Consultant) -->
      <div class="lg:col-span-1 sticky top-24">
        <AiInsights :campaigns="campaigns" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const totals = ref({
  cost: 13590.80,
  conversions: 518.0,
  conversionValue: 61750.00,
  cpa: 26.23,
  roas: 4.54,
  impressions: 299040,
  clicks: 11880,
  avgCtr: 3.97,
  avgCpc: 1.14
})

const campaigns = ref([])
const keywords = ref([])
const isDemoMode = ref(true)
const lastSyncedAt = ref(new Date())

const formattedLastSync = computed(() => {
  if (!lastSyncedAt.value) return 'Never synced'
  return new Date(lastSyncedAt.value).toLocaleString('en-US')
})

async function fetchDashboardData() {
  try {
    const res = await $fetch('/api/ads/campaigns')
    if (res.success) {
      totals.value = res.totals
      campaigns.value = res.campaigns
      keywords.value = res.keywords
      isDemoMode.value = res.account?.isDemo ?? true
      if (res.account?.lastSyncedAt) {
        lastSyncedAt.value = res.account.lastSyncedAt
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
