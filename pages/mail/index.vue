<template>
  <div class="h-[calc(100vh-130px)] flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
    <!-- Top Action Bar (Gmail Style) -->
    <div class="p-3.5 border-b border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">📫</span>
          <div>
            <h1 class="text-sm font-black text-slate-900 leading-tight">Webmail Corporativo In-App</h1>
            <span class="text-[10px] text-slate-500 font-mono">
              {{ currentUser?.email || 'carregando...' }} ({{ currentUser?.role === 'MANAGER' ? 'Gestor' : 'Consultor' }})
            </span>
          </div>
        </div>

        <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          Amazon SES Cloud
        </span>
      </div>

      <!-- Search Input -->
      <div class="flex-1 max-w-md mx-2">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="fetchEmails"
            type="text"
            placeholder="Pesquisar e-mails por cliente, assunto ou texto..."
            class="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
          <span class="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Simulate Inbound Email Button -->
        <button
          @click="simulateInboundEmail"
          :disabled="simulatingInbound"
          class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
          title="Simular recebimento de e-mail de cliente via webhook do Amazon SES"
        >
          <span>📥</span>
          <span>{{ simulatingInbound ? 'Recebendo...' : 'Simular Recebimento' }}</span>
        </button>

        <button
          @click="fetchEmails"
          class="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Atualizar Caixa de Entrada"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- Main Workspace Split: Sidebar + List + Reader -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 1. Left Folders Sidebar -->
      <div class="w-56 bg-slate-50/50 border-r border-slate-200/80 p-3 flex flex-col justify-between shrink-0">
        <div class="space-y-4">
          <!-- Compose Button -->
          <button
            @click="openComposeModal"
            class="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>✏️</span>
            <span>ESCREVER E-MAIL</span>
          </button>

          <!-- Folders Navigation -->
          <nav class="space-y-1 text-xs font-semibold">
            <button
              @click="setFolder('INBOX')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'INBOX' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80' : 'text-slate-600 hover:bg-slate-100'"
            >
              <div class="flex items-center gap-2">
                <span>📥</span>
                <span>Entrada</span>
              </div>
              <span v-if="stats.inboxUnread > 0" class="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-600 text-white">
                {{ stats.inboxUnread }}
              </span>
            </button>

            <button
              @click="setFolder('STARRED')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'STARRED' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80' : 'text-slate-600 hover:bg-slate-100'"
            >
              <div class="flex items-center gap-2">
                <span>⭐</span>
                <span>Com Estrela</span>
              </div>
              <span class="text-slate-400 text-[10px] font-mono">{{ stats.starredTotal }}</span>
            </button>

            <button
              @click="setFolder('SENT')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'SENT' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80' : 'text-slate-600 hover:bg-slate-100'"
            >
              <div class="flex items-center gap-2">
                <span>📤</span>
                <span>Enviados</span>
              </div>
              <span class="text-slate-400 text-[10px] font-mono">{{ stats.sentTotal }}</span>
            </button>

            <button
              @click="setFolder('TRASH')"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left"
              :class="activeFolder === 'TRASH' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80' : 'text-slate-600 hover:bg-slate-100'"
            >
              <div class="flex items-center gap-2">
                <span>🗑️</span>
                <span>Lixeira</span>
              </div>
            </button>
          </nav>
        </div>

        <!-- Infrastructure Status Card -->
        <div class="p-3 bg-white rounded-xl border border-slate-200 text-[10px] space-y-1.5 shadow-2xs">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span>Amazon SES</span>
            <span class="text-emerald-600 flex items-center gap-1">● Ativo</span>
          </div>
          <p class="text-slate-500 leading-tight">
            Envio e recebimento corporativo com IP aquecido e taxa de entrega 99.8%.
          </p>
        </div>
      </div>

      <!-- 2. Middle Email List Pane -->
      <div class="w-80 sm:w-96 border-r border-slate-200 overflow-y-auto shrink-0 divide-y divide-slate-100 bg-white">
        <div v-if="loading" class="p-8 text-center text-xs text-slate-400">
          Carregando mensagens...
        </div>

        <div v-else-if="emails.length === 0" class="p-12 text-center text-xs text-slate-400 italic">
          Nenhum e-mail nesta pasta.
        </div>

        <div
          v-for="mail in emails"
          :key="mail.id"
          @click="selectEmail(mail)"
          class="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors space-y-1.5 relative border-l-3"
          :class="[
            selectedEmail?.id === mail.id ? 'bg-blue-50/70 border-l-blue-600' : 'border-l-transparent',
            !mail.read ? 'bg-slate-50/40 font-bold' : ''
          ]"
        >
          <div class="flex items-center justify-between gap-1 text-[11px]">
            <div class="flex items-center gap-1.5 truncate">
              <button
                @click.stop="toggleStar(mail)"
                class="text-sm transition-transform active:scale-125"
                :class="mail.starred ? 'text-amber-400' : 'text-slate-300 hover:text-slate-400'"
              >
                ★
              </button>
              <span class="font-extrabold truncate" :class="!mail.read ? 'text-slate-900' : 'text-slate-700'">
                {{ mail.direction === 'OUTBOUND' ? 'Para: ' + mail.to : mail.from }}
              </span>
            </div>
            <span class="text-[10px] text-slate-400 shrink-0 font-mono">
              {{ new Date(mail.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
            </span>
          </div>

          <p class="text-xs text-slate-800 truncate" :class="!mail.read ? 'font-bold' : 'font-medium'">
            {{ mail.subject }}
          </p>

          <div class="flex items-center justify-between text-[10px] text-slate-500">
            <span v-if="mail.lead" class="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold truncate max-w-[170px]">
              👤 {{ mail.lead.name }} ({{ mail.lead.status }})
            </span>
            <span v-else class="text-slate-400 italic">Contato Avulso</span>

            <span v-if="!mail.read" class="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>
        </div>
      </div>

      <!-- 3. Right Email Reader Pane -->
      <div class="flex-1 overflow-y-auto bg-slate-50/30 p-6">
        <div v-if="!selectedEmail" class="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
          <span class="text-4xl">📬</span>
          <p class="text-xs font-semibold">Selecione um e-mail para ler o conteúdo e acessar o contexto comercial do lead.</p>
        </div>

        <div v-else class="max-w-3xl mx-auto space-y-5">
          <!-- Reader Top Header -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {{ selectedEmail.subject }}
                </h2>
                <div class="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                  <span class="font-bold">{{ selectedEmail.from }}</span>
                  <span class="text-slate-400">para</span>
                  <span class="font-mono text-slate-700">{{ selectedEmail.to }}</span>
                </div>
              </div>

              <div class="text-right shrink-0">
                <span class="text-[11px] text-slate-400 font-mono block">
                  {{ new Date(selectedEmail.createdAt).toLocaleString('en-US') }}
                </span>
                <span class="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full" :class="selectedEmail.direction === 'INBOUND' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'">
                  {{ selectedEmail.direction === 'INBOUND' ? 'Recebido' : 'Enviado' }}
                </span>
              </div>
            </div>

            <!-- Linked Lead Context Card -->
            <div v-if="selectedEmail.lead" class="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-black text-white text-sm">{{ selectedEmail.lead.name }}</span>
                  <span class="text-[9px] bg-white/20 text-white px-2 py-0.2 rounded-full font-bold uppercase">
                    {{ selectedEmail.lead.status }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-300">
                  {{ selectedEmail.lead.serviceInterested || 'Pintura' }} • 📍 {{ selectedEmail.lead.city || 'MA' }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <NuxtLink
                  to="/dashboard/leads"
                  class="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Abrir no Funil CRM →
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Email Content Body -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed" v-html="selectedEmail.body">
          </div>

          <!-- Quick Reply Box -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <span class="text-xs text-slate-600 font-medium">Deseja responder a este e-mail?</span>
            <button
              @click="replyToCurrentEmail"
              class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>↩️</span>
              <span>Responder E-mail</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Compose Modal with GPT-4o Copilot -->
    <div
      v-if="showCompose"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="showCompose = false"
    >
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">✍️</span>
            <h3 class="text-sm font-black text-slate-900">Novo E-mail Corporativo (Amazon SES)</h3>
          </div>
          <button @click="showCompose = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <!-- AI Copilot Prompt Bar -->
        <div class="p-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-purple-900 flex items-center gap-1.5">
              <span>✨</span>
              <span>Copiloto de Redação IA (GPT-4o)</span>
            </span>
            <span class="text-[9px] text-purple-600 font-bold">1-Click Drafting</span>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <button
              @click="applyAiPreset('quote')"
              type="button"
              class="bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 px-2 py-1 rounded-lg text-[10px] font-bold shadow-2xs"
            >
              📝 Proposta Comercial & Prep Work
            </button>
            <button
              @click="applyAiPreset('estimate')"
              type="button"
              class="bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 px-2 py-1 rounded-lg text-[10px] font-bold shadow-2xs"
            >
              📅 Agendar In-Home Estimate
            </button>
            <button
              @click="applyAiPreset('discount')"
              type="button"
              class="bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 px-2 py-1 rounded-lg text-[10px] font-bold shadow-2xs"
            >
              🏷️ Oferecer 5% Desconto à Vista
            </button>
          </div>
        </div>

        <!-- Compose Form -->
        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Para (Destinatário) *:</label>
            <input
              v-model="composeForm.to"
              type="email"
              placeholder="ex: cliente@gmail.com"
              class="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Assunto *:</label>
            <input
              v-model="composeForm.subject"
              type="text"
              placeholder="Ex: First Boston Painters - Orçamento de Pintura e Escopo"
              class="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Conteúdo do E-mail (HTML) *:</label>
            <textarea
              v-model="composeForm.bodyHtml"
              rows="8"
              class="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-sans text-xs"
              placeholder="Digite o texto ou use o Copiloto IA acima..."
            ></textarea>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-100">
          <span class="text-[10px] text-slate-400">
            Enviado de: {{ currentUser?.email }} via Amazon SES
          </span>

          <div class="flex items-center gap-2">
            <button
              @click="showCompose = false"
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Descartar
            </button>
            <button
              @click="sendEmail"
              :disabled="!composeForm.to || !composeForm.subject || !composeForm.bodyHtml || sending"
              class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>{{ sending ? 'Enviando via Amazon SES...' : 'Enviar E-mail' }}</span>
              <span>🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

const { currentUser, isManager, isConsultant, fetchAuth } = useWorkspaceAuth()

const emails = ref([])
const stats = ref({ inboxTotal: 0, inboxUnread: 0, sentTotal: 0, starredTotal: 0 })
const activeFolder = ref('INBOX')
const searchQuery = ref('')
const selectedEmail = ref(null)
const loading = ref(false)
const showCompose = ref(false)
const sending = ref(false)
const simulatingInbound = ref(false)

const composeForm = ref({
  to: '',
  subject: '',
  bodyHtml: '',
  leadId: null
})

async function fetchEmails() {
  loading.value = true
  try {
    const res = await $fetch('/api/mail', {
      query: {
        folder: activeFolder.value,
        search: searchQuery.value
      }
    })

    if (res.success) {
      emails.value = res.emails
      stats.value = res.stats
      if (emails.value.length > 0 && !selectedEmail.value) {
        selectedEmail.value = emails.value[0]
      }
    }
  } catch (err) {
    console.error('Erro ao buscar e-mails:', err)
  } finally {
    loading.value = false
  }
}

function setFolder(folder) {
  activeFolder.value = folder
  selectedEmail.value = null
  fetchEmails()
}

async function selectEmail(mail) {
  selectedEmail.value = mail
  if (!mail.read) {
    mail.read = true
    await $fetch('/api/mail/mark-read', {
      method: 'POST',
      body: { emailId: mail.id, read: true }
    })
    stats.value.inboxUnread = Math.max(0, stats.value.inboxUnread - 1)
  }
}

async function toggleStar(mail) {
  mail.starred = !mail.starred
  await $fetch('/api/mail/mark-read', {
    method: 'POST',
    body: { emailId: mail.id, starred: mail.starred }
  })
  stats.value.starredTotal = emails.value.filter(e => e.starred).length
}

function openComposeModal() {
  composeForm.value = {
    to: '',
    subject: '',
    bodyHtml: '',
    leadId: null
  }
  showCompose.value = true
}

function replyToCurrentEmail() {
  if (!selectedEmail.value) return
  composeForm.value = {
    to: selectedEmail.value.from,
    subject: `Re: ${selectedEmail.value.subject}`,
    bodyHtml: `<br><br><hr><p style="color:#666; font-size:11px;">Em ${new Date(selectedEmail.value.createdAt).toLocaleString()}, ${selectedEmail.value.from} escreveu:</p>${selectedEmail.value.body}`,
    leadId: selectedEmail.value.leadId
  }
  showCompose.value = true
}

function applyAiPreset(type) {
  if (type === 'quote') {
    composeForm.value.subject = 'First Boston Painters: Proposal & Prep Specifications'
    composeForm.value.bodyHtml = `<p>Hi there,</p>
<p>Thank you for considering First Boston Painters and Services. Our team has reviewed your project requirements and we have prepared a comprehensive estimate covering:</p>
<ul>
  <li><strong>Preparation Perfection:</strong> Full power wash, loose paint scraping, and 50-year elastomeric caulking.</li>
  <li><strong>Premium Priming:</strong> Oil-based primer on all bare wood for maximum Massachusetts weather resistance.</li>
  <li><strong>Finish Coats:</strong> Two coats of premium 100% acrylic latex paint.</li>
  <li><strong>Massachusetts Legal Deposit:</strong> Initial deposit limited to 1/3 as mandated by law.</li>
</ul>
<p>Would you like to schedule a quick 10-minute call today to go over the numbers?</p>
<p>Warmly,<br>${currentUser.value?.name || 'Estimator'}<br>First Boston Painters & Services Corp.<br>MA HIC #198421</p>`
  } else if (type === 'estimate') {
    composeForm.value.subject = 'Free In-Home Estimate Confirmation - First Boston Painters'
    composeForm.value.bodyHtml = `<p>Hello,</p>
<p>We are delighted to confirm your free on-site estimate. Our senior estimator will visit your property to evaluate surfaces and provide an immediate written scope of work.</p>
<p>Please let us know if Thursday morning at 10:00 AM works well for you.</p>
<p>Best regards,<br>${currentUser.value?.name || 'Estimator'}</p>`
  } else if (type === 'discount') {
    composeForm.value.subject = 'Special Offer: 5% Cash/Prompt Payment Discount on Your Painting Project'
    composeForm.value.bodyHtml = `<p>Hello,</p>
<p>We noticed you are reviewing our proposal. If you are ready to secure your work slot this month, we can offer an exclusive <strong>5% prompt payment courtesy discount</strong> on the overall project amount.</p>
<p>Reply to this email or call (617) 555-0199 to claim this special term.</p>
<p>Sincerely,<br>${currentUser.value?.name || 'Estimator'}</p>`
  }
}

async function sendEmail() {
  if (!composeForm.value.to || !composeForm.value.subject || !composeForm.value.bodyHtml) return
  sending.value = true

  try {
    const res = await $fetch('/api/mail/send', {
      method: 'POST',
      body: {
        ...composeForm.value,
        userId: currentUser.value?.id
      }
    })

    if (res.success) {
      showCompose.value = false
      alert(res.message || 'E-mail enviado com sucesso via Amazon SES!')
      await fetchEmails()
    } else {
      alert(res.message || 'Erro ao enviar e-mail.')
    }
  } catch (err) {
    alert('Falha de conexão com o Amazon SES.')
  } finally {
    sending.value = false
  }
}

async function simulateInboundEmail() {
  simulatingInbound.value = true
  try {
    const res = await $fetch('/api/mail/inbound', {
      method: 'POST',
      body: {
        from: 'homeowner.newton@gmail.com',
        to: currentUser.value?.email || 'john@bostonpaintersandservices.com',
        subject: 'Aceite de Orçamento: Podemos começar na próxima semana?',
        body: '<p>Olá Marcos e equipe! Gostamos muito do escopo de trabalho com primer a óleo e da garantia de 5 anos. Podemos assinar o contrato digital hoje para iniciar os trabalhos na próxima semana?</p><p>Abraços,<br>David Miller (Newton MA)</p>'
      }
    })

    if (res.success) {
      alert(res.message)
      await fetchEmails()
    }
  } catch (err) {
    alert('Erro ao simular recebimento de e-mail.')
  } finally {
    simulatingInbound.value = false
  }
}

onMounted(async () => {
  await fetchAuth()
  await fetchEmails()
})
</script>
