<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Master Admin Management Switcher Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
      <NuxtLink
        to="/admin/users"
        class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition-all"
      >
        <span>🛡️</span>
        <span>User Profiles & Role Configuration</span>
        <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">MASTER ONLY</span>
      </NuxtLink>
      <NuxtLink
        to="/settings"
        class="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#D7070D] text-white shadow-sm flex items-center gap-2 transition-all"
      >
        <span>🔑</span>
        <span>API Connections & Credentials</span>
      </NuxtLink>
    </div>

    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2 border border-amber-300">
        <span>🛡️</span>
        <span class="uppercase tracking-wide">MASTER ADMINISTRATOR EXCLUSIVE</span>
      </div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">API Connections & Credentials</h1>
      <p class="text-xs text-slate-500">
        Manage API integration keys, credentials, and webhooks for Google Ads, Google Cloud, Gemini AI, and local database storage.
      </p>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Google Ads Status -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          Ads
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm">Google Ads API</h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Demo / Not Configured
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Requires a Developer Token (MCC) and Google Cloud OAuth 2.0 credentials.
          </p>
        </div>
      </div>

      <!-- Gemini AI Status -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          AI
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm">Google Gemini AI</h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Ready for API Key
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Requires <code class="bg-slate-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> from Google AI Studio.
          </p>
        </div>
      </div>
    </div>

    <!-- Step by Step Configuration Guide -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        How to Obtain Credentials from the Google Ecosystem
      </h2>

      <!-- Step 1 -->
      <div class="space-y-2 text-xs text-slate-700">
        <div class="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
          <span>Google AI Studio (Gemini)</span>
        </div>
        <p class="pl-8 text-slate-600">
          1. Access the <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-600 underline font-semibold">Google AI Studio</a> portal.<br>
          2. Click <strong>"Create API Key"</strong>.<br>
          3. Paste the generated key into the <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GEMINI_API_KEY</code> variable in your root <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">.env</code> file.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="space-y-2 text-xs text-slate-700">
        <div class="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
          <span>Google Ads Developer Token (MCC)</span>
        </div>
        <p class="pl-8 text-slate-600">
          1. Sign in to your Google Ads <strong>Manager Account (MCC)</strong>.<br>
          2. Navigate to <strong>Tools & Settings &gt; API Center</strong>.<br>
          3. Copy your <strong>Developer Token</strong> and update <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GOOGLE_ADS_DEVELOPER_TOKEN</code> in your root <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">.env</code>.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="space-y-2 text-xs text-slate-700">
        <div class="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
          <span>Google Cloud OAuth 2.0 Credentials</span>
        </div>
        <p class="pl-8 text-slate-600">
          1. In Google Cloud Console, enable the <strong>Google Ads API</strong> for your active project.<br>
          2. Create OAuth 2.0 client credentials (Web Application).<br>
          3. Configure authorized redirect URIs and copy <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GOOGLE_ADS_CLIENT_ID</code> and <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GOOGLE_ADS_CLIENT_SECRET</code>.
        </p>
      </div>

      <!-- Database note -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <p class="font-bold text-slate-800">Active Database Engine: Local SQLite (<code class="font-mono">prisma/dev.db</code>)</p>
        <p class="text-slate-600">
          The CRM is currently configured to persist all customer, financial, and tracking data locally without external Docker or PostgreSQL setup requirements. To switch to production PostgreSQL, update <code class="font-mono bg-slate-200/70 px-1 py-0.5 rounded">DATABASE_URL</code> in your <code class="font-mono bg-slate-200/70 px-1 py-0.5 rounded">.env</code> and <code class="font-mono bg-slate-200/70 px-1 py-0.5 rounded">prisma/schema.prisma</code>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWorkspaceAuth } from '~/composables/useWorkspaceAuth'

const { isMaster, getDefaultRoute } = useWorkspaceAuth()

onMounted(() => {
  if (!isMaster.value) {
    navigateTo(getDefaultRoute())
  }
})
</script>
