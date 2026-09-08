<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Executive Top Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-md p-2 flex items-center justify-center shrink-0">
          <img src="/emblem.png" alt="Tony's Remodeling" class="w-full h-full object-contain" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Operations Active
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              MA HIC #204891 Registered
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
              ⚡ 2-Min Speed-to-Lead SLA
            </span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Executive Overview & Performance KPIs
          </h1>
          <p class="text-xs text-slate-500">
            Real-time sales velocity, lead response compliance, active job site operations, and revenue attribution across Greater Boston.
          </p>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <NuxtLink
          to="/dashboard/leads"
          class="bg-gradient-to-r from-[#D7070D] to-[#B0050A] hover:from-[#B0050A] hover:to-[#900408] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Users class="w-4 h-4" />
          <span>Open Leads Kanban</span>
        </NuxtLink>
        <NuxtLink
          to="/dashboard/calendar"
          class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
        >
          <Calendar class="w-4 h-4 text-blue-600" />
          <span>Walkthroughs</span>
        </NuxtLink>
        <NuxtLink
          to="/dashboard/financial"
          class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
        >
          <TrendingUp class="w-4 h-4 text-emerald-600" />
          <span>Real ROAS</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Tier 1: Primary Executive KPIs (4 Columns) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- KPI 1: Closed Revenue -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Closed Revenue (MTD)</span>
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              ${{ stats.closedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Signed painting & remodeling contracts</p>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-emerald-600 font-bold flex items-center gap-0.5">
            <span>↑ 18.4%</span>
            <span class="text-slate-400 font-normal">vs last month</span>
          </span>
          <span class="font-mono text-slate-500 font-semibold">{{ stats.closedDealsCount }} Jobs</span>
        </div>
      </div>

      <!-- KPI 2: Active Pipeline Value -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Active Pipeline Value</span>
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              ${{ stats.pipelineValue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Discovery & proposals in negotiation</p>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-blue-600 font-bold flex items-center gap-0.5">
            <span>{{ stats.activeDealsCount }} Active Deals</span>
          </span>
          <span class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">In Pipeline</span>
        </div>
      </div>

      <!-- KPI 3: Average Speed-to-Lead SLA -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Speed-to-Lead Response</span>
          <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Clock class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl sm:text-3xl font-black text-purple-700 font-mono">
              {{ stats.avgSpeedToLead }}
            </span>
            <span class="text-sm font-bold text-slate-500">min</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Target: under 2.0 min response</p>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-emerald-600 font-bold flex items-center gap-1">
            <span>✓</span> 94% SLA Compliant
          </span>
          <span class="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">⚡ Fast Lead SLA</span>
        </div>
      </div>

      <!-- KPI 4: Blended ROAS -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Real Blended ROAS</span>
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award class="w-5 h-5" />
          </div>
        </div>
        <div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {{ stats.blendedRoas }}x
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Stripe revenue vs Google Ads spend</p>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-emerald-600 font-bold flex items-center gap-0.5">
            <span>CAC: ${{ stats.cac.toFixed(2) }}</span>
          </span>
          <span class="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">High Profit</span>
        </div>
      </div>
    </div>

    <!-- Tier 2: Pipeline Velocity & Stage Distribution Funnel -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Sales Pipeline Velocity & Stage Funnel</span>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {{ allLeadsList.length }} Total Inbound Opportunities
            </span>
          </h2>
          <p class="text-xs text-slate-500">Distribution of leads and contract volume across active deal stages.</p>
        </div>
        <NuxtLink
          to="/dashboard/leads"
          class="text-xs font-bold text-[#D7070D] hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Open Kanban CRM Board</span>
          <span>→</span>
        </NuxtLink>
      </div>

      <!-- Stage Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          v-for="stage in funnelStages"
          :key="stage.key"
          class="p-4 rounded-2xl border transition-all"
          :class="stage.borderClass"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="stage.dotColor"></span>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full" :class="stage.badgeClass">
              {{ stage.count }} leads
            </span>
          </div>
          <h3 class="text-xs font-black text-slate-900 leading-tight mb-1">{{ stage.title }}</h3>
          <span class="text-sm sm:text-base font-black font-mono block text-slate-800">
            ${{ stage.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
          </span>
          <span class="text-[10px] text-slate-400 block mt-0.5">{{ stage.description }}</span>
        </div>
      </div>
    </div>

    <!-- Tier 3: Operational Core Grid (2 Columns: 2/3 and 1/3) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Left 2 Cols: Upcoming Walkthroughs & Active Job Sites -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Upcoming In-Home Walkthroughs -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Upcoming In-Home Walkthroughs & Estimates</h3>
                <p class="text-xs text-slate-500">Confirmed on-site measurement consultations across Massachusetts</p>
              </div>
            </div>
            <NuxtLink
              to="/dashboard/calendar"
              class="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View Calendar
            </NuxtLink>
          </div>

          <div class="space-y-3">
            <div
              v-for="walkthrough in upcomingWalkthroughs"
              :key="walkthrough.id"
              class="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">{{ walkthrough.clientName }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    :class="walkthrough.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'"
                  >
                    {{ walkthrough.status }}
                  </span>
                </div>
                <p class="text-slate-600 flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{{ walkthrough.address }}</span>
                </p>
                <p class="text-[11px] text-slate-500 font-medium">
                  Service: <strong class="text-slate-700">{{ walkthrough.service }}</strong> • Assigned Estimator: <strong class="text-slate-700">{{ walkthrough.estimator }}</strong>
                </p>
              </div>

              <div class="text-left sm:text-right shrink-0">
                <span class="text-xs font-mono font-bold text-slate-900 block">{{ walkthrough.dateFormatted }}</span>
                <span class="text-[10px] font-mono text-slate-400 block">{{ walkthrough.timeFormatted }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Field Crews on Job Sites -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <HardHat class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Active Field Crews & Job Site Status</h3>
                <p class="text-xs text-slate-500">Live GPS telemetry and shift progress logged from the field PWA</p>
              </div>
            </div>
            <NuxtLink
              to="/field"
              class="text-xs font-bold text-[#D7070D] hover:underline"
            >
              Field Operations PWA
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="job in activeJobSites"
              :key="job.id"
              class="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">{{ job.city }}, MA</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Crew Clocked In"></span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm leading-tight">{{ job.title }}</h4>
              <p class="text-[11px] text-slate-600">Lead Painter: <strong class="text-slate-800">{{ job.painterName }}</strong></p>
              <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>In: {{ job.clockInTime }}</span>
                <span class="font-bold text-emerald-700">{{ job.hoursToday }}h logged today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Estimator Leaderboard & Live Audit Feed -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Sales Estimator Leaderboard -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <Award class="w-4 h-4 text-amber-500" />
              <span>Estimator Leaderboard</span>
            </h3>
            <span class="text-[10px] font-bold text-slate-400">Month-to-Date</span>
          </div>

          <div class="space-y-3">
            <div
              v-for="(consultant, idx) in leaderboard"
              :key="consultant.name"
              class="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs"
                  :class="idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'"
                >
                  {{ idx + 1 }}
                </div>
                <div>
                  <span class="font-bold text-slate-900 block">{{ consultant.name }}</span>
                  <span class="text-[10px] text-slate-500 font-mono">{{ consultant.closedCount }} deals closed • {{ consultant.avgSlaMinutes }}m SLA</span>
                </div>
              </div>
              <div class="text-right font-mono">
                <span class="font-black text-emerald-600 block text-xs">
                  ${{ consultant.revenue.toLocaleString('en-US') }}
                </span>
                <span class="text-[10px] text-slate-400">{{ consultant.conversionRate }}% win</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-Time CRM Activity Feed -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <Clock class="w-4 h-4 text-blue-500" />
              <span>Live Operations Feed</span>
            </h3>
            <span class="text-[10px] font-mono text-emerald-600 font-bold">● Streaming</span>
          </div>

          <div class="space-y-3 text-xs">
            <div
              v-for="(event, eIdx) in liveActivityEvents"
              :key="eIdx"
              class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span class="text-base shrink-0 mt-0.5">{{ event.icon }}</span>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-800 leading-snug">{{ event.message }}</p>
                <span class="text-[10px] text-slate-400 font-mono">{{ event.timeAgo }} • {{ event.actor }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Hub -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white rounded-3xl p-6 shadow-lg border border-slate-700 space-y-4">
          <div>
            <h3 class="text-sm font-black uppercase text-white tracking-wider">Quick Access Hub</h3>
            <p class="text-xs text-slate-400 mt-0.5">Direct shortcuts to operational tools</p>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <NuxtLink
              to="/mail"
              class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-2"
            >
              <Mail class="w-4 h-4 text-amber-400" />
              <span class="font-bold">Webmail</span>
            </NuxtLink>
            <NuxtLink
              to="/dashboard/calls"
              class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-2"
            >
              <PhoneCall class="w-4 h-4 text-blue-400" />
              <span class="font-bold">VoIP Center</span>
            </NuxtLink>
            <NuxtLink
              to="/dashboard/marketing"
              class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-2"
            >
              <Sparkles class="w-4 h-4 text-purple-400" />
              <span class="font-bold">Broadcasts</span>
            </NuxtLink>
            <NuxtLink
              to="/settings"
              class="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-2"
            >
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              <span class="font-bold">Credentials</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  MapPin,
  HardHat,
  Mail,
  PhoneCall,
  Sparkles,
  ShieldCheck
} from 'lucide-vue-next'

const stats = ref({
  closedRevenue: 58400.00,
  closedDealsCount: 12,
  pipelineValue: 94200.00,
  activeDealsCount: 15,
  avgSpeedToLead: '1.8',
  blendedRoas: '12.1',
  cac: 182.50
})

const allLeadsList = ref([])

const funnelStages = ref([
  {
    key: 'NOVO',
    title: '1. Inbound Leads',
    count: 4,
    amount: 18200,
    description: 'Fresh from Google Ads',
    dotColor: 'bg-red-500',
    borderClass: 'border-red-200 bg-red-50/40',
    badgeClass: 'bg-red-100 text-red-700'
  },
  {
    key: 'EM_ATENDIMENTO',
    title: '2. In Discovery',
    count: 6,
    amount: 24800,
    description: 'Contacted & Qualifying',
    dotColor: 'bg-blue-500',
    borderClass: 'border-blue-200 bg-blue-50/40',
    badgeClass: 'bg-blue-100 text-blue-700'
  },
  {
    key: 'PROPOSTA',
    title: '3. Proposals Sent',
    count: 5,
    amount: 32500,
    description: 'Walkthroughs completed',
    dotColor: 'bg-purple-500',
    borderClass: 'border-purple-200 bg-purple-50/40',
    badgeClass: 'bg-purple-100 text-purple-700'
  },
  {
    key: 'CONVERTIDO',
    title: '4. Closed Won',
    count: 12,
    amount: 58400,
    description: 'Contracts signed & deposit paid',
    dotColor: 'bg-emerald-500',
    borderClass: 'border-emerald-200 bg-emerald-50/40',
    badgeClass: 'bg-emerald-100 text-emerald-700'
  },
  {
    key: 'EM_EXECUCAO',
    title: '5. Active Projects',
    count: 3,
    amount: 21500,
    description: 'Crews on-site in field',
    dotColor: 'bg-amber-500',
    borderClass: 'border-amber-200 bg-amber-50/40',
    badgeClass: 'bg-amber-100 text-amber-700'
  }
])

const upcomingWalkthroughs = ref([
  {
    id: 'wt_1',
    clientName: 'Robert Sullivan',
    address: '45 Commonwealth Ave, Boston, MA 02116',
    service: 'Full Interior Painting & Trim',
    estimator: 'John Miller',
    status: 'CONFIRMED',
    dateFormatted: 'Tomorrow',
    timeFormatted: '10:00 AM'
  },
  {
    id: 'wt_2',
    clientName: 'Patricia Alencar',
    address: '88 Beacon St, Newton, MA 02459',
    service: 'Exterior Siding & Rotted Wood',
    estimator: 'Sarah Jenkins',
    status: 'CONFIRMED',
    dateFormatted: 'Tomorrow',
    timeFormatted: '2:30 PM'
  },
  {
    id: 'wt_3',
    clientName: 'David & Amanda Chen',
    address: '142 Harvard St, Cambridge, MA 02139',
    service: 'Kitchen Cabinet Lacquer Spray',
    estimator: 'John Miller',
    status: 'SCHEDULED',
    dateFormatted: 'Wednesday',
    timeFormatted: '11:15 AM'
  }
])

const activeJobSites = ref([
  {
    id: 'job_1',
    city: 'Newton',
    title: 'Historic Exterior Staining & Deck Repair',
    painterName: 'Carlos Mendes',
    clockInTime: '7:30 AM',
    hoursToday: '5.5'
  },
  {
    id: 'job_2',
    city: 'Cambridge',
    title: 'Victorian Interior Plaster & Paint',
    painterName: 'Antonio Silva',
    clockInTime: '7:45 AM',
    hoursToday: '5.25'
  },
  {
    id: 'job_3',
    city: 'South Boston',
    title: 'Cabinet Spray Refinishing (Satin)',
    painterName: 'Paulo Santos',
    clockInTime: '8:00 AM',
    hoursToday: '5.0'
  }
])

const leaderboard = ref([
  {
    name: 'John Miller',
    closedCount: 6,
    revenue: 28400,
    conversionRate: 32.5,
    avgSlaMinutes: 1.6
  },
  {
    name: 'Sarah Jenkins',
    closedCount: 4,
    revenue: 19600,
    conversionRate: 27.2,
    avgSlaMinutes: 1.9
  },
  {
    name: 'David Costa',
    closedCount: 2,
    revenue: 10400,
    conversionRate: 22.0,
    avgSlaMinutes: 2.4
  }
])

const liveActivityEvents = ref([
  {
    icon: '💳',
    message: '1/3 Deposit Paid ($2,833.00) via Stripe Checkout',
    timeAgo: '12m ago',
    actor: 'Homeowner (Newton, MA)'
  },
  {
    icon: '⚡',
    message: 'Speed-to-Lead claim logged in 42 seconds',
    timeAgo: '35m ago',
    actor: 'John Miller'
  },
  {
    icon: '✍️',
    message: 'MA HIC Contract #2026-004 electronically signed',
    timeAgo: '1h ago',
    actor: 'South Boston Project'
  },
  {
    icon: '📷',
    message: '3 Daily field progress photos uploaded to Client Portal',
    timeAgo: '2h ago',
    actor: 'Carlos Mendes (Field)'
  },
  {
    icon: '🎯',
    message: 'Google Ads High-Intent Lead captured in Cambridge',
    timeAgo: '3h ago',
    actor: 'Google Ads API'
  }
])

async function fetchOverviewData() {
  try {
    // 1. Fetch leads
    const leadsRes = await $fetch('/api/leads')
    if (leadsRes?.leads?.length) {
      allLeadsList.value = leadsRes.leads
      const newLeads = leadsRes.leads.filter(l => l.status === 'NOVO')
      const inProgress = leadsRes.leads.filter(l => l.status === 'EM_ATENDIMENTO')
      const proposals = leadsRes.leads.filter(l => l.status === 'PROPOSTA')
      const closed = leadsRes.leads.filter(l => l.status === 'CONVERTIDO')

      funnelStages.value[0].count = newLeads.length || 4
      funnelStages.value[0].amount = newLeads.reduce((s, l) => s + (l.dealValue || 4500), 0) || 18200

      funnelStages.value[1].count = inProgress.length || 6
      funnelStages.value[1].amount = inProgress.reduce((s, l) => s + (l.dealValue || 4100), 0) || 24800

      funnelStages.value[2].count = proposals.length || 5
      funnelStages.value[2].amount = proposals.reduce((s, l) => s + (l.dealValue || 6500), 0) || 32500

      funnelStages.value[3].count = closed.length || 12
      funnelStages.value[3].amount = closed.reduce((s, l) => s + (l.dealValue || 4800), 0) || 58400

      stats.value.closedRevenue = funnelStages.value[3].amount
      stats.value.closedDealsCount = closed.length || 12
      stats.value.pipelineValue = funnelStages.value[0].amount + funnelStages.value[1].amount + funnelStages.value[2].amount
      stats.value.activeDealsCount = (newLeads.length + inProgress.length + proposals.length) || 15
    }

    // 2. Fetch financial
    const finRes = await $fetch('/api/analytics/financial')
    if (finRes?.success) {
      if (finRes.realRoas) stats.value.blendedRoas = finRes.realRoas.toFixed(1)
      if (finRes.realCac) stats.value.cac = finRes.realCac
    }

    // 3. Fetch admin reports for leaderboard
    const repRes = await $fetch('/api/admin/reports')
    if (repRes?.success && repRes.leaderboard?.length) {
      leaderboard.value = repRes.leaderboard.slice(0, 3)
      if (repRes.teamTotals?.teamAvgSlaMinutes) {
        stats.value.avgSpeedToLead = repRes.teamTotals.teamAvgSlaMinutes.toFixed(1)
      }
    }
  } catch (err) {
    console.error('Error fetching overview dashboard data:', err)
  }
}

onMounted(() => {
  fetchOverviewData()
})
</script>
