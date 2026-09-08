<template>
  <div class="page-wrapper font-sans text-[#222222] bg-white antialiased">
    <!-- Top Bar -->
    <div class="bg-[#ff7902] text-white text-xs py-2 px-4 text-center font-bold tracking-wider flex items-center justify-center gap-3">
      <span>⭐ LICENSED AND INSURED SINCE 2015</span>
      <span class="hidden sm:inline">• SERVING {{ dynamicCity.toUpperCase() }}, {{ dynamicState.toUpperCase() }} & GREATER BOSTON</span>
      <span>• FREE SAME-DAY ESTIMATES!</span>
    </div>

    <!-- Header Section -->
    <header class="section-light py-8 px-4 border-b border-gray-100">
      <div class="max-w-4xl mx-auto text-center">
        <p class="font-bold text-gray-500 text-sm mb-3 uppercase tracking-wide">
          Licensed and Insured<br>since 2015
        </p>

        <!-- Dynamic ValueTrack Tag -->
        <div v-if="keywordParam" class="inline-block mb-3 px-4 py-1 rounded-full bg-orange-100 text-[#ff7902] font-black text-xs uppercase tracking-wider">
          🔍 Searching for: {{ keywordParam }} in {{ dynamicCity }}
        </div>

        <div class="inline-block bg-black text-[#ff7902] p-4 sm:p-6 border-4 border-[#ff7902] rounded-lg my-3 shadow-xl">
          <h1 class="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#ff7902]">
            TONY'S PAINTING AND REMODELING
          </h1>
        </div>

        <h2 class="text-xl sm:text-2xl md:text-3xl font-black text-[#222222] uppercase tracking-wide mt-2">
          {{ dynamicHeadline }}
        </h2>

        <div class="bg-gray-100 p-4 rounded-lg my-4 max-w-2xl mx-auto shadow-inner">
          <p class="text-[#fc0000] font-black text-base sm:text-xl uppercase tracking-wide">
            Wall paper removal, kitchen cabinets, power washing, rotted wood replacement, sanding we do it all
          </p>
        </div>

        <h3 class="text-[#ff7902] text-xl sm:text-2xl font-black uppercase mt-4">
          WE COME TO YOUR HOME<br>FOR FREE ESTIMATE
        </h3>

        <!-- Dynamic AI Hero Graphic Generator (DALL-E 3) -->
        <div v-if="heroImage" class="my-6 max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border-2 border-orange-400">
          <img :src="heroImage" alt="Custom Boston Painting Project" class="w-full h-auto object-cover max-h-96" />
          <div class="bg-slate-900 text-white text-[11px] p-2 flex justify-between items-center px-4 font-medium">
            <span>✨ AI Visual Match: {{ dynamicCity }} Architecture</span>
            <button @click="generateAiHero" class="text-orange-400 underline hover:text-orange-300 font-bold">Regenerate with DALL-E 3</button>
          </div>
        </div>

        <h3 class="text-[#0056b3] text-xl sm:text-2xl font-black uppercase mt-6 mb-3">
          WATCH THE VIDEO BELOW
        </h3>

        <!-- Video Container -->
        <div class="relative pb-[56.25%] h-0 overflow-hidden my-6 border-4 border-white rounded-lg shadow-2xl max-w-3xl mx-auto">
          <iframe
            class="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/qbE2DSRX1c0"
            title="Tony's Painting and Remodeling Services"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>

        <h3 class="text-[#ff7902] text-lg sm:text-xl italic font-bold max-w-2xl mx-auto mt-6">
          "UNLEASH THE TRUE POTENTIAL OF YOUR HOME<br>
          ELEVATE ITS BEAUTY WITH PREMIUM EXTERIOR AND INTERIOR PAINTING SERVICES!"
        </h3>

        <!-- Two Featured Images -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 max-w-3xl mx-auto">
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/26539541-164C-4A19-8C68-8BF55A6CDDCF_1_105_c.jpg"
            alt="Interior Painting Service Boston"
            class="w-full rounded-lg shadow-xl aspect-4/3 object-cover"
          />
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/3DA73D91-D69E-41F7-832F-A5AA654578DF.jpg"
            alt="Exterior Painting Service Massachusetts"
            class="w-full rounded-lg shadow-xl aspect-4/3 object-cover"
          />
        </div>

        <a href="#quote-form" class="cta-btn cta-orange">
          SCHEDULE A FREE QUOTE
        </a>
      </div>
    </header>

    <!-- Dark Section: Prep Work -->
    <section class="bg-[#111111] text-white py-16 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <img
          src="https://doorbridgefix.com/wp-content/uploads/2026/03/POWER-WASHING.jpg"
          alt="Power Washing Services Boston"
          class="rounded-full w-48 h-48 mx-auto object-cover shadow-2xl my-4 border-4 border-orange-500"
        />

        <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase mt-4">
          PREP WORK IS KEY FOR LONG LASTING PAINT JOB!
        </h2>

        <div class="bg-black p-4 rounded-lg my-4 inline-block border border-gray-800">
          <h2 class="text-[#ff7902] text-3xl sm:text-5xl font-black m-0 uppercase tracking-tight">
            YOUR PAINTING JOB
          </h2>
        </div>

        <h2 class="text-[#19b814] text-3xl sm:text-4xl font-black uppercase my-2">
          DONE RIGHT!
        </h2>

        <p class="text-[#fc0000] font-bold text-sm sm:text-base max-w-2xl mx-auto my-4 uppercase leading-relaxed">
          PREPARATION PERFECTION: WE KNOW THAT A FLAWLESS PAINT JOB STARTS WITH PREPARATION. OUR TEAM METICULOUSLY CLEANS, REPAIRS, AND PRIMES SURFACES TO ENSURE OPTIMAL ADHESION AND LONG-LASTING RESULTS.
        </p>

        <!-- Prep Checklist -->
        <ul class="text-left max-w-xl mx-auto my-8 space-y-3 font-bold text-sm sm:text-base">
          <li v-for="(item, idx) in prepItems" :key="idx" class="flex items-start gap-3">
            <span class="text-[#fc0000] font-black text-lg">✓</span>
            <span>{{ item }}</span>
          </li>
        </ul>

        <h2 class="text-[#ff7902] text-4xl sm:text-5xl font-black mt-8 uppercase">
          SINCE 2015
        </h2>
      </div>
    </section>

    <!-- Light Section: Before & After & Interactive Quote Form -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-4xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/IMG_2084-scaled.jpg"
            alt="House Exterior Painted Before and After"
            class="w-full rounded-lg shadow-xl aspect-4/3 object-cover"
          />
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/IMG_2237-scaled.jpg"
            alt="Cabinet Painting Before and After"
            class="w-full rounded-lg shadow-xl aspect-4/3 object-cover"
          />
        </div>

        <h3 class="text-[#0056b3] text-lg sm:text-2xl font-bold text-center my-6">
          "You could buy the best paint, but the most important factor is the prep work."
        </h3>

        <div class="bg-black p-4 rounded-lg text-center my-6 shadow-xl">
          <h2 class="text-[#1dff02] text-xl sm:text-3xl font-black uppercase m-0">
            WE CAN HELP YOU WITH THE PROFESSIONAL JOB YOU ARE LOOKING FOR!!
          </h2>
        </div>

        <!-- Dynamic Lead Capture Form with TCPA Opt-in -->
        <div id="quote-form" class="my-10 bg-gray-50 border-4 border-[#ff7902] rounded-2xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto">
          <div class="text-center mb-6">
            <span class="text-xs font-black uppercase tracking-widest text-[#fc0000]">Zero Upfront Risk</span>
            <h3 class="text-2xl sm:text-3xl font-black text-slate-900 uppercase mt-1">SCHEDULE FREE QUOTE</h3>
            <p class="text-xs text-gray-600 mt-1">We come directly to your home in {{ dynamicCity }}, {{ dynamicState }}</p>
          </div>

          <form @submit.prevent="submitLead" class="space-y-4 text-xs sm:text-sm">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Your Full Name *</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. John Smith"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7902] bg-white font-medium"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-gray-700 mb-1">Phone Number (US) *</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="(617) 000-0000"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7902] bg-white font-medium"
                />
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">ZIP Code *</label>
                <input
                  v-model="form.zip"
                  type="text"
                  required
                  placeholder="e.g. 02138"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7902] bg-white font-medium"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="john@example.com"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7902] bg-white font-medium"
                />
              </div>
              <div>
                <label class="block font-bold text-gray-700 mb-1">Street Address</label>
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="123 Main St, Apt 4"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7902] bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-700 mb-1">Service Needed</label>
              <select
                v-model="form.service"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff7902] bg-white font-medium"
              >
                <option value="Interior Painting">Interior Painting (Walls, Ceilings, Doors, Trim)</option>
                <option value="Exterior Painting">Exterior House Painting & Staining</option>
                <option value="Kitchen Cabinet Painting">Kitchen Cabinet Refinishing & Spray</option>
                <option value="Power Washing & Wood Repair">Power Washing & Rotted Wood Replacement</option>
                <option value="Wallpaper Removal & Skim Coat">Wallpaper Removal & Drywall Skim Coat</option>
                <option value="Commercial Painting">Commercial / Property Management Painting</option>
              </select>
            </div>

            <!-- US Market TCPA Compliance Opt-in Checkbox -->
            <div class="pt-2">
              <label class="flex items-start gap-2.5 text-[11px] text-gray-600 leading-tight cursor-pointer">
                <input
                  v-model="form.tcpaConsent"
                  type="checkbox"
                  required
                  class="mt-0.5 rounded text-[#fc0000] focus:ring-[#fc0000] border-gray-300"
                />
                <span>
                  I agree to receive calls, SMS messages, and emails from <strong>Tony's Painting and Remodeling</strong> regarding my quote request at the number provided above. Consent is not a condition of purchase. Message and data rates may apply.
                </span>
              </label>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full cta-btn"
            >
              {{ submitting ? 'PROCESSING REQUEST...' : 'SCHEDULE A FREE QUOTE' }}
            </button>
          </form>
        </div>

        <!-- 4 Project Gallery Images -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/505F0276-1ACF-4761-9945-443A1BB52EB3_1_105_c.jpg"
            alt="Tony's Painting Project 1"
            class="w-full rounded-lg shadow aspect-square object-cover"
          />
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/0D45D45D-DD53-42C8-A4A6-63516BE0D830_1_105_c.jpg"
            alt="Tony's Painting Project 2"
            class="w-full rounded-lg shadow aspect-square object-cover"
          />
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/8E11114B-2E53-44E5-A254-7C0208125302_1_105_c.jpg"
            alt="Tony's Painting Project 3"
            class="w-full rounded-lg shadow aspect-square object-cover"
          />
          <img
            src="https://doorbridgefix.com/wp-content/uploads/2026/03/76DAFAD3-0069-43D6-9BBA-633E92FAE7BD_1_105_c.jpg"
            alt="Tony's Painting Project 4"
            class="w-full rounded-lg shadow aspect-square object-cover"
          />
        </div>
      </div>
    </section>

    <!-- Dark Section: Testimonials & Reviews -->
    <section class="bg-[#111111] text-white py-16 px-4">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8 bg-[#fc0000] p-4 rounded-lg shadow-xl">
          <h2 class="text-2xl sm:text-3xl font-black uppercase text-white m-0">
            Read This Before Going <u class="text-[#ffb84d]">ANY</u> Further
          </h2>
        </div>

        <div class="bg-[#222222] p-6 rounded-r-lg border-l-4 border-[#ff7902] italic shadow-xl my-6">
          <p class="text-sm sm:text-base leading-relaxed">
            "Tony's Painting painted my home and two-stall detached garage exterior. In addition to the fabulous quality and attention to detail, the guys were respectful and fun to work with. My property was left immaculate each night and at job completion. They responded to every request or concern respectfully and in a timely manner. Aside from rainy days, everything was done on time and they worked continuously until completion. I have received many compliments on the 'old girl’s' new look. Thank you Tony and crew!"
          </p>
          <p class="not-italic font-bold text-[#ff7902] mt-3 text-base">
            Kimberly Hayes-Hackett<br>
            <span class="text-xs font-normal text-gray-400 italic">Methuen, MA.</span>
          </p>
        </div>

        <!-- Social Proof Icons -->
        <div class="text-center my-8">
          <h3 class="text-lg font-bold">Take A Sneak Peek Inside...</h3>
          <h2 class="text-[#ff7902] bg-black inline-block px-4 py-2 rounded border border-gray-800 font-black text-2xl uppercase my-2">
            COMPLETED PROJECTS
          </h2>
          <h3 class="text-sm text-gray-300">On Instagram, Facebook and Google.</h3>
          <div class="flex items-center justify-center gap-4 my-4">
            <img src="https://doorbridgefix.com/wp-content/uploads/2026/03/facebook-logo.png" alt="Facebook" class="w-16 h-auto inline-block" />
            <img src="https://doorbridgefix.com/wp-content/uploads/2026/03/insta-logo-nb.png" alt="Instagram" class="w-16 h-auto inline-block" />
            <img src="https://doorbridgefix.com/wp-content/uploads/2026/03/google-review-icon-square-min.png" alt="Google Reviews" class="w-16 h-auto inline-block" />
          </div>
        </div>

        <div class="text-center bg-[#fc0000] p-4 rounded-lg shadow-xl my-8">
          <h2 class="text-xl sm:text-3xl font-black uppercase text-white m-0">
            DON'T JUST TAKE OUR WORD FOR IT...
          </h2>
        </div>

        <h3 class="text-center text-lg font-bold text-gray-200 mb-6">
          See What Others Have Said About Their Experience!
        </h3>

        <!-- Testimonial Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-[#222222] p-5 rounded-r-lg border-l-4 border-[#ff7902] italic shadow">
            <p class="text-xs sm:text-sm">"Tony's Painting and Remodeling did a great job on the exterior and interior of our home. Highly recommend!"</p>
            <p class="not-italic font-bold text-[#ff7902] mt-2 text-xs">Petra Dawson</p>
          </div>
          <div class="bg-[#222222] p-5 rounded-r-lg border-l-4 border-[#ff7902] italic shadow">
            <p class="text-xs sm:text-sm">"I loved working with Tony's Painting and Remodeling. Their professionalism was beyond anything I’ve ever worked with. Work was done with quality and in a timely manner. I recommend this company to anyone looking for a painter or remodeling contractor."</p>
            <p class="not-italic font-bold text-[#ff7902] mt-2 text-xs">Daniel Frank Fernandes</p>
          </div>
          <div class="bg-[#222222] p-5 rounded-r-lg border-l-4 border-[#ff7902] italic shadow">
            <p class="text-xs sm:text-sm">"I highly recommend Tony's Painting and Remodeling. They did an amazing exterior job at my house last summer and they just finished an interior and cabinet job in our home. They are professional, clean and always on time."</p>
            <p class="not-italic font-bold text-[#ff7902] mt-2 text-xs">Jussara Fagundes</p>
          </div>
          <div class="bg-[#222222] p-5 rounded-r-lg border-l-4 border-[#ff7902] italic shadow">
            <p class="text-xs sm:text-sm">"Very professional with extraordinary attention to details. Very affordable services. Initially, they were supposed to do only the dining and living rooms. I was so pleased that I asked them to redo my entire basement!!"</p>
            <p class="not-italic font-bold text-[#ff7902] mt-2 text-xs">Divine Dirksen</p>
          </div>
        </div>

        <a href="#quote-form" class="cta-btn mt-8">
          SCHEDULE A FREE QUOTE
        </a>
      </div>
    </section>

    <!-- Light Section: Company Info & Payment Badges -->
    <section class="py-16 px-4 bg-white text-center">
      <div class="max-w-4xl mx-auto">
        <div class="bg-black p-4 rounded-lg shadow-xl inline-block mb-6">
          <h2 class="text-[#ff7902] text-xl sm:text-3xl font-black uppercase m-0">
            PROFESSIONAL INTERIOR AND EXTERIOR PAINTING
          </h2>
        </div>

        <div class="text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto space-y-3 font-semibold text-gray-700">
          <p><strong>TONY'S PAINTING AND REMODELING PROVIDES UNMATCHED SERVICES TO CLIENTS THROUGHOUT BOSTON AND THE SURROUNDING AREAS OF MASSACHUSETTS SINCE 2015.</strong></p>
          <p><strong>WE HAVE THE EXPERIENCE AND KNOWLEDGE TO HANDLE YOUR PAINTING AND REMODELING PROJECT NEEDS.</strong></p>
          <p><strong>WE ARE COMMITTED TO PROVIDING BEAUTIFUL AND SUSTAINABLE PAINTING SOLUTIONS TO OUR CLIENTS, AND STRIVE TO EXCEED THEIR EXPECTATIONS.</strong></p>
          <p><strong>TONY'S PAINTING AND REMODELING IS AN INDUSTRY-LEADING CONTRACTOR THAT OFFERS A WIDE ARRAY OF PAINTING & REMODELING OPTIONS: INTERIOR, EXTERIOR, KITCHEN CABINETS, SPRAY, DRYWALL REPAIR, DECKS AND MUCH MORE.</strong></p>
        </div>

        <h2 class="text-[#fc0000] text-2xl sm:text-4xl font-black underline uppercase my-6">
          The decision is now.
        </h2>

        <img src="https://doorbridgefix.com/wp-content/uploads/2026/03/download.png" alt="Arrow Down" class="w-10 mx-auto my-3" />

        <a href="#quote-form" class="cta-btn">
          SCHEDULE A FREE QUOTE
        </a>

        <div class="mt-8">
          <h3 class="text-[#fc0000] font-black text-base uppercase mb-2">WE ACCEPT</h3>
          <img src="https://doorbridgefix.com/wp-content/uploads/2026/03/credit-cards-min.png" alt="Credit Cards Accepted" class="max-w-xs mx-auto" />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-black text-white py-10 px-4 text-center border-t-4 border-[#ff7902]">
      <div class="max-w-4xl mx-auto">
        <img src="https://doorbridgefix.com/wp-content/uploads/2026/03/Package-Services-Instagram-Post.png" alt="Logo" class="w-14 mx-auto mb-3" />
        <p class="font-bold text-gray-400 text-xs">Licensed and Insured<br>since 2015</p>
        <p class="text-[11px] text-gray-600 mt-4">
          Copyright © 2026 TONY'S PAINTING AND REMODELING CORP.™. All rights reserved.
        </p>
      </div>
    </footer>

    <!-- Success Modal -->
    <div
      v-if="submitted"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white text-slate-900 rounded-2xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl border-4 border-[#ff7902]">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
          ✓
        </div>
        <h3 class="text-2xl font-black uppercase text-slate-900">Quote Request Received!</h3>
        <p class="text-xs text-gray-600 leading-relaxed">
          Thank you, <strong>{{ form.name }}</strong>! Your request for <strong>{{ dynamicCity }}, {{ dynamicState }}</strong> has been dispatched. A senior estimator will contact you within 5 minutes.
        </p>
        <div v-if="triageResult" class="bg-orange-50 p-3 rounded-lg border border-orange-200 text-left text-xs space-y-1">
          <div class="font-bold text-[#ff7902] flex items-center justify-between">
            <span>⚡ AI Priority: {{ triageResult.priority }}</span>
            <span>Score: {{ triageResult.score }}/10</span>
          </div>
          <p class="text-gray-700 italic">{{ triageResult.intent }}</p>
        </div>
        <button
          @click="submitted = false"
          class="w-full bg-black text-white text-xs font-black uppercase py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const route = useRoute()

// Capture ValueTrack & UTM URL DNA parameters
const query = route.query
const keywordParam = (query.keyword || query.q || '').toString()
const cityParam = (query.city || 'Boston').toString()
const stateParam = (query.state || 'MA').toString()
const gclidParam = (query.gclid || '').toString()
const deviceParam = (query.device || 'm').toString()
const matchTypeParam = (query.matchtype || 'exact').toString()
const slug = (route.params.slug || 'tonys-painting-and-remodeling').toString()

const dynamicCity = ref(cityParam)
const dynamicState = ref(stateParam)
const heroImage = ref('')
const triageResult = ref(null)

const dynamicHeadline = computed(() => {
  if (keywordParam) {
    return `${keywordParam.toUpperCase()} IN ${dynamicCity.value.toUpperCase()}`
  }
  return `EXTERIOR AND INTERIOR PAINTING IN ${dynamicCity.value.toUpperCase()}`
})

const prepItems = [
  'WALL PAPER REMOVAL',
  'CAULKING',
  'FIX DAMAGED WALLS',
  'SKIM COAT',
  'POWER WASHING',
  'ROTTED WOOD REPLACEMENT',
  'CAULK GAPS TO PROTECT FROM THE WEATHER AND PREVENT ROTTING',
  'REMOVE ALL LOOSE OR PEELING PAINT AND SAND',
  'OIL PRIMER TO BETTER BOND NEW COAT OF PAINT WITH THE OLD PAINT',
  'WE UNDERSTAND THAT COMMUNICATION IS IMPORTANT FOR OUR CLIENTS',
  'WE KEEP WORK AREA CLEAN',
  'HIGH QUALITY PAINT ONLY'
]

const form = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  zip: '',
  service: 'Interior Painting',
  tcpaConsent: true
})

const submitting = ref(false)
const submitted = ref(false)

async function generateAiHero() {
  try {
    const { data } = await useFetch('/api/ai/render', {
      method: 'POST',
      body: {
        prompt: `Luxury colonial home exterior in ${dynamicCity.value} Massachusetts, freshly painted with high quality finish and crisp trim, bright sunny day, architectural photography`
      }
    })
    if (data.value?.render?.imageUrl) {
      heroImage.value = data.value.render.imageUrl
    }
  } catch (err) {
    console.error('Error generating AI hero:', err)
  }
}

async function submitLead() {
  submitting.value = true
  try {
    const payload = {
      source: 'GOOGLE_ADS',
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email || null,
      address: form.value.address || null,
      zipCode: form.value.zip,
      serviceInterested: `${form.value.service} (ZIP: ${form.value.zip})`,
      serviceType: form.value.service,
      city: dynamicCity.value,
      state: dynamicState.value,
      keyword: keywordParam || slug,
      gclid: gclidParam || `gclid_${Date.now()}`,
      device: deviceParam,
      matchType: matchTypeParam,
      tcpaConsent: form.value.tcpaConsent,
      notes: `Captured on SSR Landing Page /${slug} with keyword "${keywordParam || 'direct'}"`
    }

    const res = await $fetch('/api/leads', {
      method: 'POST',
      body: payload
    })

    if (res.triage) {
      triageResult.value = res.triage
    }
    submitted.value = true
  } catch (err) {
    console.error('Error submitting quote:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cta-btn {
  display: block;
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  padding: 16px 24px;
  background: linear-gradient(to bottom, #fc0000, #d30000);
  color: #fff !important;
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  border-radius: 60px;
  border: 3px solid #ff4d4d;
  box-shadow: 0 10px 20px rgba(252, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.cta-btn:hover {
  background: linear-gradient(to bottom, #d30000, #fc0000);
  transform: scale(1.03);
  box-shadow: 0 15px 30px rgba(252, 0, 0, 0.5);
}

.cta-orange {
  background: linear-gradient(to bottom, #ff7902, #d86600);
  border-color: #ffa44d;
  box-shadow: 0 10px 20px rgba(255, 121, 2, 0.3);
}

.cta-orange:hover {
  background: linear-gradient(to bottom, #d86600, #ff7902);
}
</style>
