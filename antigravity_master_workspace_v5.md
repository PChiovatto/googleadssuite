# Master Instruction Document: US Market Omni-Agent CRM & Ultimate Workspace (v5)

Este documento contém a instrução mestre definitiva e consolidada do ecossistema corporativo de alta performance. Esta versão (v5) introduz a arquitetura de **Workspace Individualizado (RBAC Estrito)** e o **Cliente de Webmail Nativo In-App (Estilo Gmail)** integrado ao Amazon SES (Inbound e Outbound).

---

## 1. Stack Tecnológica Definitiva

* **Frontend & SSR:** Nuxt 3 (SSR + Nitro) + Tailwind CSS + Nuxt UI / Lucide Icons.
* **Backend & Autenticação:** Nitro Server Engine + Cookie/JWT Session Auth + BullMQ (Redis).
* **Banco de Dados:** SQLite (`dev.db` para desenvolvimento ágil) / PostgreSQL (Produção) via Prisma ORM.
* **Infraestrutura US:**
  * **Twilio:** Discador VoIP WebRTC, Gravações e SMS automáticos para agendamentos e follow-up.
  * **Stripe:** Links dinâmicos de Checkout para depósitos (máx. 1/3 pela lei de MA) e liquidação de contratos.
  * **Amazon SES (Simple Email Service):** Envio em massa seguro e recebimento inbound via webhook roteado para caixas individuais dos consultores.
  * **Google Ads API & LSA:** Captura de Leads via Webhooks e disparo de Offline Conversions (`gclid`).
* **Inteligência Artificial (Multi-Agent Systems - MAS):**
  * **Gemini 1.5 Flash:** Triagem ultrarrápida (<500ms) de leads e roteiros de primeiro contato.
  * **Gemini 1.5 Pro + Whisper:** Transcrição de áudio, detecção de objeções e coaching de vendas.
  * **Claude 3.5 Sonnet:** Auditoria estratégica de tráfego pago, ROAS e redação de anúncios para Massachusetts.
  * **OpenAI Realtime API:** Assistente telefônico autônomo conectado ao Twilio Voice.
  * **GPT-4o:** Copiloto de redação de e-mails embutido no Webmail e disparos automatizados de SMS TCPA.
  * **DALL-E 3:** Geração de hero images dinâmicas e contextuais para as Landing Pages.

---

## 2. Esquema do Banco de Dados Atualizado (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // ou "postgresql" em produção
  url      = env("DATABASE_URL")
}

model User {
  id        String         @id @default(cuid())
  email     String         @unique
  name      String?
  password  String         @default("admin123")
  role      String         @default("CONSULTANT") // "MANAGER" ou "CONSULTANT"
  avatarUrl String?
  leads     Lead[]
  emails    EmailMessage[]
  createdAt DateTime       @default(now())
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
  emails              EmailMessage[]

  @@index([source])
  @@index([status])
  @@index([ownerId])
  @@index([createdAt])
}

model EmailMessage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  leadId    String?
  lead      Lead?    @relation(fields: [leadId], references: [id], onDelete: SetNull)
  direction String   // 'INBOUND' (Recebido) ou 'OUTBOUND' (Enviado)
  folder    String   @default("INBOX") // INBOX, SENT, STARRED, DRAFTS, TRASH
  from      String
  to        String
  subject   String
  body      String   // Conteúdo HTML ou texto
  read      Boolean  @default(false)
  starred   Boolean  @default(false)
  messageId String?  // ID de rastreio Amazon SES
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([leadId])
  @@index([folder])
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

## 3. Arquitetura de Workspace Individualizado (RBAC Estrito)

### 3.1 Visão do Gestor (`role: MANAGER`)
* **Acesso Irrestrito ("Modo Deus"):**
  * Visualização e edição de todos os leads de todos os consultores.
  * Acesso ao painel analítico do Google Ads (`/dashboard`).
  * Acesso ao Relatório Financeiro e ROAS Real (`/dashboard/financial`).
  * Acesso ao Ranking da Equipe e SLA de Atendimento (`/admin/performance`).
  * Gestão de Conexões e Credenciais da Suíte (`/settings`).
  * Leitura e envio de e-mails corporativos globais.

### 3.2 Visão do Consultor (`role: CONSULTANT`)
* **Área de Foco Operacional:**
  * Oculta menus financeiros, campanhas globais do Google e configurações.
  * Exibe unicamente:
    1. **Funil de Leads & CRM (`/dashboard/leads`):** Leads novos na roleta e leads assumidos pelo próprio consultor.
    2. **Webmail In-App (`/mail`):** Sua caixa de entrada individual sincronizada com seu endereço corporativo (`consultant@bostonpaintersandservices.com`).
    3. **Agenda & In-Home Estimates (`/dashboard/calendar`):** Suas visitas agendadas com disparo de SMS Twilio.
    4. **Central VoIP (`/dashboard/calls`):** Discador para contato telefônico direto.
    5. **Campanhas de E-mail Marketing (`/dashboard/marketing`):** Disparos para contatos da sua base.

### 3.3 Alternador Instantâneo de Usuários no Cabeçalho
No topo da interface (`layouts/default.vue`), há um seletor dinâmico que permite alternar a sessão entre:
* **👑 Gestor:** Marcos Silva (`marcos@bostonpaintersandservices.com`)
* **👤 Consultor 1:** John Miller (`john@bostonpaintersandservices.com`)
* **👤 Consultora 2:** Sarah Jenkins (`sarah@bostonpaintersandservices.com`)

---

## 4. O Cliente de Webmail In-App (`/mail`) - Estilo Gmail

Desenvolvido em `pages/mail/index.vue`, o cliente de e-mail replica fielmente a usabilidade e produtividade do Gmail:
1. **Pastas Nativas:** Entrada (`INBOX`), Com Estrela (`STARRED`), Enviados (`SENT`), Lixeira (`TRASH`).
2. **Contexto CRM Conectado:** Ao abrir um e-mail de um cliente, o painel exibe um card lateral com os dados do lead (Nome, Telefone, Serviço, Valor do Contrato) e botões para *Gerar Contrato MA*, *Agendar Visita* ou *Abrir no Funil CRM*.
3. **Copiloto de Redação IA (GPT-4o):**
   * Botões com 1 clique para gerar minutas de *Proposta Comercial & Prep Work*, *Confirmação de In-Home Estimate*, *Desconto de 5% à Vista* e *Follow-up de Visita*.
   * Injeção automática do timbre corporativo da First Boston Painters and Services Corp. e link de opt-out CAN-SPAM.
4. **Roteamento Inbound Amazon SES:**
   * O endpoint `server/api/mail/inbound.post.ts` escuta mensagens de clientes externos, identifica o destinatário e deposita a mensagem exclusivamente na caixa do consultor responsável.

---

## 5. Instrução Máster para o Agente Antigravity

```markdown
> "Atue como Arquiteto de Software Sênior. Valide e mantenha a aplicação Nuxt 3 completa, integrando todas as funcionalidades abaixo:
> 
> 1. Autenticação e RBAC Estrito: Sessão com papéis MANAGER vs CONSULTANT, com mutabilidade visual completa da interface e ocultação de relatórios financeiros para consultores.
> 2. Cliente Webmail In-App (/mail): Interface inspirada no Gmail com pastas (Inbox, Starred, Sent), leitor dividido, vínculo com lead CRM e Copiloto de redação GPT-4o.
> 3. Roteamento Inbound Amazon SES: Endpoint server/api/mail/inbound.post.ts para receber e-mails externos e depositar na caixa do consultor correspondente.
> 4. Roleta de Leads Atômica: server/api/leads/claim.post.ts com trava de concorrência atômica e proteção contra disputas.
> 5. Landing Pages Híbridas (SSR): pages/[slug].vue adaptando-se em tempo real a parâmetros ValueTrack (keyword, city, device, gclid).
> 6. Orquestração Multi-Agent (server/api/ai/):
>    - triage.ts (Gemini Flash), audit.ts (Whisper + Gemini Pro), strategy.ts (Claude 3.5 Sonnet), voice-agent.ts (OpenAI Realtime), followup.ts (GPT-4o), render.ts (DALL-E 3).
> 7. Infraestrutura US: Twilio (WebRTC discador/SMS) e Stripe (links de checkout de sinal e contrato).
> 8. Agendamento Inteligente: server/api/calendar/ e /dashboard/calendar com lembretes SMS Twilio.
> 9. Reputação (GBP): Solicitação automatizada de avaliação 5 estrelas no Google Maps pós-venda.
> 10. Analytics Financeiro: /dashboard/financial cruzando os custos do Google Ads com o faturamento de contratos fechados.
> 11. Contratos MA HIC & Assinatura Digital: Gerador de contratos M.G.L. c. 142A (depósito máx 1/3) e portal /contracts/[id].vue."
```

---

## 6. Procedimento de Validação & Execução

```powershell
# 1. Sincronizar Prisma
npx.cmd prisma db push
npx.cmd prisma generate

# 2. Compilar Produção Nuxt 3
npx.cmd nuxi build

# 3. Rodar Servidor Nitro
node.exe .output/server/index.mjs
```
