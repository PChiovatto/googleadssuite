<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Conexões & Credenciais de API</h1>
      <p class="text-xs text-slate-500">
        Gerencie os parâmetros de conexão do Google Ads, Google Cloud, Gemini AI e Banco de Dados.
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
              Demo / Não Configurado
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Necessita de Developer Token (MCC) e credenciais OAuth 2.0 do Google Cloud.
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
              Pronto para Chave
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Requer a <code class="bg-slate-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> do Google AI Studio.
          </p>
        </div>
      </div>
    </div>

    <!-- Step by Step Configuration Guide -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Como Obter as Chaves no Ecossistema Google
      </h2>

      <!-- Step 1 -->
      <div class="space-y-2 text-xs text-slate-700">
        <div class="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
          <span>Google AI Studio (Gemini)</span>
        </div>
        <p class="pl-8 text-slate-600">
          1. Acesse o <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-600 underline font-semibold">Google AI Studio</a>.<br>
          2. Clique em <strong>"Create API Key"</strong>.<br>
          3. Cole o valor gerado na variável <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GEMINI_API_KEY</code> dentro do arquivo <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">.env</code>.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="space-y-2 text-xs text-slate-700">
        <div class="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
          <span>Google Ads Developer Token (MCC)</span>
        </div>
        <p class="pl-8 text-slate-600">
          1. Faça login na sua <strong>Conta de Administrador (MCC)</strong> do Google Ads.<br>
          2. Vá em <strong>Ferramentas e Configurações &gt; Centro de API (API Center)</strong>.<br>
          3. Copie o seu <strong>Developer Token</strong> e preencha <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GOOGLE_ADS_DEVELOPER_TOKEN</code> no arquivo <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">.env</code>.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="space-y-2 text-xs text-slate-700">
        <div class="flex items-center gap-2 font-bold text-sm text-slate-900">
          <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
          <span>Google Cloud OAuth 2.0 Credentials</span>
        </div>
        <p class="pl-8 text-slate-600">
          1. No Google Cloud Console, ative a <strong>Google Ads API</strong> no seu projeto.<br>
          2. Crie uma credencial do tipo <strong>ID do cliente OAuth 2.0</strong> (aplicativo Web).<br>
          3. Configure a URL de redirecionamento e obtenha o <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GOOGLE_ADS_CLIENT_ID</code> e <code class="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">GOOGLE_ADS_CLIENT_SECRET</code>.
        </p>
      </div>

      <!-- Database note -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <p class="font-bold text-slate-800">Banco de Dados Ativo: SQLite Local (<code class="font-mono">prisma/dev.db</code>)</p>
        <p class="text-slate-600">
          O sistema já está configurado para salvar todo o histórico localmente sem necessidade de instalar ou rodar um container PostgreSQL. Se quiser usar PostgreSQL posteriormente, basta alterar a variável <code class="font-mono bg-slate-200/70 px-1 py-0.5 rounded">DATABASE_URL</code> no arquivo <code class="font-mono bg-slate-200/70 px-1 py-0.5 rounded">.env</code> e no <code class="font-mono bg-slate-200/70 px-1 py-0.5 rounded">prisma/schema.prisma</code>.
        </p>
      </div>
    </div>
  </div>
</template>
