# Master Instruction Document: US Market Omni-Agent CRM & Ultimate Ecosystem (v4)

Este documento contém a arquitetura mestre definitiva e consolidada do ecossistema corporativo de alta performance para o mercado norte-americano (Massachusetts / EUA), integrando banco de dados relacional, infraestrutura de telecomunicações e pagamentos (Twilio / Stripe / Amazon SES), orquestração Multi-Agent (MAS) e os 4 novos pilares estratégicos de escalabilidade comercial.

---

## 1. Stack Tecnológica Definitiva

* **Frontend & SSR:** Nuxt 3 (SSR + Nitro) + Tailwind CSS + Nuxt UI / Lucide Icons.
* **Backend & Filas:** Nitro Engine (Server Routes) + BullMQ (Redis) / In-Memory Async.
* **Banco de Dados:** Prisma ORM com SQLite (Local Dev) / PostgreSQL (Produção) + Redis.
* **Infraestrutura US:**
  * **Twilio:** Discador VoIP WebRTC, Gravações e disparos automáticos de SMS local.
  * **Stripe:** Links dinâmicos de Checkout para depósitos e liquidação de contratos.
  * **Amazon SES (Simple Email Service):** Infraestrutura de alta entregabilidade para E-mail Marketing e notificações transacionais.
  * **Google Ads API & LSA:** Captura de Leads via Webhooks e envio de Offline Conversion Tracking (`gclid`).
* **Inteligência Artificial (Multi-Agent Systems - MAS):**
  * **Gemini 1.5 Flash:** Triagem ultrarrápida (<500ms) de leads e roteiros de primeiro contato.
  * **Gemini 1.5 Pro + Whisper:** Transcrição de chamadas VoIP, análise de sentimento e coaching de objeções.
  * **Claude 3.5 Sonnet:** Auditoria estratégica de tráfego pago, ROAS e redação de anúncios para Massachusetts.
  * **OpenAI Realtime API:** Assistente de voz autônomo conectado ao Twilio Voice.
  * **GPT-4o:** Follow-ups via SMS (conformidade TCPA) e Copiloto de E-mail Marketing.
  * **DALL-E 3:** Geração de hero images dinâmicas e contextuais para as Landing Pages.

---

## 2. Esquema do Banco de Dados Atualizado (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // or "postgresql" in production
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  role      String    @default("CONSULTANT") // "CONSULTANT" or "MANAGER"
  leads     Lead[]
  createdAt DateTime  @default(now())
}

model Lead {
  id                  String            @id @default(cuid())
  source              String            // GOOGLE_ADS, GOOGLE_LSA, GOOGLE_BUSINESS, ORGANIC, DIRECT
  campaignId          String?
  campaignName        String?
  
  // ValueTrack & Granular Tracking DNA
  keyword             String?
  gclid               String?
  matchType           String?
  device              String?
  city                String?
  state               String?

  // Contact Info & US Legal Compliance
  name                String
  email               String?
  phone               String?
  address             String?
  zipCode             String?
  tcpaConsent         Boolean           @default(true)
  serviceInterested   String?
  serviceType         String?
  tags                String?           @default("[]")
  stripeCheckoutUrl   String?
  stripePaymentStatus String?           @default("UNPAID")
  
  // Pipeline, Ownership & Speed-to-Lead Gamification
  status              String            @default("NOVO") // NOVO, EM_ATENDIMENTO, PROPOSTA, CONVERTIDO, PERDIDO
  ownerId             String?
  owner               User?             @relation(fields: [ownerId], references: [id])
  
  // Timing & Financial SLA Metrics
  claimedAt           DateTime?
  closedAt            DateTime?
  dealValue           Float?
  
  notes               String?
  aiScore             Int?
  aiQualification     String?
  whatsappScript      String?
  rawData             String            @default("{}")
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  appointments        Appointment[]
  contracts           Contract[]
  reviewRequests      ReviewRequest[]

  @@index([source])
  @@index([status])
  @@index([ownerId])
  @@index([createdAt])
}

model Appointment {
  id              String   @id @default(cuid())
  leadId          String
  lead            Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  title           String?
  date            DateTime
  durationMinutes Int      @default(60)
  status          String   @default("SCHEDULED") // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
  address         String?
  notes           String?
  reminderSent    Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([leadId])
  @@index([date])
}

model Contract {
  id               String    @id @default(cuid())
  leadId           String
  lead             Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  contractNumber   String    @unique
  title            String    // Massachusetts HIC Agreement
  scopeOfWork      String    // Prep Work, Sanding, Primer, Paint
  totalAmount      Float     // Total in USD
  depositAmount    Float     // Initial deposit (Max 1/3 under MA M.G.L. c. 142A)
  status           String    @default("DRAFT") // DRAFT, SENT, SIGNED, PAID, CANCELLED
  documentUrl      String?
  signed           Boolean   @default(false)
  signedAt         DateTime?
  signerName       String?
  signerIp         String?
  signatureData    String?
  stripeSessionId  String?
  stripePaymentUrl String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([leadId])
}

model ReviewRequest {
  id               String   @id @default(cuid())
  leadId           String
  lead             Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  channel          String   @default("SMS") // SMS, EMAIL, BOTH
  googleReviewLink String
  status           String   @default("SENT") // SENT, CLICKED, COMPLETED
  sentAt           DateTime @default(now())

  @@index([leadId])
}

model CallLog {
  id              String   @id @default(cuid())
  leadId          String
  agentId         String
  agentName       String?
  durationSeconds Int
  recordingUrl    String?
  aiTranscript    String?
  sentiment       String?
  createdAt       DateTime @default(now())

  @@index([leadId])
  @@index([agentId])
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  userId    String
  userName  String?
  details   String
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([timestamp])
}
```

---

## 3. Mapeamento dos 27 Módulos & Pilares Estratégicos

| # | Módulo / Pilar | Rota / Arquivo Chave | Propósito Estratégico |
| :--- | :--- | :--- | :--- |
| **1** | **Setup e DB** | `prisma/schema.prisma` | Modelos relacionais completos com conformidade legal e relatórios. |
| **2** | **Autenticação & RBAC** | `server/utils/` | Controle de permissões `CONSULTANT` vs `MANAGER`. |
| **3** | **Roleta Atômica de Leads** | `server/api/leads/claim.post.ts` | Disputa justa de leads com trava contra concorrência e aviso com nome do consultor. |
| **4** | **Landing Page Híbrida SSR** | `pages/[slug].vue` | Boston Painters & Services adaptando-se em tempo real a {keyword}, {city} e ValueTrack. |
| **5** | **Funil Visual Kanban** | `components/KanbanBoard.vue` | Drag-and-drop interativo nativo entre as 5 etapas com botões de ação rápida. |
| **6** | **Tabela Detalhada de Leads** | `components/LeadsTable.vue` | Busca, filtros por origem e status, e qualificação individual. |
| **7** | **Triagem Gemini 1.5 Flash** | `server/api/ai/triage.ts` | Pontuação de 1 a 10, urgência e script comercial gerado em <500ms. |
| **8** | **Auditoria Whisper + Gemini** | `server/api/ai/audit.ts` | Transcrição de áudio, detecção de objeções e coaching de vendas. |
| **9** | **Estrategista Claude 3.5** | `server/api/ai/strategy.ts` | Análise de ROAS, corte de gastos com termos negativos e novos anúncios. |
| **10** | **Voice AI Realtime** | `server/api/ai/voice-agent.ts` | Atendente telefônico por IA para horários noturnos e fins de semana. |
| **11** | **Reengajamento GPT-4o** | `server/api/ai/followup.ts` | Disparos de SMS e e-mails com consentimento TCPA e opt-out (STOP). |
| **12** | **Criativos DALL-E 3** | `server/api/ai/render.ts` | Geração de imagens fotográficas personalizadas de arquitetura em Boston. |
| **13** | **Discador VoIP WebRTC** | `pages/dashboard/calls.vue` | Ligações com números locais dos EUA via Twilio Voice. |
| **14** | **Stripe Checkout Dinâmico** | `server/api/stripe/create-checkout.post.ts` | Criação automática de sessões de pagamento para propostas e depósitos. |
| **15** | **Stripe Webhook** | `server/api/stripe/webhook.post.ts` | Liquidação de pagamento, mudança para `CONVERTIDO` e disparo de conversão offline. |
| **16** | **Google Ads Offline Conversions**| `server/api/ads/offline-conversion.post.ts` | Devolução do GCLID e valor da venda fechada para calibrar o Smart Bidding. |
| **17** | **Webhooks Google Ads & LSA** | `server/api/webhooks/` | Captura automática de formulários de extensão e leads locais garantidos. |
| **18** | **Google Meu Negócio Sync** | `server/api/gbp/sync.ts` | Importação e integração de contatos vindos do Google Maps. |
| **19** | **Ranking Gerencial & SLA** | `pages/admin/performance.vue` | Cálculo de tempo de resposta em minutos (`claimedAt - createdAt`) e vendas por consultor. |
| **20** | **Painel de Métricas Google Ads**| `pages/dashboard/index.vue` | 8 KPIs essenciais, tabelas de campanhas e índice de qualidade de anúncios. |
| **21** | **E-mail Marketing Nativo** | `pages/dashboard/marketing.vue` | Segmentação por etapa do funil e disparo em massa. |
| **22** | **Amazon SES Integrado** | `server/utils/sesClient.ts` | Infraestrutura corporativa AWS para envio em massa sem risco ao e-mail principal. |
| **23** | **Agendamento Inteligente** | `server/api/calendar/` & `pages/dashboard/calendar.vue` | Gestão de In-Home Estimates com confirmação imediata via Twilio SMS. |
| **24** | **Reputação & Reviews Google** | `server/api/reputation/request-review.post.ts` | Disparo automatizado de SMS/E-mail solicitando avaliação 5 estrelas no Google Maps ao converter. |
| **25** | **Relatório Financeiro & ROAS Real**| `server/api/analytics/financial.get.ts` & `pages/dashboard/financial.vue` | Cruzamento do gasto em anúncios do Google com o faturamento real fechado no CRM. |
| **26** | **Contratos Digitais de MA** | `server/api/contracts/` & `pages/contracts/[id].vue` | Gerador de contratos em conformidade com a lei M.G.L. c. 142A de Massachusetts (limite de 1/3 no depósito). |
| **27** | **Assinatura Eletrônica Válida** | `server/api/contracts/sign.post.ts` | Coleta de assinatura digital com registro de IP e timestamp, seguida do checkout Stripe imediato. |

---

## 4. Instrução Máster para o Agente Antigravity

```markdown
> "Atue como Arquiteto de Software Sênior. Leia todo este documento e valide a aplicação Nuxt 3 completa, integrando todas as funcionalidades abaixo:
> 
> 1. Setup e DB: Prisma schema atualizado com Appointment, Contract, ReviewRequest e relações estendidas.
> 2. Roleta de Leads Atômica: Endpoint server/api/leads/claim.post.ts com trava de concorrência atômica e proteção de colisão.
> 3. Landing Pages Híbridas: Rota pages/[slug].vue adaptando-se em tempo real a parâmetros ValueTrack (keyword, city, device, gclid).
> 4. Orquestração Multi-Agent (server/api/ai/):
>    - triage.ts (Gemini 1.5 Flash), audit.ts (Whisper + Gemini Pro), strategy.ts (Claude 3.5 Sonnet), voice-agent.ts (OpenAI Realtime), followup.ts (GPT-4o), render.ts (DALL-E 3).
> 5. E-mail Marketing & Amazon SES: Módulo de envio com copiloto de redação GPT-4o e cliente server/utils/sesClient.ts para alta entregabilidade.
> 6. Infraestrutura US: Twilio (WebRTC discador/SMS) e Stripe (checkout dinâmico).
> 7. Agendamento Inteligente: Módulo server/api/calendar/ e página /dashboard/calendar para controle de In-Home Estimates com SMS Twilio.
> 8. Reputação (GBP): Automação de pós-venda solicitando avaliação 5 estrelas no Google quando o lead atinge CONVERTIDO.
> 9. Analytics Financeiro: Dashboard /dashboard/financial cruzando os custos da Google Ads API com o dealValue dos contratos fechados para calcular o ROAS Real e CAC.
> 10. Contratos e Assinaturas (MA HIC): Gerador de contratos em conformidade com Massachusetts M.G.L. c. 142A (depósito máximo de 1/3, aviso de 3 dias de cancelamento) e portal de assinatura /contracts/[id].vue com liquidação Stripe subsequente.
> 11. Ads & Webhooks: Recepção de leads via Webhooks e disparo de Offline Conversions."
```

---

## 5. Verificação de Integridade & Compilação

Para validar todo o ecossistema em ambiente Windows:
```powershell
# 1. Sincronizar Banco e Tipos do Prisma
npx.cmd prisma db push
npx.cmd prisma generate

# 2. Compilar Aplicação Nuxt 3 em Produção
npx.cmd nuxi build

# 3. Executar o Servidor Nitro
node.exe .output/server/index.mjs
```
