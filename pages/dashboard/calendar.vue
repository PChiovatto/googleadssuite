<template>
  <div class="space-y-6">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Agendamento Inteligente & Dispatch</h1>
          <span class="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Twilio SMS Active</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Controle de visitas presenciais para orçamentos (In-Home Estimates) com confirmação e lembretes automáticos via SMS.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="showScheduleModal = true"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>📅</span>
          <span>Novo Agendamento</span>
        </button>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-semibold uppercase text-slate-500">Total de Visitas</span>
        <div class="text-2xl font-black text-slate-900 mt-1">{{ stats.total || 0 }}</div>
        <span class="text-[10px] text-slate-400">Estimates agendados</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs bg-blue-50/20">
        <span class="text-[11px] font-semibold uppercase text-blue-600">Confirmadas</span>
        <div class="text-2xl font-black text-blue-700 mt-1">{{ stats.confirmed || 0 }}</div>
        <span class="text-[10px] text-blue-500">Cliente confirmou presença</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs bg-emerald-50/20">
        <span class="text-[11px] font-semibold uppercase text-emerald-600">Concluídas</span>
        <div class="text-2xl font-black text-emerald-700 mt-1">{{ stats.completed || 0 }}</div>
        <span class="text-[10px] text-emerald-500">Vistorias realizadas</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-amber-100 shadow-xs bg-amber-50/20">
        <span class="text-[11px] font-semibold uppercase text-amber-600">Aguardando Lembrete</span>
        <div class="text-2xl font-black text-amber-700 mt-1">{{ stats.scheduled || 0 }}</div>
        <span class="text-[10px] text-amber-500">Próximos dias</span>
      </div>
    </div>

    <!-- Appointments Table & Feed -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900">Agenda de Vistorias em Massachusetts</h2>
        <span class="text-xs text-slate-500">Exibindo {{ appointments.length }} compromissos</span>
      </div>

      <div v-if="appointments.length === 0" class="p-12 text-center text-slate-400 text-xs italic">
        Nenhuma visita agendada no momento.
      </div>

      <div v-else class="divide-y divide-slate-100 overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="py-3 px-4">Data & Horário</th>
              <th class="py-3 px-4">Cliente / Lead</th>
              <th class="py-3 px-4">Endereço da Visita</th>
              <th class="py-3 px-4">Serviço</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="app in appointments" :key="app.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="font-black text-slate-900 text-xs">
                  {{ new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}
                </div>
                <div class="text-[11px] text-blue-600 font-bold mt-0.5">
                  🕒 {{ new Date(app.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }} ({{ app.durationMinutes }}m)
                </div>
              </td>

              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900">{{ app.lead?.name }}</div>
                <div class="text-[11px] text-slate-500 font-mono">{{ app.lead?.phone || 'Sem telefone' }}</div>
              </td>

              <td class="py-3.5 px-4 max-w-xs truncate">
                <span class="text-slate-700 font-medium">📍 {{ app.address || (app.lead?.city + ', MA') }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                  {{ app.lead?.serviceInterested || 'Pintura' }}
                </span>
              </td>

              <td class="py-3.5 px-4">
                <select
                  :value="app.status"
                  @change="updateStatus(app.id, $event.target.value)"
                  class="text-[10px] font-bold py-1 px-2 rounded-lg border cursor-pointer"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': app.status === 'CONFIRMED' || app.status === 'COMPLETED',
                    'bg-blue-50 text-blue-700 border-blue-200': app.status === 'SCHEDULED',
                    'bg-rose-50 text-rose-700 border-rose-200': app.status === 'CANCELLED' || app.status === 'NO_SHOW'
                  }"
                >
                  <option value="SCHEDULED">● Agendada</option>
                  <option value="CONFIRMED">✔ Confirmada</option>
                  <option value="COMPLETED">🏆 Concluída</option>
                  <option value="CANCELLED">✖ Cancelada</option>
                  <option value="NO_SHOW">⚠️ No-Show</option>
                </select>
              </td>

              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <span v-if="app.reminderSent" class="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    SMS Enviado
                  </span>
                  <a
                    v-if="app.lead?.phone"
                    :href="`tel:${app.lead?.phone}`"
                    class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                    title="Ligar para Cliente"
                  >
                    📞
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="showScheduleModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Agendar In-Home Estimate</h3>
          <button @click="showScheduleModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Selecione o Lead:</label>
            <select
              v-model="newApp.leadId"
              class="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Escolha um contato...</option>
              <option v-for="l in leadsList" :key="l.id" :value="l.id">
                {{ l.name }} ({{ l.phone || l.city || 'Sem fone' }}) - {{ l.serviceInterested }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Data:</label>
              <input
                v-model="newApp.date"
                type="date"
                class="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Horário:</label>
              <input
                v-model="newApp.time"
                type="time"
                class="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Endereço da Visita (MA):</label>
            <input
              v-model="newApp.address"
              type="text"
              placeholder="Ex: 45 Commonwealth Ave, Boston, MA"
              class="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
            />
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              v-model="newApp.sendSms"
              id="sendSmsOpt"
              type="checkbox"
              class="rounded text-blue-600 focus:ring-blue-500"
            />
            <label for="sendSmsOpt" class="text-slate-600 cursor-pointer">
              Disparar SMS de confirmação imediato para o cliente via Twilio
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            @click="showScheduleModal = false"
            class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancelar
          </button>
          <button
            @click="createAppointment"
            :disabled="!newApp.leadId || !newApp.date || submitting"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-50"
          >
            {{ submitting ? 'Agendando...' : 'Confirmar & Notificar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const appointments = ref([])
const stats = ref({})
const leadsList = ref([])
const showScheduleModal = ref(false)
const submitting = ref(false)

const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const newApp = ref({
  leadId: '',
  date: tomorrowStr,
  time: '10:00',
  address: '',
  sendSms: true
})

async function fetchAppointments() {
  try {
    const res = await $fetch('/api/calendar')
    if (res.success) {
      appointments.value = res.appointments
      stats.value = res.stats
    }
  } catch (err) {
    console.error('Erro ao buscar agenda:', err)
  }
}

async function fetchLeads() {
  try {
    const res = await $fetch('/api/leads')
    if (res.success) {
      leadsList.value = res.leads
    }
  } catch (err) {}
}

async function updateStatus(appointmentId, status) {
  try {
    await $fetch('/api/calendar/update', {
      method: 'POST',
      body: { appointmentId, status }
    })
    await fetchAppointments()
  } catch (err) {
    alert('Erro ao atualizar status do agendamento')
  }
}

async function createAppointment() {
  if (!newApp.value.leadId || !newApp.value.date) return
  submitting.value = true

  try {
    const dateTimeStr = `${newApp.value.date}T${newApp.value.time || '10:00'}:00`
    const res = await $fetch('/api/calendar/schedule', {
      method: 'POST',
      body: {
        leadId: newApp.value.leadId,
        date: dateTimeStr,
        address: newApp.value.address,
        sendSms: newApp.value.sendSms
      }
    })

    if (res.success) {
      showScheduleModal.value = false
      await fetchAppointments()
      alert(res.message)
    }
  } catch (err) {
    alert('Falha ao agendar visita.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAppointments()
  fetchLeads()
})
</script>
