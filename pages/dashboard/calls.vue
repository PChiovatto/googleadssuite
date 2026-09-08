<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
          <span>📞</span>
          <span>Central VoIP US • Twilio + OpenAI Realtime + Gemini Pro</span>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Discador & Gravações Telefônicas</h1>
        <p class="text-xs text-slate-500">
          Chamadas telefônicas VoIP com gravação automática, transcrição via Whisper e auditoria de negociação com Gemini Pro.
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
          <span>Testar Voice AI (Realtime)</span>
        </button>

        <button
          @click="simulateCall"
          :disabled="calling"
          class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <PhoneCall class="w-4 h-4" :class="{ 'animate-bounce': calling }" />
          <span>{{ calling ? 'Ligando...' : 'Simular Ligação VoIP' }}</span>
        </button>
      </div>
    </div>

    <!-- Calls List & Gemini AI Transcripts -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
        <span>Histórico de Gravações & Auditorias de Vendas</span>
        <span class="text-xs text-slate-500 font-normal">{{ calls.length }} ligações gravadas</span>
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
                <span class="font-bold text-slate-900 text-sm block">Consultor: {{ call.agentName || 'Tony Silva (Owner & GM)' }}</span>
                <span class="text-[10px] text-slate-400">Duração: {{ Math.floor(call.durationSeconds / 60) }}m {{ call.durationSeconds % 60 }}s • {{ new Date(call.createdAt).toLocaleString('pt-BR') }}</span>
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
                <span>Auditoria Profunda</span>
              </button>
            </div>
          </div>

          <!-- AI Transcript Summary Box -->
          <div class="bg-white rounded-lg p-3.5 border border-slate-200 text-slate-800 space-y-1">
            <span class="text-[10px] uppercase font-bold text-purple-700 tracking-wider flex items-center gap-1">
              <span>🎙️</span>
              <span>Resumo Gemini Pro / Whisper:</span>
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
              <h3 class="text-base font-black text-slate-900">Auditoria de Negociação & TCPA</h3>
              <p class="text-[11px] text-slate-400">Processado com Whisper-1 + Gemini 1.5 Pro</p>
            </div>
          </div>
          <button @click="selectedAudit = null" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Compliance & Sentiment Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Conformidade TCPA</span>
              <span class="font-bold text-emerald-600 flex items-center gap-1">
                <span>✓</span> Gravado e Informado
              </span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Nota de Quebra de Objeção</span>
              <span class="font-black text-purple-700 text-sm">
                {{ selectedAudit.objectionHandlingScore || 9 }}/10
              </span>
            </div>
          </div>

          <!-- Transcript -->
          <div>
            <span class="font-bold text-slate-800 block mb-1">Transcrição Completa da Chamada (Whisper):</span>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {{ selectedAudit.transcription }}
            </div>
          </div>

          <!-- Coaching Tips -->
          <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
            <span class="font-bold block mb-1">💡 Dicas de Coaching para o Consultor:</span>
            <ul class="list-disc list-inside space-y-1 text-[11px]">
              <li v-for="(tip, i) in (selectedAudit.coachingTips || [])" :key="i">{{ tip }}</li>
            </ul>
          </div>

          <!-- Next Steps -->
          <div class="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
            <span class="font-bold block mb-1">🎯 Próximo Passo Recomendado:</span>
            <p class="text-[11px]">{{ selectedAudit.nextSteps }}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 text-right">
          <button
            @click="selectedAudit = null"
            class="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Fechar Auditoria
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
        aiTranscript: 'Cliente confirmou interesse na restauração de deck e pintura externa de casa de 2 andares em Newton, MA. Muito satisfeito com a rapidez do primeiro contato (menos de 2 minutos). Visita de medição agendada.',
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
    alert(`Voice AI acionado! Status: ${res.status}. Roteando chamada para estimador principal.`)
    await fetchCalls()
  } catch (err) {
    alert('Falha ao acionar Voice AI.')
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
    alert('Erro ao carregar auditoria profunda.')
  }
}

onMounted(() => {
  fetchCalls()
})
</script>
