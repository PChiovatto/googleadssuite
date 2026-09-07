# Master Document: Google Ads & AI Intelligence Ecosystem

Este documento contém toda a arquitetura, estrutura de arquivos, variáveis de ambiente, modelagem de banco de dados e fluxos de API necessários para inicializar o sistema de análise de anúncios no Antigravity.

---

## 1. Stack Tecnológica
* **Framework:** Nuxt 3 (Frontend Vue 3 + Backend Nitro)
* **Banco de Dados:** SQLite (default zero-config local) / PostgreSQL via Prisma ORM
* **Estilização:** Tailwind CSS
* **Autenticação:** NuxtAuth / Sessão Segura
* **Integrações:** Google Ads API (REST/Node Client via GAQL) e Google Gemini API (`@google/generative-ai`)

---

## 2. Estrutura de Diretórios e Arquivos (Tree)

```text
/
├── .env                       # Variáveis de sistema e chaves de API
├── .env.example               # Modelo de variáveis de ambiente
├── .gitignore                 # Arquivos ignorados no versionamento
├── google_ads_ai_ecosystem.md # Este documento mestre de arquitetura
├── nuxt.config.ts             # Configuração master do Nuxt 3
├── package.json               # Dependências do projeto
├── tailwind.config.js         # Configuração do Tailwind CSS
├── tsconfig.json              # Configurações TypeScript
├── prisma/
│   ├── schema.prisma          # Modelagem do banco de dados (Prisma)
│   └── dev.db                 # Banco local SQLite (gerado automaticamente)
├── server/
│   ├── api/
│   │   ├── ads/
│   │   │   ├── sync.ts        # Extração e sincronização do Google Ads
│   │   │   └── campaigns.ts   # Consulta de campanhas e agregação de KPIs
│   │   └── ai/
│   │       └── analyze.ts     # Análise estratégica via Google Gemini
│   └── utils/
│       ├── googleAdsClient.ts # Utilitário cliente do Google Ads & GAQL
│       └── prisma.ts          # Singleton do Prisma Client
├── pages/
│   ├── index.vue              # Landing page e visão geral do ecossistema
│   ├── dashboard/
│   │   └── index.vue          # Painel com todas as métricas do Google Ads + IA
│   └── settings.vue           # Gerenciamento de credenciais e status de conexões
├── components/
│   ├── MetricsCard.vue        # Componente visual para KPIs com variações
│   ├── AiInsights.vue         # Painel de auditoria estratégica e geração de copies com IA
│   └── DataTable.vue          # Tabela avançada de campanhas com filtros e ordenação
├── layouts/
│   └── default.vue            # Sidebar, barra de topo, status de sincronização
└── assets/
    └── css/
        └── main.css           # Diretivas base do Tailwind CSS
```

---

## 3. Variáveis de Sistema (`.env`)

O sistema exige a configuração das seguintes variáveis de ambiente para se conectar aos serviços externos.

```env
# Banco de Dados (Prisma)
# Default SQLite para execução imediata sem dependências externas:
DATABASE_URL="file:./dev.db"
# Para alternar para PostgreSQL em produção:
# DATABASE_URL="postgresql://user:password@localhost:5432/ads_ai_db?schema=public"

# Google Ads API
GOOGLE_ADS_CLIENT_ID="seu_client_id_do_gcp"
GOOGLE_ADS_CLIENT_SECRET="seu_client_secret_do_gcp"
GOOGLE_ADS_DEVELOPER_TOKEN="seu_developer_token_do_mcc"
GOOGLE_ADS_REFRESH_TOKEN="seu_refresh_token_gerado_no_oauth"
GOOGLE_ADS_LOGIN_CUSTOMER_ID="id_da_conta_gerente_mcc"
GOOGLE_ADS_CUSTOMER_ID="id_da_conta_de_anuncios_alvo"

# Google Gemini API (Google AI Studio)
GEMINI_API_KEY="sua_chave_do_google_ai_studio"

# Autenticação & Servidor
AUTH_SECRET="uma_string_aleatoria_super_secreta_min_32_caracteres"
AUTH_ORIGIN="http://localhost:3000"
```

---

## 4. Estrutura do Banco de Dados (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // Alterne para "postgresql" se for usar banco Postgres
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("advertiser")
  createdAt DateTime @default(now())
}

model CampaignMetrics {
  id                    String   @id @default(cuid())
  date                  DateTime
  campaignId            String
  campaignName          String
  status                String   @default("ENABLED")
  advertisingChannel    String   @default("SEARCH") // SEARCH, DISPLAY, PERFORMANCE_MAX, VIDEO
  impressions           Int
  clicks                Int
  cost                  Float    // Custo monetário total
  conversions           Float
  conversionValue       Float    // Valor monetário total convertido
  ctr                   Float    // % CTR
  averageCpc            Float    // CPC médio
  costPerConversion     Float    // CPA
  roas                  Float    // Retorno sobre gasto (conversionValue / cost)
  searchImpressionShare Float    @default(0) // % Quota de impressões na rede de pesquisa
  createdAt             DateTime @default(now())
}

model KeywordMetrics {
  id           String   @id @default(cuid())
  campaignId   String
  keyword      String
  matchType    String   // EXACT, PHRASE, BROAD
  impressions  Int
  clicks       Int
  cost         Float
  conversions  Float
  cpc          Float
  qualityScore Int?
  createdAt    DateTime @default(now())
}

model AiConsultation {
  id               String   @id @default(cuid())
  date             DateTime @default(now())
  promptType       String   @default("AUDIT") // AUDIT, BID_OPTIMIZATION, COPYWRITING, NEGATIVE_KEYWORDS
  contextData      String   // Snapshot em JSON dos dados analisados
  aiRecommendation String   // Relatório completo e estruturado emitido pelo Gemini
}
```

---

## 5. Métricas do Google Ads Suportadas no Painel

O painel foi projetado para cobrir todas as métricas cruciais da **Google Ads API (GAQL)**:

| Métrica GAQL | Nome no Painel | Descrição / Fórmula |
| :--- | :--- | :--- |
| `metrics.cost_micros` | **Gasto Total** | Custo total investido no período |
| `metrics.impressions` | **Impressões** | Quantidade de exibições do anúncio |
| `metrics.clicks` | **Cliques** | Interações diretas no anúncio |
| `metrics.ctr` | **CTR (%)** | Taxa de cliques (`clicks / impressions * 100`) |
| `metrics.average_cpc` | **CPC Médio** | Custo médio por clique |
| `metrics.conversions` | **Conversões** | Ações de valor registradas (leads, compras) |
| `metrics.cost_per_conversion` | **CPA Médio** | Custo por cada conversão (`cost / conversions`) |
| `metrics.conversions_value` | **Valor Total de Conv.** | Faturamento total gerado pelos anúncios |
| `metrics.roas` | **ROAS** | Retorno sobre o investimento publicitário (`value / cost`) |
| `metrics.search_impression_share` | **Quota de Impressões** | Proporção de exibição frente ao total disponível no leilão |

---

## 6. Versionamento e Criação do Repositório (Git & GitHub)

```bash
# 1. Inicializar o repositório local
git init

# 2. Adicionar os arquivos ao stage
git add .

# 3. Criar o commit inicial
git commit -m "feat: initial commit - Google Ads & Gemini AI Ecosystem"

# 4. Conectar ao repositório remoto no GitHub
# Com GitHub CLI autenticado:
# gh repo create ads-ai-ecosystem --private --source=. --remote=origin --push
#
# Ou via Git tradicional:
# git remote add origin https://github.com/SEU_USUARIO/ads-ai-ecosystem.git
# git branch -M main
# git push -u origin main
```
