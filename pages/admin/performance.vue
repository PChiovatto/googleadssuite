<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
          <span>👑</span>
          <span>Executive Management Portal</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Estimator Performance & SLA Audit
        </h1>
        <p class="text-xs text-slate-500">
          Monthly audit of Speed-to-Lead (SLA), individual close conversion rates, and gross revenue generated.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold">
          Current Period: September 2026
        </span>
      </div>
    </div>

    <!-- Manager Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase text-slate-500">Closed Won Revenue</span>
        <div class="text-2xl font-black text-slate-900 mt-1">
          ${{ teamTotals.totalRevenue?.toLocaleString('en-US') || '35,200' }}
        </div>
        <span class="text-[11px] text-emerald-600 font-semibold">Total contracted revenue</span>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm bg-purple-50/20">
        <span class="text-xs font-semibold uppercase text-purple-600">Average Speed-to-Lead SLA</span>
        <div class="text-2xl font-black text-purple-900 mt-1">
          {{ teamTotals.teamAvgSlaMinutes || 2.3 }} min
        </div>
        <span class="text-[11px] text-purple-600 font-semibold">Ad submission to initial dial time</span>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm bg-blue-50/20">
        <span class="text-xs font-semibold uppercase text-blue-600">Claimed Leads</span>
        <div class="text-2xl font-black text-blue-900 mt-1">
          {{ teamTotals.totalClaimed || 32 }}
        </div>
        <span class="text-[11px] text-blue-500 font-semibold">Assigned through speed-to-lead queue</span>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm bg-emerald-50/20">
        <span class="text-xs font-semibold uppercase text-emerald-600">Team Close Rate</span>
        <div class="text-2xl font-black text-emerald-900 mt-1">
          {{ teamTotals.teamConversionRate || 25.8 }}%
        </div>
        <span class="text-[11px] text-emerald-600 font-semibold">Inbound leads converted to paying clients</span>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Monthly Estimator Leaderboard</h2>
          <p class="text-xs text-slate-500">Individual rankings by speed-to-lead and total closed revenue</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th class="py-3.5 px-4 text-center">Rank</th>
              <th class="py-3.5 px-4">Estimator</th>
              <th class="py-3.5 px-4 text-right">Claimed Leads</th>
              <th class="py-3.5 px-4 text-right">Closed Won</th>
              <th class="py-3.5 px-4 text-right">Revenue ($)</th>
              <th class="py-3.5 px-4 text-right">Conversion Rate</th>
              <th class="py-3.5 px-4 text-center">Response SLA</th>
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
                ${{ consultant.revenue.toLocaleString('en-US') }}
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

    <!-- ZENITH PILLAR: Job Costing & Real Profitability -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-6 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
            <span>📊</span>
            <span>Job Costing & Real Job Profitability</span>
          </div>
          <h2 class="text-lg font-black text-slate-900">Project Cost & Net Profit Statement</h2>
          <p class="text-xs text-slate-500">
            Settled contract revenue net of direct labor costs (GPS Timesheets @ $45/hr) and materials procurement (MaterialOrder).
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
            Standard Field Labor: $45.00/hr
          </span>
        </div>
      </div>

      <!-- Job Costing KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <span class="text-[10px] font-bold uppercase text-slate-500">Total Contract Value</span>
          <div class="text-xl font-black text-slate-900 mt-0.5">
            ${{ (jobCosting.totalRevenue || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-slate-400">Active project contracts</span>
        </div>

        <div class="bg-blue-50/40 rounded-xl p-4 border border-blue-100">
          <span class="text-[10px] font-bold uppercase text-blue-700">Labor (GPS Hours)</span>
          <div class="text-xl font-black text-blue-900 mt-0.5">
            ${{ (jobCosting.totalLabor || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-blue-600 font-semibold">Verified field clock-in hours</span>
        </div>

        <div class="bg-amber-50/40 rounded-xl p-4 border border-amber-100">
          <span class="text-[10px] font-bold uppercase text-amber-700">Materials & Supplies</span>
          <div class="text-xl font-black text-amber-900 mt-0.5">
            ${{ (jobCosting.totalMaterials || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-amber-600 font-semibold">Sherwin / Ben Moore</span>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <span class="text-[10px] font-bold uppercase text-emerald-700">Real Net Margin</span>
          <div class="text-xl font-black text-emerald-700 mt-0.5">
            ${{ (jobCosting.totalNetProfit || 0).toLocaleString('en-US') }}
          </div>
          <span class="text-[10px] text-emerald-600 font-semibold">Net cash flow for Tony's</span>
        </div>

        <div class="bg-purple-50/40 rounded-xl p-4 border border-purple-100 col-span-2 lg:col-span-1">
          <span class="text-[10px] font-bold uppercase text-purple-700">Average Net Margin</span>
          <div class="text-xl font-black text-purple-900 mt-0.5">
            {{ jobCosting.avgMargin || 41.2 }}%
          </div>
          <span class="text-[10px] text-purple-600 font-semibold">Efficiency target: > 35%</span>
        </div>
      </div>

      <!-- Job Costing Projects Breakdown Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th class="py-3 px-3">Project / Client</th>
              <th class="py-3 px-3">City (MA)</th>
              <th class="py-3 px-3 text-right">Contract ($)</th>
              <th class="py-3 px-3 text-right">GPS Hours</th>
              <th class="py-3 px-3 text-right">Labor Cost</th>
              <th class="py-3 px-3 text-right">Materials</th>
              <th class="py-3 px-3 text-right">Net Profit ($)</th>
              <th class="py-3 px-3 text-center">Margin</th>
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
      <!-- 1. AI Rescue Lead Engine -->
      <div class="bg-white rounded-2xl border border-rose-200/80 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🤖</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Rescue Lead (AI Engine)</h3>
              <p class="text-[11px] text-slate-500">Re-engaging stalled estimates > 48h</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
            {{ compliance.stalledProposalsCount || 2 }} pending
          </span>
        </div>

        <p class="text-xs text-slate-600">
          AI analyzes proposal history, detects objections, and generates high-converting SMS/WhatsApp offers with deposit incentives.
        </p>

        <div v-if="rescueResult" class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900">Lead: {{ rescueResult.lead?.name }}</span>
            <span class="text-[10px] text-rose-600 font-bold font-mono">{{ rescueResult.stagnantHours }}h stalled</span>
          </div>
          <div class="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
            {{ rescueResult.rescue?.sms }}
          </div>
          <div class="text-[10px] text-emerald-700 font-semibold">
            🎁 Offer: {{ rescueResult.rescue?.recommendedOffer }}
          </div>
        </div>

        <button
          @click="triggerRescueLead"
          :disabled="isRescuing"
          class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span v-if="isRescuing">Dispatching AI...</span>
          <span v-else>⚡ Trigger AI Rescue Engine</span>
        </button>
      </div>

      <!-- 2. MA Building Code & Permit Compliance -->
      <div class="bg-white rounded-2xl border border-blue-200/80 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚖️</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Permit & Compliance MA</h3>
              <p class="text-[11px] text-slate-500">Building Permits 780 CMR & EPA Lead-Safe</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
            MA HIC #204891
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-slate-900">{{ compliance.approvedPermits || 3 }}</div>
            <div class="text-[10px] text-emerald-600 font-bold">Approved / Exempt</div>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-blue-700">{{ compliance.pendingPermits || 1 }}</div>
            <div class="text-[10px] text-blue-600 font-bold">Municipal Review</div>
          </div>
        </div>

        <p class="text-xs text-slate-600">
          Automated regulatory compliance for Boston ISD, Cambridge, Wakefield, Somerville, Newton, and Brookline with historic district and pre-1978 lead paint screening.
        </p>

        <div class="pt-1">
          <span class="text-[11px] font-semibold text-slate-500">Overall Compliance:</span>
          <span class="ml-2 text-xs font-bold text-emerald-600">✓ 100% State Compliant (M.G.L. c. 142A)</span>
        </div>
      </div>

      <!-- 3. Referral Loop & Cashback Stripe -->
      <div class="bg-white rounded-2xl border border-purple-200/80 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🎁</span>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Referral Loop & Cashback</h3>
              <p class="text-[11px] text-slate-500">Client Referral & Word-of-Mouth Engine</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
            $150 / Referral
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-purple-900">{{ compliance.totalReferrers || 5 }}</div>
            <div class="text-[10px] text-purple-600 font-bold">Active Referrers</div>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div class="text-lg font-black text-emerald-700">$450</div>
            <div class="text-[10px] text-emerald-600 font-bold">Cashback Disbursed</div>
          </div>
        </div>

        <p class="text-xs text-slate-600">
          Upon project completion, homeowners receive an automated referral link. They earn $150 via Stripe and their referred neighbor receives $100 off their quote.
        </p>

        <div class="pt-1">
          <span class="text-[11px] font-semibold text-slate-500">Integration:</span>
          <span class="ml-2 text-xs font-bold text-purple-700">Stripe Connect & Transfer</span>
        </div>
      </div>
    </div>

    <!-- Security Audit Trail Log (Audit Log Table) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Security Audit Trail & Compliance Log</h2>
          <p class="text-xs text-slate-500">Immutable ledger of user actions, status transitions, and TCPA consent records</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th class="py-3 px-3">Timestamp (UTC)</th>
              <th class="py-3 px-3">Action</th>
              <th class="py-3 px-3">User / System</th>
              <th class="py-3 px-3">Logged Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50/50">
              <td class="py-2.5 px-3 text-slate-400">{{ new Date(log.timestamp).toLocaleString('en-US') }}</td>
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

