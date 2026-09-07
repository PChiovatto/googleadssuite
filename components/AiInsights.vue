<template>
  <div class="bg-white rounded-2xl border border-purple-200/80 shadow-sm p-6 flex flex-col h-full">
    <!-- Header with Model Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-sm font-black text-xs">
          AI
        </div>
        <div>
          <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
            Omni-Agent Orchestrator
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Multi-Model
            </span>
          </h3>
          <p class="text-xs text-slate-500">Google Gemini • Anthropic Claude • OpenAI GPT-4o</p>
        </div>
      </div>

      <!-- Agent Switcher Tabs -->
      <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
        <button
          v-for="agent in agentList"
          :key="agent.id"
          @click="selectAgent(agent.id)"
          class="px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
          :class="currentAgent === agent.id ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
        >
          <span>{{ agent.icon }}</span>
          <span>{{ agent.name }}</span>
        </button>
      </div>
    </div>

    <!-- Agent Context Description -->
    <div class="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
      <div>
        <span class="font-bold text-slate-800">{{ activeAgentMeta.title }}:</span>
        <span class="text-slate-600 ml-1.5">{{ activeAgentMeta.description }}</span>
      </div>
      <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold shrink-0">
        {{ activeAgentMeta.modelTag }}
      </span>
    </div>

    <!-- Action Buttons Based on Selected Agent -->
    <!-- 1. CLAUDE 3.5 SONNET STRATEGY -->
    <div v-if="currentAgent === 'CLAUDE'" class="grid grid-cols-2 gap-2 mb-4">
      <button
        @click="runClaudeStrategy('AUDIT')"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-purple-50/60 border-purple-200 text-purple-900 hover:bg-purple-100/70"
      >
        <span>📊</span> ROAS & Traffic Audit
      </button>
      <button
        @click="runClaudeStrategy('COPYWRITING')"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-purple-50/60 border-purple-200 text-purple-900 hover:bg-purple-100/70"
      >
        <span>✍️</span> Generate US Ad Copies
      </button>
    </div>

    <!-- 2. GEMINI 1.5 FLASH TRIAGE -->
    <div v-else-if="currentAgent === 'GEMINI'" class="grid grid-cols-2 gap-2 mb-4">
      <button
        @click="runGeminiTriage()"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100/70"
      >
        <span>⚡</span> Triage Latest Lead
      </button>
      <button
        @click="runGeminiTriage({ keyword: 'urgent exterior painting', city: 'Cambridge', state: 'MA' })"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100/70"
      >
        <span>🔥</span> Simulate Urgent Lead Triage
      </button>
    </div>

    <!-- 3. GPT-4O SMS RE-ENGAGEMENT -->
    <div v-else-if="currentAgent === 'GPT4O'" class="grid grid-cols-2 gap-2 mb-4">
      <button
        @click="runGPT4oFollowup(false)"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70"
      >
        <span>💬</span> Draft TCPA Re-engagement
      </button>
      <button
        @click="runGPT4oFollowup(true)"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70"
      >
        <span>📲</span> Draft & Simulate Twilio SMS
      </button>
    </div>

    <!-- 4. DALL-E 3 IMAGE GENERATOR -->
    <div v-else-if="currentAgent === 'DALLE'" class="flex items-center gap-2 mb-4">
      <input
        v-model="dallePrompt"
        type="text"
        placeholder="e.g. Modern painted kitchen cabinets in Newton MA..."
        @keyup.enter="runDallERender"
        class="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
      />
      <button
        @click="runDallERender"
        :disabled="loading"
        class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
      >
        Generate Hero
      </button>
    </div>

    <!-- 5. WHISPER + GEMINI PRO AUDIT -->
    <div v-else-if="currentAgent === 'AUDIT'" class="grid grid-cols-2 gap-2 mb-4">
      <button
        @click="runCallAudit()"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-blue-50/60 border-blue-200 text-blue-900 hover:bg-blue-100/70"
      >
        <span>🎙️</span> Audit Sample Call
      </button>
      <button
        @click="runVoiceAgentTest()"
        :disabled="loading"
        class="text-xs font-semibold py-2 px-3 rounded-xl border transition-all text-left flex items-center gap-2 bg-blue-50/60 border-blue-200 text-blue-900 hover:bg-blue-100/70"
      >
        <span>🤖</span> Test OpenAI Realtime Voice
      </button>
    </div>

    <!-- Output Container -->
    <div class="flex-1 bg-slate-50 rounded-xl p-4 overflow-y-auto border border-slate-200/70 min-h-[340px] relative">
      <!-- Loading State -->
      <div v-if="loading" class="h-full flex flex-col items-center justify-center text-center p-6">
        <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-xs font-semibold text-slate-700">Dispatching to {{ activeAgentMeta.name }}...</p>
        <p class="text-[11px] text-slate-400 mt-1">Processing multi-agent reasoning and schema formatting</p>
      </div>

      <!-- Result View -->
      <div v-else-if="outputData" class="space-y-3 text-xs">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <span class="font-mono text-[11px] text-purple-700 font-bold">
            Model: {{ outputData.modelUsed || activeAgentMeta.modelTag }}
          </span>
          <button
            @click="copyOutput"
            class="text-[11px] text-slate-600 hover:text-purple-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs font-medium"
          >
            <span>{{ copied ? 'Copiado!' : 'Copiar JSON/Texto' }}</span>
          </button>
        </div>

        <!-- Rendered Image if DALL-E -->
        <div v-if="outputData.imageUrl" class="space-y-2">
          <img :src="outputData.imageUrl" alt="Generated Visual" class="w-full rounded-lg shadow-md max-h-64 object-cover" />
          <p class="text-[11px] text-slate-500 italic">{{ outputData.revisedPrompt || outputData.prompt }}</p>
        </div>

        <!-- Rendered Structured Triage -->
        <div v-else-if="outputData.priority" class="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900">Lead Urgency: {{ outputData.urgency }}</span>
            <span
              class="px-2 py-0.5 rounded-full font-black text-[11px]"
              :class="outputData.priority === 'HOT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'"
            >
              {{ outputData.priority }} (Score: {{ outputData.score }}/10)
            </span>
          </div>
          <p class="text-slate-700">{{ outputData.intent }}</p>
          <div class="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-950">
            <span class="font-bold block mb-1">Recommended Opening Hook:</span>
            <p class="italic text-[11px]">"{{ outputData.suggestedScript }}"</p>
          </div>
        </div>

        <!-- Rendered Structured Strategy -->
        <div v-else-if="outputData.summary" class="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
          <h4 class="font-bold text-slate-900 text-sm">{{ outputData.summary }}</h4>
          <ul v-if="outputData.findings" class="space-y-1.5 list-disc list-inside text-slate-700">
            <li v-for="(finding, i) in outputData.findings" :key="i">{{ finding }}</li>
          </ul>
          
          <div v-if="outputData.negativeKeywordsRecommended" class="pt-2">
            <span class="font-bold text-red-600 block mb-1">Negative Keywords Recommended:</span>
            <div class="flex flex-wrap gap-1">
              <span v-for="neg in outputData.negativeKeywordsRecommended" :key="neg" class="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-mono border border-red-200">
                -{{ neg }}
              </span>
            </div>
          </div>
        </div>

        <!-- Rendered Follow-up SMS/Email -->
        <div v-else-if="outputData.smsMessage" class="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
          <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
            <span class="font-bold block mb-1">📱 Generated SMS (TCPA Compliant):</span>
            <p class="text-xs">{{ outputData.smsMessage }}</p>
          </div>
          <div v-if="outputData.emailSubject" class="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-950">
            <span class="font-bold block mb-1">✉️ Email Subject: {{ outputData.emailSubject }}</span>
            <div class="text-[11px] mt-1" v-html="outputData.emailBodyHtml"></div>
          </div>
        </div>

        <!-- Fallback Raw View -->
        <pre v-else class="text-[11px] text-slate-800 whitespace-pre-wrap font-mono">{{ JSON.stringify(outputData, null, 2) }}</pre>
      </div>

      <!-- Empty State -->
      <div v-else class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <Sparkles class="w-10 h-10 mb-2 stroke-[1.5] text-purple-300" />
        <p class="text-xs font-semibold text-slate-700">Select an action to invoke {{ activeAgentMeta.name }}</p>
        <p class="text-[11px] text-slate-400 max-w-xs mt-1">
          The Omni-Agent layer dynamically routes to the highest-performing model for strategy, triage, and follow-ups.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Sparkles } from 'lucide-vue-next'

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  }
})

const currentAgent = ref('CLAUDE')
const loading = ref(false)
const outputData = ref(null)
const copied = ref(false)
const dallePrompt = ref('Historic colonial house in Boston MA, newly painted exterior, sunny morning')

const agentList = [
  { id: 'CLAUDE', name: 'Claude 3.5 Sonnet', icon: '🧠' },
  { id: 'GEMINI', name: 'Gemini Flash', icon: '⚡' },
  { id: 'GPT4O', name: 'GPT-4o SMS', icon: '💬' },
  { id: 'AUDIT', name: 'Whisper + Pro', icon: '🎙️' },
  { id: 'DALLE', name: 'DALL-E 3', icon: '🎨' }
]

const activeAgentMeta = computed(() => {
  switch (currentAgent.value) {
    case 'CLAUDE':
      return {
        name: 'Anthropic Claude 3.5 Sonnet',
        title: 'Ads Strategy & Copy',
        description: 'ROAS optimization, traffic analytics, and high-converting ad copy.',
        modelTag: 'claude-3-5-sonnet'
      }
    case 'GEMINI':
      return {
        name: 'Google Gemini 1.5 Flash',
        title: 'Lead Triage & Urgency',
        description: 'Sub-second classification, urgency scoring, and smart routing.',
        modelTag: 'gemini-1.5-flash'
      }
    case 'GPT4O':
      return {
        name: 'OpenAI GPT-4o',
        title: 'Cold Lead Re-engagement',
        description: 'Hyper-personalized SMS follow-ups and email nurture sequences.',
        modelTag: 'gpt-4o'
      }
    case 'AUDIT':
      return {
        name: 'Whisper + Gemini 1.5 Pro',
        title: 'Call Quality Auditor',
        description: 'Speech-to-text, objection detection, and TCPA compliance audits.',
        modelTag: 'whisper-1 + gemini-1.5-pro'
      }
    case 'DALLE':
      return {
        name: 'OpenAI DALL-E 3',
        title: 'Dynamic Hero Graphics',
        description: 'Search intent matching visuals for dynamic landing pages.',
        modelTag: 'dall-e-3'
      }
    default:
      return { name: 'AI Engine', title: 'Consultant', description: '', modelTag: 'multi-agent' }
  }
})

function selectAgent(id) {
  currentAgent.value = id
  outputData.value = null
}

async function runClaudeStrategy(type = 'AUDIT') {
  loading.value = true
  try {
    const res = await $fetch('/api/ai/strategy', {
      method: 'POST',
      body: { campaigns: props.campaigns, type }
    })
    outputData.value = res.strategy
  } catch (err) {
    console.error('Error in Claude strategy:', err)
  } finally {
    loading.value = false
  }
}

async function runGeminiTriage(sampleLead = null) {
  loading.value = true
  try {
    const res = await $fetch('/api/ai/triage', {
      method: 'POST',
      body: sampleLead ? { lead: sampleLead } : {}
    })
    outputData.value = res.triage
  } catch (err) {
    console.error('Error in Gemini triage:', err)
  } finally {
    loading.value = false
  }
}

async function runGPT4oFollowup(dispatch = false) {
  loading.value = true
  try {
    const res = await $fetch('/api/ai/followup', {
      method: 'POST',
      body: { dispatchTwilio: dispatch }
    })
    outputData.value = res.followup
  } catch (err) {
    console.error('Error in GPT-4o followup:', err)
  } finally {
    loading.value = false
  }
}

async function runDallERender() {
  loading.value = true
  try {
    const res = await $fetch('/api/ai/render', {
      method: 'POST',
      body: { prompt: dallePrompt.value }
    })
    outputData.value = res.render
  } catch (err) {
    console.error('Error in DALL-E render:', err)
  } finally {
    loading.value = false
  }
}

async function runCallAudit() {
  loading.value = true
  try {
    const res = await $fetch('/api/ai/audit', {
      method: 'POST',
      body: {}
    })
    outputData.value = res.audit
  } catch (err) {
    console.error('Error in call audit:', err)
  } finally {
    loading.value = false
  }
}

async function runVoiceAgentTest() {
  loading.value = true
  try {
    const res = await $fetch('/api/ai/voice-agent', {
      method: 'POST',
      body: { callerPhone: '+16175550198' }
    })
    outputData.value = {
      modelUsed: 'openai-realtime-voice',
      summary: `Voice AI Assistant Call Completed (Status: ${res.status})`,
      findings: [
        `Greeting: "${res.script.greeting}"`,
        `Qualifying questions asked: ${res.script.qualifyingQuestions.join(' | ')}`,
        `Outcome: ${res.script.closing}`
      ]
    }
  } catch (err) {
    console.error('Error in voice agent:', err)
  } finally {
    loading.value = false
  }
}

async function copyOutput() {
  if (!outputData.value) return
  await navigator.clipboard.writeText(JSON.stringify(outputData.value, null, 2))
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
