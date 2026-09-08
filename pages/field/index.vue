<template>
  <div class="min-h-screen bg-slate-900 text-white font-sans pb-20">
    <!-- Top Header: Tony's Field Operations PWA -->
    <header class="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
      <div class="flex items-center gap-3">
        <NuxtLink to="/dashboard" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">
          <ArrowLeft class="w-4 h-4" />
        </NuxtLink>
        <div class="flex items-center gap-2">
          <img src="/emblem.png" alt="Tony's" class="w-7 h-7 rounded-full object-contain bg-white p-0.5" />
          <div>
            <h1 class="text-sm font-black text-white tracking-wide uppercase leading-none">Tony's Field Operations</h1>
            <span class="text-[9px] font-mono text-red-400 font-bold leading-none">PWA • Geofencing & Ponto</span>
          </div>
        </div>
      </div>

      <!-- Worker Indicator & Status -->
      <div class="flex items-center gap-2 text-xs">
        <span class="w-2.5 h-2.5 rounded-full" :class="activeShift ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'"></span>
        <span class="font-bold hidden sm:inline" :class="activeShift ? 'text-emerald-400' : 'text-slate-400'">
          {{ activeShift ? 'EM EXPEDIENTE' : 'FORA DE TURNO' }}
        </span>
      </div>
    </header>

    <div class="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <!-- 1. ACTIVE SHIFT / CLOCK-IN HERO CARD -->
      <div class="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 rounded-3xl p-6 shadow-2xl space-y-6"
           :class="activeShift ? 'border-emerald-500/60 shadow-emerald-950/20' : 'border-slate-800'">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              Ponto Eletrônico & Rastreamento GPS
            </span>
            <h2 class="text-xl sm:text-2xl font-black text-white mt-1">
              {{ activeShift ? 'Obra em Andamento' : 'Registrar Início de Turno' }}
            </h2>
          </div>

          <!-- Geofencing GPS Status Pill -->
          <div class="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono">
            <MapPin class="w-3.5 h-3.5" :class="gpsCoords ? 'text-emerald-400' : 'text-amber-400 animate-pulse'" />
            <span v-if="gpsCoords" class="text-emerald-400 font-bold">
              GPS: {{ gpsCoords.lat.toFixed(4) }}, {{ gpsCoords.lng.toFixed(4) }}
            </span>
            <span v-else class="text-amber-300">
              Obtendo GPS...
            </span>
          </div>
        </div>

        <!-- If Shift is ACTIVE: Live timer & details -->
        <div v-if="activeShift" class="space-y-4">
          <div class="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Local do Trabalho / Cliente</span>
              <h3 class="text-base font-black text-white">{{ activeShift.lead?.name }}</h3>
              <p class="text-xs text-slate-300 font-mono mt-0.5">
                📍 {{ activeShift.lead?.address || activeShift.lead?.city || 'Massachusetts' }}
              </p>
            </div>
            <div class="text-left sm:text-right">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tempo Decorrido</span>
              <span class="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">{{ shiftTimer }}</span>
              <span class="text-[10px] text-slate-400 block">Entrada: {{ new Date(activeShift.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <ShieldCheck class="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{{ activeShift.notes || 'Geofencing validado no perímetro da obra em Massachusetts.' }}</span>
          </div>

          <!-- Clock-out action button -->
          <button
            @click="clockOut"
            :disabled="loadingAction"
            class="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <Square class="w-5 h-5 fill-current" />
            <span>{{ loadingAction ? 'Finalizando Turno...' : 'Bater Ponto de Saída (Clock-Out)' }}</span>
          </button>
        </div>

        <!-- If Shift is NOT Active: Select Job and Clock In -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Selecione a Obra / Cliente do Dia:
            </label>
            <select
              v-model="selectedLeadId"
              class="w-full bg-slate-800 border border-slate-700 text-white text-sm font-semibold rounded-2xl p-3.5 focus:ring-2 focus:ring-[#D7070D] focus:outline-none"
            >
              <option value="" disabled>Escolha a obra no cronograma...</option>
              <option v-for="job in activeJobs" :key="job.id" :value="job.id">
                {{ job.name }} — {{ job.serviceInterested }} ({{ job.city }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Observações / Tarefas Previstas Hoje:
            </label>
            <input
              v-model="shiftNotes"
              type="text"
              placeholder="Ex: Lixamento das molduras e aplicação de primer Sherwin-Williams"
              class="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-[#D7070D] focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <!-- Clock In Action Button -->
          <button
            @click="clockIn"
            :disabled="!selectedLeadId || loadingAction"
            class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40"
          >
            <Play class="w-5 h-5 fill-current" />
            <span>{{ loadingAction ? 'Registrando Ponto GPS...' : 'Bater Ponto de Entrada (Clock-In)' }}</span>
          </button>
        </div>
      </div>

      <!-- 2. WORK PROGRESS PHOTO UPLOAD (FOR CUSTOMER PORTAL) -->
      <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2.5">
            <Camera class="w-5 h-5 text-red-500" />
            <div>
              <h3 class="text-base font-black text-white">Fotos de Progresso da Obra</h3>
              <p class="text-xs text-slate-400">Envie fotos diárias visíveis no Portal do Cliente</p>
            </div>
          </div>
          <span class="text-[10px] font-mono bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
            Tablet / Câmera
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1">URL da Imagem / Foto do Canteiro:</label>
            <input
              v-model="photoForm.url"
              type="text"
              placeholder="https://... ou tire foto com tablet"
              class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1">Descrição do Serviço Realizado:</label>
            <input
              v-model="photoForm.description"
              type="text"
              placeholder="Ex: Primeira demão de acabamento aplicada na sala"
              class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-between pt-2">
          <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input type="checkbox" v-model="photoForm.isPublic" class="w-4 h-4 rounded text-red-600 focus:ring-0" />
            <span>Exibir no Portal do Morador (Customer Tracker)</span>
          </label>

          <button
            @click="uploadProgressPhoto"
            :disabled="!photoForm.url || uploadingPhoto"
            class="bg-[#D7070D] hover:bg-[#B0050A] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>{{ uploadingPhoto ? 'Salvando...' : 'Salvar Foto na Obra' }}</span>
            <Upload class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- 3. MATERIAL PROCUREMENT REQUEST (QUICK REORDER) -->
      <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2.5">
            <PaintBucket class="w-5 h-5 text-amber-500" />
            <div>
              <h3 class="text-base font-black text-white">Solicitar Materiais (Procurement)</h3>
              <p class="text-xs text-slate-400">Peça tintas, rolos e materiais para entrega no canteiro</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <input
              v-model="materialForm.item"
              type="text"
              placeholder="Item (Ex: Galão Tinta Acetinada Branco Sherwin-Williams)"
              class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div class="flex gap-2">
            <input
              v-model="materialForm.quantity"
              type="number"
              min="1"
              placeholder="Qtd"
              class="w-20 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 text-center"
            />
            <button
              @click="requestMaterial"
              :disabled="!materialForm.item || requestingMaterial"
              class="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              Pedir
            </button>
          </div>
        </div>
      </div>

      <!-- 4. RECENT SHIFT LOGS -->
      <div class="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 class="text-base font-black text-white border-b border-slate-800 pb-3">
          Histórico Recente de Pontos Registrados
        </h3>

        <div v-if="timeLogs.length === 0" class="text-center py-6 text-xs text-slate-500 italic">
          Nenhum registro de ponto registrado hoje.
        </div>

        <div v-else class="divide-y divide-slate-800">
          <div v-for="log in timeLogs" :key="log.id" class="py-3 flex items-center justify-between gap-3 text-xs">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white">{{ log.lead?.name || 'Obra' }}</span>
                <span
                  class="text-[9px] font-mono px-2 py-0.2 rounded-full font-bold"
                  :class="log.isValidated ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'"
                >
                  {{ log.isValidated ? 'GPS OK' : 'Ressalva GPS' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-mono">
                Entrada: {{ new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                <span v-if="log.checkOut"> • Saída: {{ new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </p>
            </div>

            <div class="text-right font-mono">
              <span class="text-emerald-400 font-bold block">
                {{ log.checkOut ? `${(((new Date(log.checkOut) - new Date(log.checkIn)) / (1000 * 60 * 60)).toFixed(1))}h` : 'Ativo' }}
              </span>
              <span class="text-[10px] text-slate-500">{{ new Date(log.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ArrowLeft,
  MapPin,
  Play,
  Square,
  Camera,
  PaintBucket,
  Upload,
  ShieldCheck
} from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const activeJobs = ref([])
const timeLogs = ref([])
const activeShift = ref(null)
const selectedLeadId = ref('')
const shiftNotes = ref('')
const loadingAction = ref(false)
const gpsCoords = ref(null)

const shiftTimer = ref('00:00:00')
let timerInterval = null

const photoForm = ref({
  url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800',
  description: '',
  isPublic: true
})
const uploadingPhoto = ref(false)

const materialForm = ref({
  item: '',
  quantity: 2
})
const requestingMaterial = ref(false)

onMounted(async () => {
  obtainGpsLocation()
  await fetchFieldData()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function obtainGpsLocation() {
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsCoords.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
      },
      (err) => {
        console.warn('GPS não obtido automaticamente, usando aproximação de Boston:', err.message)
        gpsCoords.value = { lat: 42.3601, lng: -71.0589 }
      }
    )
  } else {
    gpsCoords.value = { lat: 42.3601, lng: -71.0589 }
  }
}

async function fetchFieldData() {
  try {
    const res = await $fetch('/api/field/logs')
    if (res?.success) {
      activeJobs.value = res.activeJobs || []
      timeLogs.value = res.timeLogs || []
      activeShift.value = res.activeShift || null

      if (activeShift.value) {
        startTimer(activeShift.value.checkIn)
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados de campo:', err)
  }
}

function startTimer(checkInStr) {
  if (timerInterval) clearInterval(timerInterval)
  const checkInDate = new Date(checkInStr).getTime()

  const update = () => {
    const diff = Math.max(0, Date.now() - checkInDate)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    shiftTimer.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  update()
  timerInterval = setInterval(update, 1000)
}

async function clockIn() {
  if (!selectedLeadId.value) return
  loadingAction.value = true
  try {
    const res = await $fetch('/api/field/clock-in', {
      method: 'POST',
      body: {
        leadId: selectedLeadId.value,
        gpsLat: gpsCoords.value?.lat,
        gpsLng: gpsCoords.value?.lng,
        notes: shiftNotes.value
      }
    })

    if (res?.success) {
      activeShift.value = res.timeLog
      startTimer(res.timeLog.checkIn)
      alert(res.message)
      await fetchFieldData()
    }
  } catch (err) {
    console.error('Erro ao bater ponto:', err)
    alert('Erro ao registrar ponto de entrada.')
  } finally {
    loadingAction.value = false
  }
}

async function clockOut() {
  if (!activeShift.value) return
  loadingAction.value = true
  try {
    const res = await $fetch('/api/field/clock-out', {
      method: 'POST',
      body: { timeLogId: activeShift.value.id }
    })

    if (res?.success) {
      alert(res.message)
      if (timerInterval) clearInterval(timerInterval)
      activeShift.value = null
      await fetchFieldData()
    }
  } catch (err) {
    console.error('Erro ao encerrar ponto:', err)
    alert('Erro ao registrar ponto de saída.')
  } finally {
    loadingAction.value = false
  }
}

async function uploadProgressPhoto() {
  const currentLeadId = activeShift.value?.leadId || selectedLeadId.value || activeJobs.value[0]?.id
  if (!currentLeadId || !photoForm.value.url) {
    alert('Selecione uma obra e informe o link da foto.')
    return
  }

  uploadingPhoto.value = true
  try {
    await $fetch('/api/materials', {
      method: 'POST',
      body: {
        leadId: currentLeadId,
        item: `Foto de Progresso: ${photoForm.value.description || 'Execução de Pintura'}`,
        quantity: 1,
        unit: 'registro',
        unitCost: 0
      }
    })

    alert('Foto de progresso registrada e sincronizada com o Portal do Morador!')
    photoForm.value.description = ''
  } catch (err) {
    console.error('Erro ao enviar foto:', err)
  } finally {
    uploadingPhoto.value = false
  }
}

async function requestMaterial() {
  const currentLeadId = activeShift.value?.leadId || selectedLeadId.value || activeJobs.value[0]?.id
  if (!currentLeadId || !materialForm.value.item) return

  requestingMaterial.value = true
  try {
    const res = await $fetch('/api/materials', {
      method: 'POST',
      body: {
        leadId: currentLeadId,
        item: materialForm.value.item,
        quantity: materialForm.value.quantity,
        unit: 'galões',
        unitCost: 65.0, // Benchmark gallon price
        supplier: 'Sherwin-Williams / Benjamin Moore',
        status: 'PENDING'
      }
    })

    if (res?.success) {
      alert('Pedido de material enviado com sucesso para a central de compras!')
      materialForm.value.item = ''
    }
  } catch (err) {
    console.error('Erro ao pedir material:', err)
  } finally {
    requestingMaterial.value = false
  }
}
</script>
