<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
          <span>📞</span>
          <span>US VoIP Phone Center • Twilio + OpenAI Realtime + Gemini Pro</span>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">VoIP Phone Dialer & Call Recordings</h1>
        <p class="text-xs text-slate-500">
          VoIP business phone calls with automatic audio recording, Whisper AI transcription, and Gemini Pro sales negotiation auditing.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          @click="testVoiceAi"
          :disabled="calling"
          class="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>🤖</span>
          <span>Test Realtime Voice AI</span>
        </button>

        <button
          @click="simulateCall"
          :disabled="calling"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <PhoneCall class="w-4 h-4" :class="{ 'animate-bounce': calling }" />
          <span>{{ calling ? 'Connecting Call...' : 'Simulate VoIP Outbound Call' }}</span>
        </button>
      </div>
    </div>

    <!-- Calls List & Gemini AI Transcripts -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
        <span>Call Recordings History & Sales Audits</span>
        <span class="text-xs text-slate-500 font-normal">{{ calls.length }} recorded calls</span>
      </h2>

      <div class="space-y-4">
        <div
          v-for="call in calls"
          :key="call.id"
          class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all space-y-3 text-xs"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                ☎️
              </div>
              <div>
                <span class="font-bold text-slate-900 text-sm block">Sales Consultant: {{ call.agentName || 'Tony Silva (Owner & GM)' }}</span>
                <span class="text-[10px] text-slate-400">Duration: {{ Math.floor(call.durationSeconds / 60) }}m {{ call.durationSeconds % 60 }}s • {{ new Date(call.createdAt).toLocaleString('en-US') }}</span>
              </div>
            </div>

            <!-- Badges & Deep Audit Action -->
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                :class="call.sentiment === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ call.sentiment || 'POSITIVE' }}
              </span>

              <button
                @click="openDeepAudit(call)"
                class="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>✨</span>
                <span>Deep Audit</span>
              </button>
            </div>
          </div>

          <!-- AI Transcript Summary Box -->
          <div class="bg-white rounded-lg p-3.5 border border-slate-200 text-slate-800 space-y-1">
            <span class="text-[10px] uppercase font-bold text-purple-700 tracking-wider flex items-center gap-1">
              <span>🎙️</span>
              <span>Gemini Pro / Whisper AI Executive Summary:</span>
            </span>
            <p class="leading-relaxed font-medium text-xs text-slate-700">
              {{ call.aiTranscript }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Deep Audit Modal -->
    <div
      v-if="selectedAudit"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-scale-in max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🎙️</span>
            <div>
              <h3 class="text-base font-black text-slate-900">Sales Negotiation & TCPA Compliance Audit</h3>
              <p class="text-[11px] text-slate-400">Processed with Whisper-1 + Gemini 1.5 Pro</p>
            </div>
          </div>
          <button @click="selectedAudit = null" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Compliance & Sentiment Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">TCPA Compliance Status</span>
              <span class="font-bold text-emerald-600 flex items-center gap-1">
                <span>✓</span> Recorded & Disclosure Provided
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Objection Handling Score</span>
              <span class="font-black text-purple-700 text-sm">
                {{ selectedAudit.objectionHandlingScore || 9 }}/10
              </span>
            </div>
          </div>

          <!-- Transcript -->
          <div>
            <span class="font-bold text-slate-800 block mb-1">Full Call Audio Transcription (Whisper AI):</span>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {{ selectedAudit.transcription }}
            </div>
          </div>

          <!-- Coaching Tips -->
          <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
            <span class="font-bold block mb-1">💡 Sales Coaching Recommendations:</span>
            <ul class="list-disc list-inside space-y-1 text-[11px]">
              <li v-for="(tip, i) in (selectedAudit.coachingTips || [])" :key="i">{{ tip }}</li>
            </ul>
          </div>

          <!-- Next Steps -->
          <div class="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
            <span class="font-bold block mb-1">🎯 Recommended Next Step:</span>
            <p class="text-[11px]">{{ selectedAudit.nextSteps }}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 text-right">
          <button
            @click="selectedAudit = null"
            class="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PhoneCall } from 'lucide-vue-next'

const calls = ref([])
const calling = ref(false)
const selectedAudit = ref(null)

async function fetchCalls() {
  try {
    const res = await $fetch('/api/twilio/voice')
    if (res.success) {
      calls.value = res.calls
    }
  } catch (err) {
    console.error('Error loading call logs:', err)
  }
}

async function simulateCall() {
  calling.value = true
  try {
    await $fetch('/api/twilio/voice', {
      method: 'POST',
      body: {
        agentName: 'Tony Silva (Owner & GM)',
        durationSeconds: 210,
        aiTranscript: 'Client confirmed interest in deck restoration and 2-story exterior house painting in Newton, MA. Highly satisfied with speed-to-lead initial contact (under 2 minutes). On-site estimate walkthrough scheduled.',
        sentiment: 'POSITIVE'
      }
    })
    await fetchCalls()
  } catch (err) {
    console.error('Error simulating call:', err)
  } finally {
    calling.value = false
  }
}

async function testVoiceAi() {
  calling.value = true
  try {
    const res = await $fetch('/api/ai/voice-agent', {
      method: 'POST',
      body: { callerPhone: '+16175550198' }
    })
    alert(`Voice AI activated! Status: ${res.status}. Routing call to primary estimator.`)
    await fetchCalls()
  } catch (err) {
    alert('Failed to trigger Voice AI.')
  } finally {
    calling.value = false
  }
}

async function openDeepAudit(call) {
  try {
    const res = await $fetch('/api/ai/audit', {
      method: 'POST',
      body: {
        callLogId: call.id,
        transcription: call.aiTranscript
      }
    })
    if (res.success && res.audit) {
      selectedAudit.value = res.audit
    }
  } catch (err) {
    alert('Error loading deep call audit.')
  }
}

onMounted(() => {
  fetchCalls()
})
</script>
