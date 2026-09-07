<template>
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div>
        <!-- App Logo & Title -->
        <div class="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl shadow-lg">
              ⚡
            </div>
            <div>
              <span class="font-extrabold text-sm tracking-tight text-white block leading-tight">ADS + AI SUITE</span>
              <span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Intelligence Hub</span>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="p-4 space-y-1.5">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Home class="w-4 h-4" />
            <span>Início & Visão Geral</span>
          </NuxtLink>

          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <LayoutDashboard class="w-4 h-4" />
            <span>Painel de Anúncios</span>
          </NuxtLink>

          <NuxtLink
            to="/dashboard/leads"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/dashboard/leads' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <Users class="w-4 h-4" />
              <span>Leads & CRM (GBP/Ads)</span>
            </div>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
              Novo
            </span>
          </NuxtLink>

          <NuxtLink
            to="/settings"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            :class="$route.path === '/settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          >
            <Sliders class="w-4 h-4" />
            <span>Conexões & Credenciais</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Account Info / Footer -->
      <div class="p-4 border-t border-slate-800/80">
        <div class="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            BP
          </div>
          <div class="overflow-hidden flex-1">
            <span class="text-xs font-semibold text-slate-200 block truncate">Boston Painters Corp</span>
            <span class="text-[10px] text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Conectado
            </span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header Bar -->
      <header class="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Conta Ativa:</span>
          <span class="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            CID: 987-654-3210 (Boston Painters)
          </span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Sync Button -->
          <button
            @click="syncMetrics"
            :disabled="syncing"
            class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': syncing }" />
            <span>{{ syncing ? 'Sincronizando...' : 'Sincronizar Google Ads' }}</span>
          </button>
        </div>
      </header>

      <!-- Sync Toast Notification -->
      <div
        v-if="toastMessage"
        class="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in"
      >
        <span>✓</span>
        <span>{{ toastMessage }}</span>
      </div>

      <!-- Page Content -->
      <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Home, LayoutDashboard, Users, Sliders, RefreshCw } from 'lucide-vue-next'

const syncing = ref(false)
const toastMessage = ref('')

async function syncMetrics() {
  syncing.value = true
  try {
    const res = await $fetch('/api/ads/sync')
    if (res.success) {
      toastMessage.value = res.message
      setTimeout(() => {
        toastMessage.value = ''
      }, 4000)
    }
  } catch (error) {
    toastMessage.value = 'Falha ao sincronizar métricas.'
    setTimeout(() => {
      toastMessage.value = ''
    }, 4000)
  } finally {
    syncing.value = false
  }
}
</script>
