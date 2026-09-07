<template>
  <div class="min-h-screen bg-slate-900 text-white font-sans">
    <!-- Top Announcement Bar -->
    <div class="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 shadow-md">
      <span>⭐ LICENSED & INSURED SINCE 2015</span>
      <span class="hidden sm:inline">• SERVING {{ dynamicCity.toUpperCase() }}, {{ dynamicState.toUpperCase() }} & GREATER BOSTON</span>
      <span>• FREE SAME-DAY ESTIMATES!</span>
    </div>

    <!-- Header Navigation -->
    <header class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
          BP
        </div>
        <div>
          <span class="font-extrabold text-base tracking-tight text-white block leading-none">FIRST BOSTON PAINTERS</span>
          <span class="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">& SERVICES CORP.</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <a href="#quote-form" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
          <span>📞 (617) 555-0198</span>
        </a>
        <a
          href="#quote-form"
          class="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl shadow-lg shadow-orange-600/30 transition-all"
        >
          Free Estimate
        </a>
      </div>
    </header>

    <!-- Hero Section (Dynamic Matching Search Keyword & Location) -->
    <section class="max-w-6xl mx-auto px-6 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-7 space-y-6">
        <!-- ValueTrack Dynamic Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 text-amber-400 text-xs font-bold border border-slate-700 shadow-sm">
          <span>📍</span>
          <span>Top-Rated Painting Experts in {{ dynamicCity }}, {{ dynamicState }}</span>
        </div>

        <!-- Dynamic Headline -->
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight text-white">
          {{ dynamicHeadline }}
        </h1>

        <p class="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
          Don't settle for peeling paint or rushed jobs. We deliver flawless surface preparation, wallpaper removal, cabinet spray finishing, and exterior power washing with premium paints.
        </p>

        <!-- Social Proof Checklist -->
        <div class="grid grid-cols-2 gap-3 pt-2 text-xs font-bold text-slate-200">
          <div class="flex items-center gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span class="text-emerald-400 text-base">✓</span>
            <span>Meticulous Prep Work</span>
          </div>
          <div class="flex items-center gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span class="text-emerald-400 text-base">✓</span>
            <span>Zero Upfront Deposit</span>
          </div>
          <div class="flex items-center gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span class="text-emerald-400 text-base">✓</span>
            <span>Sherwin & Benjamin Moore</span>
          </div>
          <div class="flex items-center gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span class="text-emerald-400 text-base">✓</span>
            <span>100% Satisfaction Guarantee</span>
          </div>
        </div>
      </div>

      <!-- Lead Capture Form (TCPA Compliant) -->
      <div id="quote-form" class="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-500 relative">
        <div class="mb-5 text-center">
          <span class="text-[11px] font-black uppercase tracking-widest text-orange-600 block">Limited Time Offer</span>
          <h3 class="text-2xl font-black text-slate-900 tracking-tight mt-0.5">SCHEDULE FREE QUOTE</h3>
          <p class="text-xs text-slate-500 mt-1">We come to your home in {{ dynamicCity }} for a free on-site estimate</p>
        </div>

        <form @submit.prevent="submitLead" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Your Full Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Michael Johnson"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                placeholder="(617) 000-0000"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">ZIP / Postal Code *</label>
              <input
                v-model="form.zip"
                type="text"
                required
                placeholder="e.g. 02108"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="michael@example.com"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Project Details</label>
            <select
              v-model="form.service"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-700 cursor-pointer"
            >
              <option value="Interior Painting">Interior Painting (Walls, Ceilings, Trim)</option>
              <option value="Exterior Painting">Exterior House Painting</option>
              <option value="Kitchen Cabinet Painting">Kitchen Cabinet Refinishing</option>
              <option value="Power Washing & Wood Repair">Power Washing & Deck / Siding Repair</option>
              <option value="Commercial Painting">Commercial / Office Painting</option>
            </select>
          </div>

          <!-- US Market TCPA Compliance Opt-in Checkbox -->
          <div class="pt-1">
            <label class="flex items-start gap-2 text-[10px] text-slate-500 leading-tight cursor-pointer">
              <input
                v-model="form.tcpaConsent"
                type="checkbox"
                required
                class="mt-0.5 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
              />
              <span>
                By submitting this form, I provide my express written consent under the <strong>TCPA</strong> to receive calls, SMS messages, and emails from First Boston Painters regarding my quote request. Msg & data rates may apply.
              </span>
            </label>
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-700 hover:to-orange-700 text-white font-black text-sm uppercase py-3.5 rounded-xl shadow-xl transition-all disabled:opacity-50 tracking-wider"
          >
            {{ submitting ? 'Sending Your Request...' : 'GET MY FREE ESTIMATE NOW' }}
          </button>
        </form>
      </div>
    </section>

    <!-- Success Modal -->
    <div
      v-if="submitted"
      class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white text-slate-900 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl border border-slate-200 animate-scale-in">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>
        <h3 class="text-2xl font-black tracking-tight">Quote Request Received!</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Thank you, <strong>{{ form.name }}</strong>! Our team in <strong>{{ dynamicCity }}</strong> has been notified. A senior consultant will call or text you within 5 minutes to confirm your free on-site estimate.
        </p>
        <button
          @click="submitted = false"
          class="bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const route = useRoute()

// Capture ValueTrack and UTM URL DNA parameters
const query = route.query
const keywordParam = (query.keyword || query.q || '').toString()
const cityParam = (query.city || 'Boston').toString()
const stateParam = (query.state || 'MA').toString()
const gclidParam = (query.gclid || '').toString()
const deviceParam = (query.device || 'm').toString()
const matchTypeParam = (query.matchtype || 'exact').toString()
const slug = (route.params.slug || 'painting-services').toString()

const dynamicCity = ref(cityParam)
const dynamicState = ref(stateParam)

const dynamicHeadline = computed(() => {
  if (keywordParam) {
    return `${keywordParam} in ${dynamicCity.value}`
  }
  const cleanSlug = slug.replace(/-/g, ' ')
  return `PREMIUM ${cleanSlug} IN ${dynamicCity.value}, ${dynamicState.value}`
})

const form = ref({
  name: '',
  phone: '',
  email: '',
  zip: '',
  service: 'Interior Painting',
  tcpaConsent: true
})

const submitting = ref(false)
const submitted = ref(false)

async function submitLead() {
  submitting.value = true
  try {
    const payload = {
      source: 'GOOGLE_ADS',
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email || null,
      serviceInterested: `${form.value.service} (ZIP: ${form.value.zip})`,
      city: dynamicCity.value,
      state: dynamicState.value,
      keyword: keywordParam || slug,
      gclid: gclidParam || `gclid_${Date.now()}`,
      device: deviceParam,
      matchType: matchTypeParam,
      tcpaConsent: form.value.tcpaConsent,
      notes: `Captured on SSR Landing Page /${slug} with keyword "${keywordParam || 'direct'}"`
    }

    await $fetch('/api/leads', {
      method: 'POST',
      body: payload
    })

    submitted.value = true
  } catch (err) {
    console.error('Error submitting quote:', err)
  } finally {
    submitting.value = false
  }
}
</script>
