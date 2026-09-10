<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Loading State -->
      <div v-if="loading" class="py-12">
        <div class="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs text-slate-400">Carregando formulário de avaliação...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-8">
        <div class="text-4xl mb-2">⚠️</div>
        <h2 class="text-lg font-bold text-white mb-1">Link Expirado</h2>
        <p class="text-xs text-slate-400 mb-4">{{ error }}</p>
        <a href="/" class="text-xs text-red-400 hover:underline">Ir para página inicial</a>
      </div>

      <!-- Main Form -->
      <div v-else class="space-y-6">
        <!-- Brand Emblem -->
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 mx-auto flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-red-600/30">
          T
        </div>

        <div>
          <h1 class="text-xl font-extrabold text-white tracking-tight">
            Tony's Painting and Remodeling
          </h1>
          <p class="text-xs text-slate-400 mt-1">
            Olá <strong class="text-white">{{ leadName }}</strong>, como foi sua experiência com nossa equipe na sua obra?
          </p>
        </div>

        <!-- 5 Interactive Stars -->
        <div class="py-2">
          <div class="flex items-center justify-center gap-2">
            <button 
              v-for="star in 5" 
              :key="star"
              type="button"
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
              @click="setRating(star)"
              class="text-4xl transition-transform hover:scale-125 focus:outline-none"
            >
              <span :class="(hoverRating || currentRating) >= star ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-700'">
                ★
              </span>
            </button>
          </div>
          <div class="text-xs font-bold text-slate-400 mt-2 h-4">
            <span v-if="currentRating === 5" class="text-amber-400">⭐⭐⭐⭐⭐ Excelente! Experiência Perfeita</span>
            <span v-else-if="currentRating === 4" class="text-amber-300">⭐⭐⭐⭐ Muito Bom!</span>
            <span v-else-if="currentRating === 3" class="text-slate-300">⭐⭐⭐ Razoável</span>
            <span v-else-if="currentRating === 2" class="text-slate-400">⭐⭐ Abaixo do esperado</span>
            <span v-else-if="currentRating === 1" class="text-red-400">⭐ Ruim / Insatisfeito</span>
            <span v-else class="text-slate-500">Toque nas estrelas para avaliar</span>
          </div>
        </div>

        <!-- Path A: 4 or 5 Stars (Google Review Direct Link) -->
        <div v-if="currentRating >= 4" class="space-y-4 pt-2 animate-fadeIn">
          <div class="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 leading-relaxed">
            🎉 <strong>Ficamos muito felizes com a sua satisfação!</strong><br />
            Você poderia dedicar 15 segundos para confirmar sua avaliação de 5 estrelas no nosso Google Meu Negócio oficial? Isso nos ajuda imensamente como empresa local de Massachusetts!
          </div>

          <button 
            @click="submitPositiveReview"
            :disabled="submitting"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <span>⭐ Postar Avaliação no Google</span>
            <span>↗</span>
          </button>
        </div>

        <!-- Path B: 1, 2, or 3 Stars (Guarda-Costas / Internal Resolution) -->
        <div v-else-if="currentRating > 0 && currentRating < 4" class="space-y-4 pt-2 text-left animate-fadeIn">
          <div class="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs text-amber-200 leading-relaxed text-center">
            🛡️ <strong>Nosso compromisso é com a sua total satisfação.</strong><br />
            Lamentamos profundamente que algo não tenha ficado perfeito. Por favor, diga abaixo o que ocorreu para que nossa gerência resolva imediatamente:
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Como podemos corrigir isso para você?
            </label>
            <textarea 
              v-model="feedbackText"
              rows="3"
              placeholder="Descreva o que podemos melhorar ou corrigir no seu serviço..."
              class="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            ></textarea>
          </div>

          <button 
            @click="submitInternalFeedback"
            :disabled="submitting || !feedbackText.trim()"
            class="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition disabled:opacity-50"
          >
            {{ submitting ? 'Enviando...' : 'Enviar à Gerência Geral para Resolução' }}
          </button>
        </div>

        <!-- Resolution Confirmation Screen -->
        <div v-if="submittedMessage" class="p-4 bg-slate-800 rounded-2xl text-xs text-slate-200 border border-slate-700">
          ✓ {{ submittedMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = route.params.token

const loading = ref(true)
const error = ref(null)
const leadName = ref('')
const currentRating = ref(0)
const hoverRating = ref(0)
const feedbackText = ref('')
const submitting = ref(false)
const submittedMessage = ref('')

const loadData = async () => {
  loading.value = true
  try {
    const res = await $fetch(`/api/reputation/review/${token}`)
    leadName.value = res.lead?.name || 'Cliente'
    if (res.reviewRequest?.rating) {
      currentRating.value = res.reviewRequest.rating
    }
  } catch (err) {
    error.value = err.data?.message || 'Link inválido ou expirado.'
  } finally {
    loading.value = false
  }
}

const setRating = (val) => {
  currentRating.value = val
}

const submitPositiveReview = async () => {
  submitting.value = true
  try {
    const res = await $fetch('/api/reputation/submit-rating', {
      method: 'POST',
      body: {
        token,
        rating: currentRating.value,
        feedbackText: 'Avaliação 5 estrelas positiva com redirecionamento ao Google.'
      }
    })
    if (res.googleReviewUrl) {
      window.location.href = res.googleReviewUrl
    }
  } catch (err) {
    alert(err.data?.message || 'Erro ao registrar avaliação')
  } finally {
    submitting.value = false
  }
}

const submitInternalFeedback = async () => {
  submitting.value = true
  try {
    const res = await $fetch('/api/reputation/submit-rating', {
      method: 'POST',
      body: {
        token,
        rating: currentRating.value,
        feedbackText: feedbackText.value
      }
    })
    submittedMessage.value = res.message
  } catch (err) {
    alert(err.data?.message || 'Erro ao enviar feedback')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
