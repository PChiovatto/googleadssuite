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
          Ecosistema Inteligente de Otimização de Anúncios
        </h1>

        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          Plataforma completa de monitoramento e auditoria autônoma de tráfego pago. Integrada ao banco de dados via <strong>Prisma</strong>, consultas estruturadas em <strong>GAQL</strong> e consultoria estratégica em tempo real impulsionada pelo <strong>Gemini</strong>.
        </p>

        <div class="flex flex-wrap gap-3 pt-2">
          <NuxtLink
            to="/dashboard"
            class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <span>Abrir Painel de Métricas</span>
            <span>→</span>
          </NuxtLink>

          <NuxtLink
            to="/settings"
            class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 transition-all"
          >
            Configurar Credenciais
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
        <h3 class="font-bold text-slate-900 text-base">Extração Google Ads (GAQL)</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Sincronização ponta a ponta com a API oficial do Google Ads. Extrai métricas consolidadas de custo, impressões, cliques, conversões, CTR, CPC, CPA e Search Impression Share.
        </p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
          2
        </div>
        <h3 class="font-bold text-slate-900 text-base">Inteligência Gemini Integrada</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          O modelo processa o histórico de métricas em tempo de execução para identificar canais drenando orçamento, sugerir tetos de lances por ROAS e escrever cópias de alta conversão.
        </p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
          3
        </div>
        <h3 class="font-bold text-slate-900 text-base">Prisma ORM & Nuxt Nitro</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Arquitetura moderna com banco de dados estruturado (SQLite/PostgreSQL) para reter o histórico das métricas diárias e registrar todas as consultas e auditorias de IA.
        </p>
      </div>
    </div>
  </div>
</template>
