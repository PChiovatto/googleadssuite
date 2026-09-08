<template>
  <div class="space-y-8">
    <!-- Hero Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
      <div class="relative z-10 max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30">
          <span>✨</span>
          <span>Google Ads API v18 + Google Gemini 2.5 Hub</span>
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Intelligent Ad Optimization & Lead Pipeline Ecosystem
        </h1>

        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          Enterprise performance marketing suite and autonomous lead operations platform. Direct integration with <strong>Google Ads API (GAQL)</strong>, persistent <strong>Prisma ORM</strong> data modeling, and real-time AI strategic auditing powered by <strong>Gemini Pro & Claude 3.5</strong>.
        </p>

        <div class="flex flex-wrap gap-3 pt-2">
          <NuxtLink
            to="/dashboard"
            class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <span>Launch Executive Dashboard</span>
            <span>→</span>
          </NuxtLink>

          <NuxtLink
            to="/settings"
            class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 transition-all"
          >
            Configure Credentials
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quick Architecture Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
          1
        </div>
        <h3 class="font-bold text-slate-900 text-base">Google Ads Live Sync (GAQL)</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          End-to-end telemetry with the official Google Ads API. Ingests consolidated metrics for cost, impressions, clicks, conversions, CTR, CPC, CPA, and Search Impression Share.
        </p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
          2
        </div>
        <h3 class="font-bold text-slate-900 text-base">Integrated Gemini & Claude Intelligence</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          AI models evaluate performance history to detect budget-draining keywords, recommend bid caps based on target ROAS, and generate high-converting ad copy.
        </p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
          3
        </div>
        <h3 class="font-bold text-slate-900 text-base">Prisma ORM & Nuxt Nitro Engine</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Modern full-stack architecture with structured database persistence (SQLite/PostgreSQL) to maintain historical metrics and log all AI audits and homeowner transactions.
        </p>
      </div>
    </div>
  </div>
</template>
