# Master Document: US Market High-Performance CRM & Ads Ecosystem (Final)

Este documento contém a arquitetura definitiva para compilar um ecossistema corporativo de marketing e vendas focado no mercado norte-americano, integrando rastreamento granular, painel de consultores (Lead Claiming), gestão de performance, VoIP nativo e IA.

---

## 1. Stack Tecnológica de Alta Performance
* **Frontend & SSR:** Nuxt 3 + Tailwind CSS + Vue 3 (Server-Side Rendering para Landing Pages dinâmicas).
* **Backend & Filas:** Nitro (embutido no Nuxt) + BullMQ (arquitetura assíncrona para IA e Webhooks).
* **Banco de Dados & Cache:** SQLite local (dev) / PostgreSQL (produção) via Prisma ORM + Redis.
* **Infraestrutura US:** Twilio (SMS e VoIP local com códigos de área de MA/EUA), Stripe (Pagamentos com Cartão/Apple Pay/ACH), Google Ads API v18, Google Local Services Ads (LSA), Google Business Profile API.
* **Inteligência Artificial:** Google Gemini 2.5 (Qualificação de leads, roteiros de vendas, transcrição de VoIP e auditoria de anúncios).

---

## 2. Estrutura de Diretórios e Arquivos

```text
/
├── .env                              # Variáveis de ambiente (US timezone, Twilio, Stripe, Ads, Gemini)
├── .env.example
├── us_market_ecosystem_final.md      # Este documento mestre
├── google_ads_ai_ecosystem.md        # Documento base de métricas e GAQL
├── nuxt.config.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── prisma/
│   ├── schema.prisma                 # Schema com Auditoria, TCPA, RBAC e Relatórios
│   └── dev.db
├── server/
│   ├── api/
│   │   ├── ads/
│   │   │   ├── sync.ts               # Extração de métricas GAQL
│   │   │   ├── campaigns.ts          # Consulta consolidada de KPIs
│   │   │   └── offline-conversion.post.ts # Feedback para o algoritmo de lances do Google Ads
│   │   ├── webhooks/
│   │   │   ├── google-leads.post.ts  # Webhook de Extensões de Formulário do Ads
│   │   │   └── lsa.post.ts           # Webhook do Google Local Services Ads (Google Guaranteed)
│   │   ├── gbp/
│   │   │   └── sync.ts               # Sincronização Google Meu Negócio (Maps)
│   │   ├── leads/
│   │   │   ├── index.ts              # Pipeline de leads
│   │   │   ├── claim.post.ts         # Trava atômica de Lead Claiming (anti-colisão com aviso de dono)
│   │   │   ├── qualify.post.ts       # Qualificador com Gemini AI e gerador de mensagem
│   │   │   └── update-status.post.ts # Transição de etapas do funil
│   │   ├── admin/
│   │   │   └── reports.get.ts        # Métricas gerenciais (Leaderboard, SLA de atendimento, faturamento)
│   │   └── twilio/
│   │       ├── sms.post.ts           # Disparo de SMS e follow-ups em conformidade com TCPA
│   │       └── voice.ts              # Registro de ligações VoIP e transcrição de áudio
│   └── utils/
│       ├── googleAdsClient.ts
│       └── prisma.ts
├── pages/
│   ├── index.vue                     # Visão geral do ecossistema
│   ├── [slug].vue                    # Landing Page dinâmica SSR que se adapta à palavra-chave buscada
│   ├── dashboard/
│   │   ├── index.vue                 # Painel Executivo de Métricas de Anúncios
│   │   ├── leads.vue                 # Gestão de Leads com visualização Kanban & Lista
│   │   └── calls.vue                 # Central VoIP & Auditoria de Ligações com IA
│   ├── admin/
│   │   └── performance.vue           # Painel do Gestor (Ranking de Consultores, SLA e Auditoria)
│   └── settings.vue                  # Gerenciamento de chaves e parâmetros de conexão
├── components/
│   ├── MetricsCard.vue
│   ├── DataTable.vue
│   ├── AiInsights.vue
│   ├── LeadsTable.vue
│   └── KanbanBoard.vue               # Funil visual com botões de velocidade de atendimento
└── layouts/
    └── default.vue                   # Navegação lateral completa com controle de papéis
```

---

## 3. Conformidade Legal e Regras do Mercado Americano (TCPA & CCPA)

1. **TCPA (Telephone Consumer Protection Act):**
   - Todo formulário de captura contém caixa de consentimento explícito e auditável armazenada no banco (`tcpaConsent = true`).
2. **ValueTrack DNA do Google Ads:**
   - As páginas capturam parâmetros na URL: `?keyword={keyword}&matchtype={matchtype}&device={device}&gclid={gclid}&city={city}&state={state}` e associam ao lead.
3. **Conversões Offline (Google Ads):**
   - Ao mover o lead para `CONVERTIDO`, o sistema notifica o Google Ads via `gclid`, informando o valor fechado (`dealValue`) para otimizar os lances inteligentes (Target CPA / Target ROAS).
4. **Lead Claiming (Velocidade de Atendimento):**
   - Trava atômica: se dois consultores tentarem assumir o lead simultaneamente, o primeiro garante o contato e o segundo recebe: *"Tarde demais! Atendido por [Nome]"*.
