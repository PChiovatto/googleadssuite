# Ultimate Master Plan: Tony's Painting and Remodeling - Omni-Agent CRM & PWA Workspace

Este é o documento de arquitetura definitivo para a compilação do ecossistema full-stack. Ele consolida todas as fases do projeto, desde a infraestrutura de banco de dados até as integrações de IA, comunicação US e ferramentas de campo (PWA).

---

## 1. Stack Tecnológica Definitiva

* **Frontend & PWA:** Nuxt 3 (SSR), Tailwind CSS, Nuxt UI / Lucide Icons, configurado como Progressive Web App (PWA) para uso offline e em tablets (iPad no canteiro de obras).
* **Backend & Autenticação:** Nitro (Nuxt), NuxtAuth / JWT com controle RBAC (`MANAGER` vs `CONSULTANT`), BullMQ (Redis) para filas.
* **Banco de Dados:** SQLite (`dev.db` para desenvolvimento local ágil) / PostgreSQL via Prisma ORM em produção + Redis para cache.
* **Infraestrutura US:**
  * **Twilio:** Discador WebRTC (VoIP) nativo e automação de SMS com compliance TCPA.
  * **Amazon SES:** Inbound/Outbound para o cliente de Webmail CRM nativo com roteamento por usuário.
  * **Stripe:** Links dinâmicos de pagamento para contratos (depósito máx. 1/3 pela lei de Massachusetts).
  * **Google:** Ads API (Offline Conversions com `gclid`), Local Services Ads (Webhooks) e Google Business Profile (Reviews pós-venda).
* **Inteligência Artificial (Multi-Agent Systems - MAS):**
  * **Gemini 1.5 Flash:** Triagem ultrarrápida (<500ms) de leads e scripts de primeiro contato.
  * **Gemini 1.5 Pro (Multimodal):** Visão computacional de campo (cálculo de materiais, metragem quadrada, galões de tinta e reparos de drywall via upload de fotos no local).
  * **Claude 3.5 Sonnet:** Estratégia de copy, orçamentos detalhados e geração de contratos padronizados sob a legislação de Massachusetts (MA HIC M.G.L. c. 142A).
  * **OpenAI Realtime API + Whisper:** Atendimento de voz autônomo e transcrição/análise de sentimento de ligações.
  * **GPT-4o:** Copiloto integrado ao Webmail para redação corporativa persuasiva e reengajamento por SMS.
  * **DALL-E 3:** Renderização visual de ambientes (Antes e Depois) para aprovação imediata do cliente.

---

## 2. Esquema de Banco de Dados Completo (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String         @id @default(cuid())
  email     String         @unique
  name      String?
  password  String         @default("admin123")
  role      String         @default("CONSULTANT")
  avatarUrl String?
  leads     Lead[]
  emails    EmailMessage[]
  createdAt DateTime       @default(now())
}

model Lead {
  id                  String            @id @default(cuid())
  source              String
  campaignId          String?
  campaignName        String?
  keyword             String?
  gclid               String?
  matchType           String?
  device              String?
  city                String?
  state               String?
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
  status              String            @default("NOVO")
  ownerId             String?
  owner               User?             @relation(fields: [ownerId], references: [id])
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
  emails              EmailMessage[]
  media               Media[]

  @@index([source])
  @@index([status])
  @@index([ownerId])
  @@index([createdAt])
}

model Media {
  id         String   @id @default(cuid())
  leadId     String
  lead       Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  url        String
  type       String
  aiAnalysis String?
  createdAt  DateTime @default(now())

  @@index([leadId])
}
```

---

## 3. As 10 Macros de Infraestrutura (Execução Total)

1. **Fundações PWA e DB:** Nuxt 3 responsivo com cache e suporte offline para tablets no campo (iPad). Prisma ORM com suporte a SQLite local e PostgreSQL em produção.
2. **Segurança (RBAC):** Autenticação com papéis isolados (`MANAGER` com visão total financeira/auditoria; `CONSULTANT` restrito a seus próprios leads, agenda e e-mails).
3. **CRM e Roleta de Leads:** Kanban interativo em `/dashboard/leads` com endpoint atômico `/api/leads/claim.post.ts` contra concorrência simultânea.
4. **Captação de Tráfego:** Landing Pages híbridas dinâmicas (`[slug].vue`) com injeção automática de parâmetros ValueTrack (`{keyword}`, `{city}`).
5. **Cliente Webmail In-App:** Rota `/mail` com layout estilo Gmail, recebimento inbound via Amazon SES e copiloto GPT-4o na caixa de composição.
6. **Toolkit de Campo (PWA / Câmera / Visão Computacional):** Upload de fotos da obra direto pelo tablet com análise multimodal do Gemini 1.5 Pro (`/api/ai/vision.ts`) para cálculo de metragem e galões de tinta.
7. **Renderização de Impacto:** DALL-E 3 (`/api/ai/render.ts`) para gerar projeções de "Antes e Depois" apresentadas ao cliente na visita.
8. **Comunicação Ativa (Twilio):** Discador WebRTC nativo no navegador e automações de SMS pré e pós-visita.
9. **Fechamento e Contratos Jurídicos:** Geração de propostas padronizadas no padrão Massachusetts Home Improvement Contractor (M.G.L. c. 142A) com assinatura digital na tela e link de pagamento Stripe.
10. **Automações Pós-Venda:** Disparo automático de solicitação de avaliação no Google Business Profile e devolução de dados para o Google Ads (Offline Conversions).
