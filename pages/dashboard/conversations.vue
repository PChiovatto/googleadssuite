<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col space-y-4">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          💬 Unified Conversations Hub (Omnichannel)
        </h1>
        <p class="text-xs text-slate-400">
          Caixa de entrada unificada estilo GoHighLevel: SMS (Twilio), E-mails (SES), Gravações de Chamadas e Notas Internas numa só linha do tempo.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="simulateMissedCall"
          :disabled="simulatingMctb"
          class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-2 transition shadow-lg shadow-amber-950/30"
        >
          <span v-if="simulatingMctb" class="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
          <span>⚡ Simular Chamada Perdida (MCTB + IA)</span>
        </button>
      </div>
    </div>

    <!-- Main Split-Pane Container -->
    <div class="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex shadow-2xl">
      <!-- Left Sidebar: Leads / Contacts List -->
      <div class="w-80 border-r border-slate-800 flex flex-col bg-slate-950/50 shrink-0">
        <!-- Search bar -->
        <div class="p-3 border-b border-slate-800">
          <input 
            v-model="searchTerm"
            type="text" 
            placeholder="Buscar por nome, telefone ou cidade..."
            class="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <!-- Leads Scrollable List -->
        <div class="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          <div 
            v-for="lead in filteredLeads" 
            :key="lead.id"
            @click="selectLead(lead.id)"
            :class="[
              'p-3.5 transition cursor-pointer flex items-start gap-3 select-none',
              selectedLeadId === lead.id ? 'bg-slate-800/80 border-l-4 border-red-500' : 'hover:bg-slate-800/30'
            ]"
          >
            <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0 border border-slate-700">
              {{ getInitials(lead.name) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <span class="font-bold text-xs text-white truncate">{{ lead.name }}</span>
                <span v-if="lead.mctbStatus === 'ENGAGED'" class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                  MCTB
                </span>
              </div>
              <div class="text-[11px] text-slate-400 truncate">{{ lead.serviceInterested || 'Pintura Residencial' }}</div>
              <div class="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                <span>📍 {{ lead.city || 'MA' }}</span>
                <span>📞 {{ lead.phone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center & Right: Unified Chat & Timeline -->
      <div class="flex-1 flex flex-col bg-slate-900 min-w-0">
        <!-- Selected Lead Header -->
        <div v-if="selectedLead" class="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-black text-white text-sm shadow-md">
              {{ getInitials(selectedLead.name) }}
            </div>
            <div>
              <div class="font-bold text-sm text-white flex items-center gap-2">
                {{ selectedLead.name }}
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono font-normal">
                  {{ selectedLead.status }}
                </span>
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-3">
                <span>📱 {{ selectedLead.phone }}</span>
                <span v-if="selectedLead.email">✉️ {{ selectedLead.email }}</span>
                <span>📍 {{ selectedLead.address || selectedLead.city || 'Newton, MA' }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <NuxtLink 
              to="/dashboard/estimates" 
              class="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs border border-red-500/30 transition"
            >
              📄 Criar Orçamento (Good/Better/Best)
            </NuxtLink>
            <NuxtLink 
              :to="`/dashboard/leads`"
              class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Abrir no CRM ↗
            </NuxtLink>
          </div>
        </div>

        <!-- Chat Stream Scrollable Area -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="timeline.length === 0" class="text-center py-16 text-slate-500 text-xs">
            Nenhuma mensagem ou chamada registrada ainda para este contato.
          </div>

          <div 
            v-for="msg in timeline" 
            :key="msg.id"
            :class="[
              'flex flex-col max-w-xl',
              msg.direction === 'OUTBOUND' ? 'ml-auto items-end' : 'mr-auto items-start'
            ]"
          >
            <!-- Badge of Type & Sender -->
            <div class="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
              <span v-if="msg.type === 'SMS'" class="text-emerald-400 font-bold">💬 SMS (Twilio)</span>
              <span v-else-if="msg.type === 'EMAIL'" class="text-blue-400 font-bold">✉️ E-mail (SES)</span>
              <span v-else-if="msg.type === 'CALL_RECORDING'" class="text-amber-400 font-bold">📞 Ligação Gravada</span>
              <span v-else-if="msg.type === 'INTERNAL_NOTE'" class="text-purple-400 font-bold">🔒 Nota Interna</span>
              
              <span v-if="msg.aiGenerated" class="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-mono text-[9px]">
                🤖 IA Gemini
              </span>
              <span>• {{ formatTime(msg.createdAt) }}</span>
            </div>

            <!-- Message Bubble -->
            <div 
              :class="[
                'p-4 rounded-2xl text-xs leading-relaxed shadow-md',
                msg.type === 'INTERNAL_NOTE' 
                  ? 'bg-purple-950/40 border border-purple-800/40 text-purple-200'
                  : msg.type === 'CALL_RECORDING'
                    ? 'bg-amber-950/30 border border-amber-800/40 text-amber-200 w-full'
                    : msg.direction === 'OUTBOUND'
                      ? 'bg-red-600 text-white rounded-tr-sm'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
              ]"
            >
              <!-- Subject if Email -->
              <div v-if="msg.subject" class="font-bold text-white mb-1 pb-1 border-b border-white/20">
                Assunto: {{ msg.subject }}
              </div>

              <!-- Body Text -->
              <p class="whitespace-pre-wrap">{{ msg.body }}</p>

              <!-- Audio Player if Call Recording -->
              <div v-if="msg.type === 'CALL_RECORDING' && msg.audioUrl" class="mt-3 pt-2 border-t border-amber-800/40 flex items-center gap-2">
                <audio controls class="w-full h-8 rounded opacity-80" :src="msg.audioUrl"></audio>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar & Input -->
        <div class="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <!-- Channel Switcher & AI Smart Reply -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button 
                @click="selectedChannel = 'SMS'"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
                  selectedChannel === 'SMS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                ]"
              >
                <span>💬 SMS</span>
              </button>
              <button 
                @click="selectedChannel = 'EMAIL'"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
                  selectedChannel === 'EMAIL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                ]"
              >
                <span>✉️ E-mail</span>
              </button>
              <button 
                @click="selectedChannel = 'INTERNAL_NOTE'"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
                  selectedChannel === 'INTERNAL_NOTE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                ]"
              >
                <span>🔒 Nota Interna</span>
              </button>
            </div>

            <!-- AI Smart Reply Button -->
            <button 
              @click="getAiSuggestion"
              :disabled="loadingAi"
              class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span v-if="loadingAi" class="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
              <span>✨ Sugestão IA (Gemini)</span>
            </button>
          </div>

          <!-- Text Input Form -->
          <div class="flex items-end gap-3">
            <textarea 
              v-model="newMessage"
              @keydown.enter.exact.prevent="sendMessage"
              rows="2"
              :placeholder="getPlaceholder"
              class="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
            ></textarea>

            <button 
              @click="sendMessage"
              :disabled="sending || !newMessage.trim()"
              class="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition disabled:opacity-50"
            >
              {{ sending ? 'Enviando...' : 'Enviar ↗' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const leads = ref([])
const selectedLeadId = ref(null)
const selectedLead = ref(null)
const timeline = ref([])
const searchTerm = ref('')
const selectedChannel = ref('SMS')
const newMessage = ref('')
const sending = ref(false)
const loadingAi = ref(false)
const simulatingMctb = ref(false)
const chatContainer = ref(null)

const loadData = async (targetId = null) => {
  try {
    const url = targetId ? `/api/conversations/messages?leadId=${targetId}` : '/api/conversations/messages'
    const res = await $fetch(url)
    leads.value = res.leads || []
    selectedLead.value = res.selectedLead
    selectedLeadId.value = res.selectedLead?.id || null
    timeline.value = res.timeline || []
    scrollToBottom()
  } catch (err) {
    console.error('Erro ao carregar mensagens:', err)
  }
}

const selectLead = (id) => {
  selectedLeadId.value = id
  loadData(id)
}

const filteredLeads = computed(() => {
  if (!searchTerm.value.trim()) return leads.value
  const q = searchTerm.value.toLowerCase()
  return leads.value.filter(l => 
    l.name?.toLowerCase().includes(q) || 
    l.phone?.includes(q) || 
    l.city?.toLowerCase().includes(q)
  )
})

const getPlaceholder = computed(() => {
  if (selectedChannel.value === 'SMS') return 'Escreva um SMS para enviar via Twilio (pressione Enter para enviar)...'
  if (selectedChannel.value === 'EMAIL') return 'Escreva um e-mail corporativo para enviar via Amazon SES...'
  return 'Escreva uma nota interna visível apenas para a equipe...'
})

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedLeadId.value) return
  sending.value = true
  try {
    await $fetch('/api/conversations/send', {
      method: 'POST',
      body: {
        leadId: selectedLeadId.value,
        channel: selectedChannel.value,
        message: newMessage.value.trim()
      }
    })
    newMessage.value = ''
    await loadData(selectedLeadId.value)
  } catch (err) {
    alert(err.data?.message || 'Erro ao enviar mensagem')
  } finally {
    sending.value = false
  }
}

const getAiSuggestion = async () => {
  if (!selectedLeadId.value) return
  loadingAi.value = true
  try {
    const res = await $fetch('/api/conversations/ai-suggest', {
      method: 'POST',
      body: { leadId: selectedLeadId.value }
    })
    newMessage.value = res.suggestion
  } catch (err) {
    console.error('Erro na sugestão de IA:', err)
  } finally {
    loadingAi.value = false
  }
}

const simulateMissedCall = async () => {
  simulatingMctb.value = true
  try {
    const res = await $fetch('/api/mctb/simulate', {
      method: 'POST',
      body: {
        phone: '+1 (617) 555-0198',
        customerName: 'Cliente Simulação Boston'
      }
    })
    await loadData(res.leadId)
    alert(`⚡ Simulação Concluída!\n\n1. Chamada perdida detectada.\n2. SMS enviado em 5s.\n3. Cliente respondeu.\n4. IA Gemini respondeu e registrou no funil!`)
  } catch (err) {
    alert('Erro ao simular MCTB: ' + err.message)
  } finally {
    simulatingMctb.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const getInitials = (name) => {
  if (!name) return 'L'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadData()
})
</script>
