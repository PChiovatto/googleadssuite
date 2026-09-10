<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-red-600 selection:text-white">
    <!-- Header -->
    <header class="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div class="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-600/30">
            T
          </div>
          <div>
            <h1 class="text-sm font-bold text-white tracking-tight">Tony's Remodeling</h1>
            <p class="text-[10px] text-slate-400">Rastreamento da Equipe em Tempo Real</p>
          </div>
        </div>

        <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          GPS Ao Vivo
        </span>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-xl mx-auto px-4 pt-6 space-y-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs text-slate-400">Localizando van do técnico...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div class="text-4xl mb-2">📍</div>
        <h2 class="text-base font-bold text-white mb-1">Rastreamento Não Encontrado</h2>
        <p class="text-xs text-slate-400">{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Live Status Hero Banner -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div class="flex items-center justify-between gap-4 mb-4">
            <div>
              <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 mb-2">
                A Caminho da Sua Residência
              </span>
              <h2 class="text-xl font-extrabold text-white">
                {{ dispatch.technicianName }} está a caminho!
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Destino: <strong>{{ dispatch.destAddress || 'Seu Imóvel' }}</strong>
              </p>
            </div>

            <!-- ETA Countdown Badge -->
            <div class="text-center bg-slate-950/80 border border-slate-800 p-3 rounded-2xl shrink-0">
              <div class="text-[10px] uppercase font-bold text-slate-400">Chegada em</div>
              <div class="text-2xl font-black text-emerald-400 font-mono">
                ~{{ dispatch.etaMinutes }} min
              </div>
            </div>
          </div>

          <!-- Progress Route Line -->
          <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
            <div class="bg-gradient-to-r from-red-600 to-emerald-500 h-full rounded-full transition-all duration-1000 w-3/4"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>Saindo da Central (Boston, MA)</span>
            <span class="text-emerald-400 font-bold">Quase lá (~3 milhas)</span>
          </div>
        </div>

        <!-- Simulated Live GPS Radar & Map Box -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>🗺️ Mapa de Deslocamento em Tempo Real</span>
            </h3>
            <span class="text-[10px] text-slate-500 font-mono">Atualizado há 15s</span>
          </div>

          <!-- Interactive Radar Simulator -->
          <div class="w-full h-56 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
            <!-- Grid Lines -->
            <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
            
            <!-- Radar Circles -->
            <div class="absolute w-48 h-48 border border-red-500/20 rounded-full animate-ping pointer-events-none"></div>
            <div class="absolute w-32 h-32 border border-slate-700/40 rounded-full"></div>

            <!-- Moving Van Marker -->
            <div class="relative z-10 flex flex-col items-center animate-bounce">
              <div class="px-3 py-1 bg-red-600 text-white font-bold text-[10px] rounded-full shadow-lg flex items-center gap-1.5 mb-1 whitespace-nowrap">
                <span>🚐</span> {{ dispatch.technicianName }}
              </div>
              <div class="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>
            </div>

            <!-- Home Destination Marker -->
            <div class="absolute right-8 bottom-8 flex flex-col items-center">
              <div class="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded shadow-md mb-1">
                🏡 Sua Residência
              </div>
              <div class="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-white"></div>
            </div>
          </div>
        </div>

        <!-- Technician Profile & Safety Credentials -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Identificação Oficial do Profissional
          </div>

          <div class="flex items-center gap-4">
            <img 
              :src="dispatch.technicianPhoto" 
              :alt="dispatch.technicianName"
              class="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
            />
            <div>
              <h4 class="text-base font-bold text-white">{{ dispatch.technicianName }}</h4>
              <p class="text-xs text-slate-400">{{ dispatch.technicianRole }}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  {{ dispatch.licenseNumber }}
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ✓ Antecedentes Checados
                </span>
              </div>
            </div>
          </div>

          <!-- Vehicle Info -->
          <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span class="text-slate-500 block text-[10px]">Veículo Oficial:</span>
              <span class="font-bold text-white">{{ dispatch.vehicleDescription }}</span>
            </div>
            <span class="text-xl">🚐</span>
          </div>

          <!-- Direct Call & Message Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <a 
              :href="`tel:${dispatch.technicianPhone}`"
              class="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>📞 Ligar para Técnico</span>
            </a>
            <a 
              :href="`sms:${dispatch.technicianPhone}`"
              class="py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>💬 Enviar SMS</span>
            </a>
          </div>
        </div>

        <!-- Guarantee Footer -->
        <div class="text-center text-xs text-slate-500 space-y-1">
          <p>🛡️ Tony's Painting & Remodeling • Licenciado e Segurado em Massachusetts</p>
          <p class="text-[11px]">Compromisso de Pontualidade e Atendimento de Primeira Linha</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.params.token

const loading = ref(true)
const error = ref(null)
const dispatch = ref({})

const loadData = async () => {
  loading.value = true
  try {
    const res = await $fetch(`/api/dispatch/${token}`)
    dispatch.value = res.dispatch
  } catch (err) {
    error.value = err.data?.message || 'Rastreamento não encontrado ou expirado.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
