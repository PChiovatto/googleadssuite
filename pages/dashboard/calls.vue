<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
          <span>📞</span>
          <span>Central VoIP & Auditoria de Chamadas (Twilio + Gemini AI)</span>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Discador & Gravações Telefônicas</h1>
        <p class="text-xs text-slate-500">
          Chamadas originadas via código local americano com transcrição e análise de sentimento automática pelo Gemini.
        </p>
      </div>

      <!-- Action Button -->
      <button
        @click="simulateCall"
        :disabled="calling"
        class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
      >
        <PhoneCall class="w-4 h-4" :class="{ 'animate-bounce': calling }" />
        <span>{{ calling ? 'Ligando...' : 'Simular Ligação VoIP' }}</span>
      </button>
    </div>

    <!-- Calls List & Gemini AI Transcripts -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Histórico de Gravações & Resumos da IA
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
                <span class="font-bold text-slate-900 text-sm block">Consultor: {{ call.agentName || 'John Miller' }}</span>
                <span class="text-[10px] text-slate-400">Duração: {{ Math.floor(call.durationSeconds / 60) }}m {{ call.durationSeconds % 60 }}s • {{ new Date(call.createdAt).toLocaleString('pt-BR') }}</span>
              </div>
            </div>

            <!-- Sentiment Badge -->
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider self-start sm:self-auto"
              :class="call.sentiment === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
            >
              Sentimento: {{ call.sentiment }}
            </span>
          </div>

          <!-- AI Transcript Summary Box -->
          <div class="bg-white rounded-lg p-3 border border-slate-200 text-slate-800 space-y-1">
            <span class="text-[10px] uppercase font-bold text-purple-700 tracking-wider flex items-center gap-1">
              <span>✨</span>
              <span>Transcrição & Resumo Gemini AI:</span>
            </span>
            <p class="leading-relaxed font-medium text-xs">
              {{ call.aiTranscript }}
            </p>
          </div>
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
        agentName: 'John Miller',
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

onMounted(() => {
  fetchCalls()
})
</script>
