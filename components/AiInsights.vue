<template>
  <div class="bg-white rounded-2xl border border-purple-200/80 shadow-sm p-6 flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-purple-100 mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Sparkles class="w-5 h-5" />
        </div>
        <div>
          <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
            Consultor Gemini Ads
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              AI Powered
            </span>
          </h3>
          <p class="text-xs text-slate-500">Otimização autônoma de campanhas, lances e copies</p>
        </div>
      </div>

      <span
        class="text-xs px-2.5 py-1 rounded-full font-medium"
        :class="isLiveAi ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
      >
        {{ isLiveAi ? '● Gemini 2.5 Conectado' : '● Modo Estratégico Local' }}
      </span>
    </div>

    <!-- Quick Action Presets -->
    <div class="grid grid-cols-2 gap-2 mb-4">
      <button
        @click="runAnalysis('AUDIT')"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2"
        :class="activePreset === 'AUDIT' ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50/50'"
      >
        <span>📊</span> Auditoria Completa
      </button>

      <button
        @click="runAnalysis('BID_OPTIMIZATION')"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2"
        :class="activePreset === 'BID_OPTIMIZATION' ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50/50'"
      >
        <span>📈</span> Otimizar Lances & ROAS
      </button>

      <button
        @click="runAnalysis('COPYWRITING')"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2"
        :class="activePreset === 'COPYWRITING' ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50/50'"
      >
        <span>✍️</span> Gerar Copies & Headlines
      </button>

      <button
        @click="runAnalysis('NEGATIVE_KEYWORDS')"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2"
        :class="activePreset === 'NEGATIVE_KEYWORDS' ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-purple-50/50'"
      >
        <span>🛡️</span> Palavras Negativas
      </button>
    </div>

    <!-- Custom Query Bar -->
    <div class="flex items-center gap-2 mb-4">
      <input
        v-model="customQuery"
        type="text"
        placeholder="Faça uma pergunta específica para a IA..."
        @keyup.enter="runAnalysis('CUSTOM')"
        class="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
      />
      <button
        @click="runAnalysis('CUSTOM')"
        :disabled="loading"
        class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
      >
        <Send class="w-3.5 h-3.5" />
        <span>Perguntar</span>
      </button>
    </div>

    <!-- Output Container -->
    <div class="flex-1 bg-slate-50 rounded-xl p-4 overflow-y-auto border border-slate-200/70 min-h-[350px] relative">
      <!-- Loading State -->
      <div v-if="loading" class="h-full flex flex-col items-center justify-center text-center p-6">
        <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-xs font-semibold text-slate-700">O Gemini está analisando suas métricas...</p>
        <p class="text-[11px] text-slate-400 mt-1">Calculando ROAS, gaps de conversão e elaborando recomendações</p>
      </div>

      <!-- Result View -->
      <div v-else-if="recommendation" class="space-y-2">
        <div class="flex justify-end mb-2">
          <button
            @click="copyToClipboard"
            class="text-[11px] text-slate-500 hover:text-purple-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Check v-if="copied" class="w-3 h-3 text-emerald-600" />
            <Copy v-else class="w-3 h-3" />
            <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
          </button>
        </div>

        <div class="prose prose-xs max-w-none text-slate-800 leading-relaxed space-y-2" v-html="renderedMarkdown" />
      </div>

      <!-- Empty State -->
      <div v-else class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <Bot class="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
        <p class="text-xs font-medium text-slate-600">Selecione uma ação acima para consultar a IA</p>
        <p class="text-[11px] text-slate-400 max-w-xs mt-1">
          A IA analisa as métricas de custo, cliques e conversões das suas campanhas para sugerir melhorias práticas imediatas.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Sparkles, Send, Bot, Copy, Check } from 'lucide-vue-next'
import { marked } from 'marked'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  }
})

const loading = ref(false)
const recommendation = ref('')
const isLiveAi = ref(false)
const activePreset = ref('AUDIT')
const customQuery = ref('')
const copied = ref(false)

const renderedMarkdown = computed(() => {
  if (!recommendation.value) return ''
  return marked.parse(recommendation.value)
})

async function runAnalysis(type = 'AUDIT') {
  activePreset.value = type
  loading.value = true

  try {
    const payload = {
      metrics: props.campaigns,
      promptType: type === 'CUSTOM' ? 'AUDIT' : type,
      customQuestion: type === 'CUSTOM' ? customQuery.value : undefined
    }

    const res = await $fetch('/api/ai/analyze', {
      method: 'POST',
      body: payload
    })

    if (res.success) {
      recommendation.value = res.recommendation
      isLiveAi.value = res.isLiveAi
    }
  } catch (error) {
    recommendation.value = 'Erro ao consultar a IA. Por favor verifique sua conexão.'
  } finally {
    loading.value = false
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(recommendation.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Falha ao copiar:', err)
  }
}

// Auto-run initial audit when mounted if campaigns exist
onMounted(() => {
  if (props.campaigns && props.campaigns.length > 0) {
    runAnalysis('AUDIT')
  }
})
</script>
