<template>
  <div class="space-y-6">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Walkthrough Calendar & Dispatch</h1>
          <span class="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Twilio SMS Active</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Schedule and manage on-site walkthroughs (In-Home Estimates) with automated Twilio SMS confirmation and reminders.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="showScheduleModal = true"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
        >
          <span>📅</span>
          <span>Schedule Walkthrough</span>
        </button>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <span class="text-[11px] font-semibold uppercase text-slate-500">Total Walkthroughs</span>
        <div class="text-2xl font-black text-slate-900 mt-1">{{ stats.total || 0 }}</div>
        <span class="text-[10px] text-slate-400">Scheduled estimates</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs bg-blue-50/20">
        <span class="text-[11px] font-semibold uppercase text-blue-600">Confirmed</span>
        <div class="text-2xl font-black text-blue-700 mt-1">{{ stats.confirmed || 0 }}</div>
        <span class="text-[10px] text-blue-500">Client confirmed arrival</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs bg-emerald-50/20">
        <span class="text-[11px] font-semibold uppercase text-emerald-600">Completed</span>
        <div class="text-2xl font-black text-emerald-700 mt-1">{{ stats.completed || 0 }}</div>
        <span class="text-[10px] text-emerald-500">Estimates delivered</span>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-amber-100 shadow-xs bg-amber-50/20">
        <span class="text-[11px] font-semibold uppercase text-amber-600">Pending Reminder</span>
        <div class="text-2xl font-black text-amber-700 mt-1">{{ stats.scheduled || 0 }}</div>
        <span class="text-[10px] text-amber-500">Upcoming appointments</span>
      </div>
    </div>

    <!-- Appointments Table & Feed -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900">Massachusetts Walkthrough Schedule</h2>
        <span class="text-xs text-slate-500">Showing {{ appointments.length }} appointments</span>
      </div>

      <div v-if="appointments.length === 0" class="p-12 text-center text-slate-400 text-xs italic">
        No walkthroughs scheduled at this time.
      </div>

      <div v-else class="divide-y divide-slate-100 overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="py-3 px-4">Date & Time</th>
              <th class="py-3 px-4">Client / Lead</th>
              <th class="py-3 px-4">Walkthrough Address</th>
              <th class="py-3 px-4">Scope / Service</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
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
                <div class="text-[11px] text-slate-500 font-mono">{{ app.lead?.phone || 'No phone provided' }}</div>
              </td>

              <td class="py-3.5 px-4 max-w-xs truncate">
                <span class="text-slate-700 font-medium">📍 {{ app.address || (app.lead?.city + ', MA') }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                  {{ app.lead?.serviceInterested || 'Painting' }}
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
                  <option value="SCHEDULED">● Scheduled</option>
                  <option value="CONFIRMED">✔ Confirmed</option>
                  <option value="COMPLETED">🏆 Completed</option>
                  <option value="CANCELLED">✖ Cancelled</option>
                  <option value="NO_SHOW">⚠️ No-Show</option>
                </select>
              </td>

              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <span v-if="app.reminderSent" class="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    SMS Sent
                  </span>
                  <a
                    v-if="app.lead?.phone"
                    :href="`tel:${app.lead?.phone}`"
                    class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                    title="Call Client"
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
          <h3 class="text-sm font-bold text-slate-900">Schedule In-Home Walkthrough</h3>
          <button @click="showScheduleModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Select Client / Lead:</label>
            <select
              v-model="newApp.leadId"
              class="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Choose a contact...</option>
              <option v-for="l in leadsList" :key="l.id" :value="l.id">
                {{ l.name }} ({{ l.phone || l.city || 'No phone' }}) - {{ l.serviceInterested }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Date:</label>
              <input
                v-model="newApp.date"
                type="date"
                class="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Time:</label>
              <input
                v-model="newApp.time"
                type="time"
                class="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Walkthrough Address (MA):</label>
            <input
              v-model="newApp.address"
              type="text"
              placeholder="e.g. 45 Commonwealth Ave, Boston, MA"
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
              Send immediate Twilio SMS confirmation to client
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            @click="showScheduleModal = false"
            class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            @click="createAppointment"
            :disabled="!newApp.leadId || !newApp.date || submitting"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl disabled:opacity-50"
          >
            {{ submitting ? 'Scheduling...' : 'Confirm & Notify' }}
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
    console.error('Error fetching calendar:', err)
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
    alert('Error updating appointment status')
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
    alert('Failed to schedule walkthrough.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAppointments()
  fetchLeads()
})
</script>
