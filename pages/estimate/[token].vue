<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 selection:bg-red-600 selection:text-white">
    <!-- Top Header Branded -->
    <header class="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-red-600/30">
            T
          </div>
          <div>
            <h1 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Tony's Painting & Remodeling
              <span class="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-medium border border-red-500/30">MA HIC #192847</span>
            </h1>
            <p class="text-xs text-slate-400">Proposta Comercial Interativa Oficial</p>
          </div>
        </div>

        <div class="hidden sm:flex items-center gap-4 text-xs text-slate-400">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Depósito Travado em 1/3 (Lei MA)</span>
          <a href="tel:+16175550199" class="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
            📞 +1 (617) 555-0199
          </a>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-6xl mx-auto px-4 pt-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-400 text-sm">Carregando sua estimativa interativa...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto text-center py-16 px-6 bg-slate-900 border border-red-500/30 rounded-2xl">
        <div class="text-4xl mb-3">⚠️</div>
        <h2 class="text-xl font-bold text-white mb-2">Orçamento Não Encontrado</h2>
        <p class="text-slate-400 text-sm mb-6">{{ error }}</p>
        <a href="/" class="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition">Voltar ao Início</a>
      </div>

      <!-- Content -->
      <div v-else class="space-y-8">
        <!-- Success Banner if already accepted -->
        <div v-if="estimate.status === 'ACCEPTED'" class="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold shrink-0">
            ✓
          </div>
          <div>
            <h2 class="text-lg font-bold text-emerald-300">Proposta Aprovada & Assinada!</h2>
            <p class="text-sm text-emerald-200/80">
              Assinado por <strong class="text-white">{{ estimate.signerName }}</strong> em {{ formatDate(estimate.signedAt) }}.
              Contrato MA HIC gerado com depósito inicial de <strong class="text-white">${{ estimate.depositAmount.toLocaleString() }}</strong>.
            </p>
          </div>
        </div>

        <!-- Project Hero Card -->
        <div class="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span class="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 mb-3">
                Estimativa Customizada
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                {{ estimate.title }}
              </h2>
              <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
                <span>👤 <strong>Cliente:</strong> {{ estimate.lead?.name }}</span>
                <span>📍 <strong>Local:</strong> {{ estimate.lead?.address || estimate.lead?.city || 'Greater Boston, MA' }}</span>
                <span>🎨 <strong>Serviço:</strong> {{ estimate.lead?.serviceInterested || 'Pintura Residencial' }}</span>
              </div>
            </div>

            <div class="text-left md:text-right bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div class="text-xs text-slate-400 mb-1">Total Selecionado (com extras):</div>
              <div class="text-3xl sm:text-4xl font-black text-white text-emerald-400">
                ${{ computedTotal.toLocaleString() }}
              </div>
              <div class="text-xs text-slate-400 mt-1">
                Sinal de 1/3 (Lei MA): <strong class="text-white">${{ computedDeposit.toLocaleString() }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 1: Good / Better / Best Package Selection -->
        <div>
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-white tracking-tight">Passo 1: Escolha o Pacote Ideal para Sua Casa</h3>
            <p class="text-sm text-slate-400">Selecione uma das 3 opções transparentes de acabamento e garantia</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Tier 1: Good (Bronze) -->
            <div 
              @click="selectedTier = 'GOOD'"
              :class="[
                'rounded-3xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between',
                selectedTier === 'GOOD' 
                  ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/50 shadow-xl shadow-red-950/30' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
              ]"
            >
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Opção Essencial</div>
                <h4 class="text-xl font-black text-white mb-2">{{ estimate.goodTitle }}</h4>
                <div class="text-3xl font-black text-white mb-4">
                  ${{ estimate.goodPrice.toLocaleString() }}
                </div>
                <div class="text-xs text-slate-400 mb-6 pb-6 border-b border-slate-800 leading-relaxed">
                  {{ estimate.goodScope }}
                </div>
                <ul class="text-xs text-slate-300 space-y-2.5 mb-6">
                  <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> 1 Demão de Tinta Especial</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> Raspagem & Lixamento Básico</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> Proteção de Pisos e Móveis</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> <strong>1 Ano de Garantia</strong></li>
                </ul>
              </div>
              <button 
                type="button" 
                :class="[
                  'w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition',
                  selectedTier === 'GOOD' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                ]"
              >
                {{ selectedTier === 'GOOD' ? '● Selecionado' : 'Escolher Bronze' }}
              </button>
            </div>

            <!-- Tier 2: Better (Silver Signature - Recommended) -->
            <div 
              @click="selectedTier = 'BETTER'"
              :class="[
                'rounded-3xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between md:-translate-y-2',
                selectedTier === 'BETTER' 
                  ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/50 shadow-2xl shadow-red-900/40' 
                  : 'bg-slate-900/70 border-slate-700 hover:border-slate-600'
              ]"
            >
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
                ⭐ Mais Escolhido (Recomendado)
              </div>

              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Tony's Signature</div>
                <h4 class="text-xl font-black text-white mb-2">{{ estimate.betterTitle }}</h4>
                <div class="text-3xl font-black text-white mb-4">
                  ${{ estimate.betterPrice.toLocaleString() }}
                </div>
                <div class="text-xs text-slate-300 mb-6 pb-6 border-b border-slate-800 leading-relaxed font-medium">
                  {{ estimate.betterScope }}
                </div>
                <ul class="text-xs text-slate-200 space-y-2.5 mb-6 font-medium">
                  <li class="flex items-center gap-2"><span class="text-emerald-400 font-bold">✓</span> <strong>2 Demãos Sherwin-Williams Emerald</strong></li>
                  <li class="flex items-center gap-2"><span class="text-emerald-400 font-bold">✓</span> Lavagem de Alta Pressão & Raspagem Total</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-400 font-bold">✓</span> Primer Antimofo em todas as manchas</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-400 font-bold">✓</span> Calafetação Completa de Janelas e Portas</li>
                  <li class="flex items-center gap-2"><span class="text-emerald-400 font-bold">✓</span> <strong>3 Anos de Garantia Total</strong></li>
                </ul>
              </div>
              <button 
                type="button" 
                :class="[
                  'w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg',
                  selectedTier === 'BETTER' ? 'bg-red-600 text-white shadow-red-600/30' : 'bg-slate-800 text-slate-300'
                ]"
              >
                {{ selectedTier === 'BETTER' ? '● Selecionado (Signature)' : 'Escolher Silver' }}
              </button>
            </div>

            <!-- Tier 3: Best (Gold Presidential Luxury) -->
            <div 
              @click="selectedTier = 'BEST'"
              :class="[
                'rounded-3xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between',
                selectedTier === 'BEST' 
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/50 shadow-xl shadow-amber-950/30' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
              ]"
            >
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Máxima Durabilidade</div>
                <h4 class="text-xl font-black text-white mb-2">{{ estimate.bestTitle }}</h4>
                <div class="text-3xl font-black text-white mb-4">
                  ${{ estimate.bestPrice.toLocaleString() }}
                </div>
                <div class="text-xs text-slate-400 mb-6 pb-6 border-b border-slate-800 leading-relaxed">
                  {{ estimate.bestScope }}
                </div>
                <ul class="text-xs text-slate-300 space-y-2.5 mb-6">
                  <li class="flex items-center gap-2"><span class="text-amber-400">✓</span> <strong>Tinta Autonivelante Rain Refresh Luxury</strong></li>
                  <li class="flex items-center gap-2"><span class="text-amber-400">✓</span> Acabamento Premium Acetinado em Rodapés</li>
                  <li class="flex items-center gap-2"><span class="text-amber-400">✓</span> Pintura Completa de Portas Decorativas</li>
                  <li class="flex items-center gap-2"><span class="text-amber-400">✓</span> Retoque Anual Gratuito nos primeiros 2 anos</li>
                  <li class="flex items-center gap-2"><span class="text-amber-400">✓</span> <strong>7 Anos de Garantia Estendida</strong></li>
                </ul>
              </div>
              <button 
                type="button" 
                :class="[
                  'w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition',
                  selectedTier === 'BEST' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                ]"
              >
                {{ selectedTier === 'BEST' ? '● Selecionado' : 'Escolher Gold' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Add-on Upgrades Checkboxes -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div class="mb-4">
            <h3 class="text-xl font-bold text-white tracking-tight">Passo 2: Serviços Adicionais Opcionais (Add-ons)</h3>
            <p class="text-sm text-slate-400">Aproveite a equipe já mobilizada no local para economizar até 40% nesses itens extras:</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label 
              v-for="addon in availableAddons" 
              :key="addon.id"
              :class="[
                'p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none',
                isAddonSelected(addon.id) 
                  ? 'bg-red-950/30 border-red-500/60 ring-1 ring-red-500/40' 
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
              ]"
            >
              <input 
                type="checkbox" 
                :checked="isAddonSelected(addon.id)"
                @change="toggleAddon(addon)"
                class="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <div class="flex-1">
                <div class="font-bold text-sm text-white">{{ addon.title }}</div>
                <div class="text-xs text-red-400 font-semibold mt-1">+${{ addon.price }}</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Step 3: Approval & Digital Signature & Stripe Deposit -->
        <div v-if="estimate.status !== 'ACCEPTED'" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 class="text-xl font-bold text-white tracking-tight">Passo 3: Aprovação & Assinatura Digital</h3>
            <p class="text-sm text-slate-400">
              Conforme a legislação de Massachusetts (M.G.L. c. 142A), o valor inicial cobrado é estritamente de 1/3 (33,33%). O saldo restante só é quitado após a conclusão e vistoria.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Seu Nome Completo</label>
              <input 
                v-model="signerName"
                type="text" 
                placeholder="Ex: John Miller"
                class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assinatura Digital (Rubrica)</label>
              <input 
                v-model="signatureText"
                type="text" 
                placeholder="Digite sua assinatura aqui (ex: /s/ John Miller)"
                class="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-serif italic focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Total Calculation Breakdown -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-400">
              <div>Valor do Pacote: <strong>${{ getBasePrice.toLocaleString() }}</strong></div>
              <div>Itens Adicionais: <strong>+${{ getAddonsPrice.toLocaleString() }}</strong></div>
              <div class="text-emerald-400 font-semibold mt-0.5">Total Geral do Contrato: ${{ computedTotal.toLocaleString() }}</div>
            </div>

            <div class="text-right">
              <div class="text-xs text-slate-400">Valor a Pagar Agora (Depósito 1/3):</div>
              <div class="text-2xl font-black text-white text-emerald-400">
                ${{ computedDeposit.toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            @click="acceptEstimate"
            :disabled="submitting || !signerName.trim() || !signatureText.trim()"
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else>✍️ Aceitar Proposta & Pagar Depósito ($${{ computedDeposit.toLocaleString() }})</span>
          </button>
        </div>

        <!-- Accepted Next Steps & Stripe Link -->
        <div v-else class="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
          <p class="text-sm text-slate-300">
            Seu contrato está assinado! Se você ainda não concluiu o pagamento do depósito de 1/3, clique abaixo para abrir o checkout seguro:
          </p>
          <a 
            :href="estimate.stripePaymentUrl || '#'" 
            target="_blank"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30"
          >
            💳 Pagar Depósito Inicial de ${{ estimate.depositAmount.toLocaleString() }} no Stripe
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.params.token

const loading = ref(true)
const error = ref(null)
const estimate = ref({})
const selectedTier = ref('BETTER')
const availableAddons = ref([])
const selectedAddons = ref([])
const signerName = ref('')
const signatureText = ref('')
const submitting = ref(false)

const loadEstimate = async () => {
  loading.value = true
  try {
    const res = await $fetch(`/api/estimates/${token}`)
    estimate.value = res.estimate
    selectedTier.value = res.estimate.selectedTier || 'BETTER'
    availableAddons.value = res.estimate.addons || []
    
    // Inicia com os add-ons salvos anteriormente
    selectedAddons.value = (res.estimate.addons || []).filter(a => a.selected)
    signerName.value = res.estimate.lead?.name || ''
    if (res.estimate.signatureData) {
      signatureText.value = res.estimate.signatureData
    }
  } catch (err) {
    error.value = err.data?.message || 'Falha ao carregar o orçamento.'
  } finally {
    loading.value = false
  }
}

const getBasePrice = computed(() => {
  if (selectedTier.value === 'GOOD') return estimate.value.goodPrice || 5400
  if (selectedTier.value === 'BEST') return estimate.value.bestPrice || 10900
  return estimate.value.betterPrice || 7800
})

const getAddonsPrice = computed(() => {
  return selectedAddons.value.reduce((sum, item) => sum + (item.price || 0), 0)
})

const computedTotal = computed(() => {
  return getBasePrice.value + getAddonsPrice.value
})

const computedDeposit = computed(() => {
  return Math.round((computedTotal.value / 3) * 100) / 100
})

const isAddonSelected = (id) => {
  return selectedAddons.value.some(a => a.id === id)
}

const toggleAddon = (addon) => {
  const index = selectedAddons.value.findIndex(a => a.id === addon.id)
  if (index >= 0) {
    selectedAddons.value.splice(index, 1)
  } else {
    selectedAddons.value.push({ ...addon, selected: true })
  }
}

const acceptEstimate = async () => {
  submitting.value = true
  try {
    const res = await $fetch('/api/estimates/accept', {
      method: 'POST',
      body: {
        token,
        selectedTier: selectedTier.value,
        selectedAddons: selectedAddons.value,
        signerName: signerName.value,
        signatureData: signatureText.value
      }
    })
    
    estimate.value.status = 'ACCEPTED'
    estimate.value.signerName = signerName.value
    estimate.value.signedAt = new Date().toISOString()
    estimate.value.stripePaymentUrl = res.stripePaymentUrl
    estimate.value.depositAmount = res.depositAmount

    // Se houver Stripe Payment URL, redireciona ou abre em nova aba
    if (res.stripePaymentUrl && res.stripePaymentUrl.startsWith('http')) {
      window.location.href = res.stripePaymentUrl
    }
  } catch (err) {
    alert(err.data?.message || 'Erro ao processar assinatura da proposta.')
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
  loadEstimate()
})
</script>
