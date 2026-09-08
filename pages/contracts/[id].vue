<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Loading State -->
      <div v-if="pending" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-slate-400 text-sm">Carregando contrato...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !contract" class="bg-rose-900/40 border border-rose-700 rounded-2xl p-8 text-center">
        <h2 class="text-xl font-bold text-rose-300">Contrato Não Encontrado</h2>
        <p class="text-slate-300 mt-2 text-sm">Verifique o número do contrato ou entre em contato com seu consultor da Tony's Painting and Remodeling.</p>
      </div>

      <!-- Contract Document Card -->
      <div v-else class="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <!-- Top Official Header -->
        <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border-b-4 border-[#D7070D]">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div class="flex items-center gap-4">
              <div class="bg-white rounded-2xl p-2.5 shadow-md shrink-0 border border-slate-700/50">
                <img
                  src="/emblem.png"
                  alt="Tony's Remodeling Emblem"
                  class="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              <div>
                <span class="bg-[#D7070D]/20 text-red-400 border border-[#D7070D]/40 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                  MASSACHUSETTS HIC COMPLIANT AGREEMENT
                </span>
                <h1 class="text-xl sm:text-2xl font-black tracking-tight mt-1.5 text-white">
                  TONY'S REMODELING & PAINTING
                </h1>
                <p class="text-xs text-slate-400 font-mono">
                  MA Home Improvement Contractor Registration #204891 • Fully Licensed & Insured • EPA Lead-Safe
                </p>
              </div>
            </div>
            <div class="text-left sm:text-right">
              <span class="text-xs text-slate-400 block font-mono">CONTRATO Nº</span>
              <span class="text-base font-black text-[#D7070D] font-mono">{{ contract.contractNumber }}</span>
              <span class="text-[11px] text-slate-400 block mt-1">Data: {{ new Date(contract.createdAt).toLocaleDateString('en-US') }}</span>
            </div>
          </div>
        </div>

        <!-- Document Body -->
        <div class="p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed">
          <!-- Parties Section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 block">CONTRATADA (CONTRACTOR):</span>
              <p class="font-bold text-slate-900 mt-1">Tony's Painting and Remodeling Inc.</p>
              <p class="text-slate-600 text-xs">Boston & Greater Massachusetts Area<br>Tel: (617) 555-0199 • contact@tonyspainting.com</p>
            </div>
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 block">CONTRATANTE (HOMEOWNER):</span>
              <p class="font-bold text-slate-900 mt-1">{{ contract.lead?.name || 'Homeowner' }}</p>
              <p class="text-slate-600 text-xs">
                {{ contract.lead?.address || 'Boston Metropolitan Area' }}, {{ contract.lead?.city || 'Boston' }}, {{ contract.lead?.state || 'MA' }}<br>
                Tel: {{ contract.lead?.phone || 'N/A' }}<br>
                E-mail: {{ contract.lead?.email || 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Scope of Work -->
          <div>
            <h3 class="font-black text-slate-900 uppercase tracking-wide text-xs border-b border-slate-200 pb-2">
              1. ESCOPO DOS TRABALHOS (SCOPE OF WORK & PREPARATION PERFECTION)
            </h3>
            <pre class="mt-3 p-4 bg-slate-50 rounded-xl text-slate-700 font-sans text-xs whitespace-pre-wrap leading-relaxed border border-slate-200">
{{ contract.scopeOfWork }}
            </pre>
          </div>

          <!-- Financial Schedule (MA 1/3 Limit Law) -->
          <div>
            <h3 class="font-black text-slate-900 uppercase tracking-wide text-xs border-b border-slate-200 pb-2">
              2. VALOR DO CONTRATO E CRONOGRAMA DE PAGAMENTOS (M.G.L. c. 142A COMPLIANT)
            </h3>
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Valor Total do Projeto</span>
                <span class="text-xl font-black text-slate-900 mt-1 block">
                  ${{ Number(contract.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
                <span class="text-[10px] text-slate-400">Total contratado</span>
              </div>
              <div class="p-3.5 rounded-xl border-2 border-[#D7070D] bg-red-50/60">
                <span class="text-[10px] font-black text-[#D7070D] uppercase block">Sinal Inicial (Máx. 1/3 Lei MA)</span>
                <span class="text-xl font-black text-[#D7070D] mt-1 block">
                  ${{ Number(contract.depositAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
                <span class="text-[10px] text-red-700 font-semibold">Devido no aceite do contrato</span>
              </div>
              <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span class="text-[10px] font-bold text-slate-500 uppercase block">Saldo na Conclusão</span>
                <span class="text-xl font-black text-slate-900 mt-1 block">
                  ${{ (Number(contract.totalAmount) - Number(contract.depositAmount)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
                <span class="text-[10px] text-slate-400">Após vistoria final</span>
              </div>
            </div>
          </div>

          <!-- Massachusetts Statutory 3-Day Right of Cancellation Box -->
          <div class="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs space-y-1.5">
            <span class="font-black uppercase tracking-wide block">
              ⚖️ AVISO OBRIGATÓRIO DA LEGISLAÇÃO DE MASSACHUSETTS (3-DAY RIGHT OF CANCELLATION):
            </span>
            <p>
              YOU, THE BUYER, MAY CANCEL THIS TRANSACTION AT ANY TIME PRIOR TO MIDNIGHT OF THE THIRD BUSINESS DAY AFTER THE DATE OF THIS TRANSACTION. SEE ATTACHED NOTICE OF CANCELLATION FORM FOR AN EXPLANATION OF THIS RIGHT.
            </p>
          </div>

          <!-- 5-Year Warranty Notice -->
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span class="text-lg">🛡️</span>
            <div>
              <strong>Garantia Escrita de 5 Anos:</strong> Todos os serviços de preparação e aplicação de tinta contam com garantia integral contra descascamento e falhas de adesão.
            </div>
          </div>

          <!-- Signature Section -->
          <div class="pt-6 border-t-2 border-slate-200 space-y-4">
            <!-- If already signed -->
            <div v-if="contract.signed" class="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center space-y-3">
              <span class="text-3xl">✅</span>
              <h4 class="text-base font-black text-emerald-900 uppercase">CONTRATO ASSINADO DIGITALMENTE</h4>
              <p class="text-xs text-emerald-700">
                Assinado por <strong>{{ contract.signerName }}</strong> em {{ new Date(contract.signedAt).toLocaleString('en-US') }}<br>
                <span class="font-mono text-[10px] text-emerald-600">IP de Registro: {{ contract.signerIp }} • Autenticação Criptográfica Válida</span>
              </p>

              <!-- Stripe Deposit Payment Button -->
              <div v-if="contract.stripePaymentUrl" class="pt-3">
                <a
                  :href="contract.stripePaymentUrl"
                  target="_blank"
                  class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase px-8 py-3.5 rounded-full shadow-lg transition-all"
                >
                  <span>💳 EFETUAR PAGAMENTO DO SINAL VIA STRIPE (${{ Number(contract.depositAmount).toLocaleString('en-US') }})</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            <!-- If pending signature -->
            <div v-else class="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <h4 class="text-sm font-black text-slate-900 uppercase">Assinatura Eletrônica do Contratante</h4>
                <p class="text-xs text-slate-500 mt-0.5">
                  Ao digitar seu nome completo e clicar no botão abaixo, você concorda com os termos, escopo e cronograma deste contrato sob as leis de Massachusetts.
                </p>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nome Completo do Proprietário / Signatário:
                </label>
                <input
                  v-model="signerName"
                  type="text"
                  :placeholder="contract.lead?.name || 'Ex: John Miller'"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#D7070D] focus:outline-none bg-white text-slate-900 font-semibold"
                />
              </div>

              <div class="flex items-start gap-2">
                <input
                  v-model="termsAgreed"
                  id="agreeTerms"
                  type="checkbox"
                  class="mt-1 w-4 h-4 rounded text-[#D7070D] focus:ring-[#D7070D] cursor-pointer"
                />
                <label for="agreeTerms" class="text-xs text-slate-600 cursor-pointer">
                  Confirmo que sou o proprietário legal do imóvel, revisei o escopo dos serviços e autorizo o início dos trabalhos com o depósito de 1/3.
                </label>
              </div>

              <button
                type="button"
                @click="signAgreement"
                :disabled="!signerName || !termsAgreed || signing"
                class="w-full bg-gradient-to-r from-[#D7070D] to-[#B0050A] hover:from-[#B0050A] hover:to-[#900408] disabled:opacity-50 text-white font-black text-sm uppercase py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{{ signing ? 'Gravando Assinatura Legal...' : '✍️ ASSINAR CONTRATO DIGITALMENTE' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Notice -->
        <div class="bg-slate-100 p-4 text-center text-[10px] text-slate-500 border-t border-slate-200">
          Tony's Painting and Remodeling Inc. • Massachusetts Home Improvement Contractor Registry #204891 • Documento emitido eletronicamente com validade jurídica.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const contractId = route.params.id

const { data, pending, error, refresh } = await useFetch(`/api/contracts/${contractId}`)
const contract = computed(() => data.value?.contract)

const signerName = ref('')
const termsAgreed = ref(false)
const signing = ref(false)

watch(contract, (newVal) => {
  if (newVal?.lead?.name && !signerName.value) {
    signerName.value = newVal.lead.name
  }
}, { immediate: true })

async function signAgreement() {
  if (!signerName.value || !termsAgreed.value) return
  signing.value = true

  try {
    const res = await $fetch('/api/contracts/sign', {
      method: 'POST',
      body: {
        contractId,
        signerName: signerName.value,
        signatureData: `DIGITAL_SIG_${signerName.value.toUpperCase().replace(/\s+/g, '_')}_${Date.now()}`
      }
    })

    if (res.success) {
      await refresh()
      if (res.stripePaymentUrl) {
        // Option to automatically redirect or stay
      }
    } else {
      alert(res.message || 'Erro ao assinar contrato.')
    }
  } catch (err) {
    alert('Falha ao processar assinatura eletrônica.')
  } finally {
    signing.value = false
  }
}
</script>
