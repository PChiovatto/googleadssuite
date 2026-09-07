<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <!-- Header Controls -->
    <div class="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Desempenho por Campanha</h3>
        <p class="text-xs text-slate-500">Métricas consolidadas dos últimos 30 dias via Google Ads API</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar campanha..."
            class="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-48 sm:w-56"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <!-- Channel Filter -->
        <select
          v-model="channelFilter"
          class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer"
        >
          <option value="ALL">Todos os Canais</option>
          <option value="SEARCH">Search (Rede de Pesquisa)</option>
          <option value="DISPLAY">Display</option>
          <option value="PERFORMANCE_MAX">Performance Max</option>
        </select>
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
            <th class="py-3.5 px-4 cursor-pointer hover:text-blue-600" @click="sortBy('campaignName')">
              Campanha <span v-if="sortKey === 'campaignName'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-3">Canal</th>
            <th class="py-3.5 px-3">Status</th>
            <th class="py-3.5 px-3 text-right cursor-pointer hover:text-blue-600" @click="sortBy('impressions')">
              Impressões <span v-if="sortKey === 'impressions'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-3 text-right cursor-pointer hover:text-blue-600" @click="sortBy('clicks')">
              Cliques <span v-if="sortKey === 'clicks'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-3 text-right cursor-pointer hover:text-blue-600" @click="sortBy('ctr')">
              CTR <span v-if="sortKey === 'ctr'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-3 text-right cursor-pointer hover:text-blue-600" @click="sortBy('cost')">
              Custo <span v-if="sortKey === 'cost'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-3 text-right cursor-pointer hover:text-blue-600" @click="sortBy('conversions')">
              Conv. <span v-if="sortKey === 'conversions'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-3 text-right cursor-pointer hover:text-blue-600" @click="sortBy('costPerConversion')">
              CPA <span v-if="sortKey === 'costPerConversion'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-3 text-right cursor-pointer hover:text-blue-600" @click="sortBy('roas')">
              ROAS <span v-if="sortKey === 'roas'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="py-3.5 px-4 text-center">Quota Impr.</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="campaign in filteredCampaigns"
            :key="campaign.id || campaign.campaignId"
            class="hover:bg-slate-50/60 transition-colors"
          >
            <!-- Campaign Name -->
            <td class="py-3.5 px-4 font-semibold text-slate-800">
              <div class="flex items-center gap-2">
                <span class="truncate max-w-[220px]" :title="campaign.campaignName">
                  {{ campaign.campaignName }}
                </span>
              </div>
            </td>

            <!-- Channel -->
            <td class="py-3.5 px-3">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase"
                :class="{
                  'bg-blue-50 text-blue-700 border border-blue-200': campaign.advertisingChannel === 'SEARCH',
                  'bg-purple-50 text-purple-700 border border-purple-200': campaign.advertisingChannel === 'PERFORMANCE_MAX',
                  'bg-amber-50 text-amber-700 border border-amber-200': campaign.advertisingChannel === 'DISPLAY',
                  'bg-slate-100 text-slate-700': !['SEARCH', 'PERFORMANCE_MAX', 'DISPLAY'].includes(campaign.advertisingChannel)
                }"
              >
                {{ campaign.advertisingChannel }}
              </span>
            </td>

            <!-- Status -->
            <td class="py-3.5 px-3">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="campaign.status === 'ENABLED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="campaign.status === 'ENABLED' ? 'bg-emerald-500' : 'bg-slate-400'"
                />
                {{ campaign.status === 'ENABLED' ? 'Ativa' : 'Pausada' }}
              </span>
            </td>

            <!-- Impressions -->
            <td class="py-3.5 px-3 text-right text-slate-700 font-mono">
              {{ campaign.impressions.toLocaleString('pt-BR') }}
            </td>

            <!-- Clicks -->
            <td class="py-3.5 px-3 text-right text-slate-700 font-mono">
              {{ campaign.clicks.toLocaleString('pt-BR') }}
            </td>

            <!-- CTR -->
            <td class="py-3.5 px-3 text-right font-mono font-medium text-slate-700">
              {{ campaign.ctr.toFixed(2) }}%
            </td>

            <!-- Cost -->
            <td class="py-3.5 px-3 text-right font-mono font-semibold text-slate-900">
              ${{ campaign.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </td>

            <!-- Conversions -->
            <td class="py-3.5 px-3 text-right font-mono font-semibold text-emerald-600">
              {{ campaign.conversions.toFixed(1) }}
            </td>

            <!-- CPA -->
            <td class="py-3.5 px-3 text-right font-mono text-slate-700">
              ${{ campaign.costPerConversion.toFixed(2) }}
            </td>

            <!-- ROAS -->
            <td class="py-3.5 px-3 text-right font-mono font-bold" :class="campaign.roas >= 4 ? 'text-purple-600' : 'text-slate-700'">
              {{ campaign.roas.toFixed(2) }}x
            </td>

            <!-- Search Impression Share -->
            <td class="py-3.5 px-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="bg-blue-600 h-1.5 rounded-full"
                    :style="{ width: `${Math.min(campaign.searchImpressionShare, 100)}%` }"
                  />
                </div>
                <span class="font-mono text-[11px] text-slate-600 font-medium">
                  {{ campaign.searchImpressionShare }}%
                </span>
              </div>
            </td>
          </tr>

          <tr v-if="filteredCampaigns.length === 0">
            <td colspan="11" class="py-8 text-center text-slate-400">
              Nenhuma campanha encontrada para os filtros selecionados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  }
})

const searchQuery = ref('')
const channelFilter = ref('ALL')
const sortKey = ref('cost')
const sortOrder = ref('desc')

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const filteredCampaigns = computed(() => {
  let list = [...props.campaigns]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.campaignName.toLowerCase().includes(q))
  }

  if (channelFilter.value !== 'ALL') {
    list = list.filter(c => c.advertisingChannel === channelFilter.value)
  }

  list.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (typeof valA === 'string') {
      return sortOrder.value === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    }

    return sortOrder.value === 'asc' ? valA - valB : valB - valA
  })

  return list
})
</script>
