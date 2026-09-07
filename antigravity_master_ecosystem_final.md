# Master Instruction Document: US Market Omni-Agent CRM, Email Marketing & Ads Ecosystem

Este documento consolida a arquitetura mestre completa e definitiva para o ecossistema de alta performance no mercado norte-americano, integrando banco de dados relacional, roleta atômica de leads (Lead Claiming), infraestrutura US (Twilio VoIP/SMS, Stripe Payments), base de e-mail marketing nativa, landing pages dinâmicas SSR e uma orquestração Omni-Agent Multi-AI (Google Gemini, Anthropic Claude, OpenAI).

---

## 1. Stack Tecnológica Definitiva
* **Frontend & SSR:** Nuxt 3 + Tailwind CSS + Lucide Icons (Server-Side Rendering para Landing Pages dinâmicas).
* **Backend & Filas:** Nitro (Nuxt) + BullMQ/Redis readiness para processamento assíncrono.
* **Banco de Dados:** Prisma ORM com SQLite (local imediato) e compatibilidade total com PostgreSQL.
* **Infraestrutura US:** Twilio (Voice VoIP / SMS local), Stripe (Pagamentos digitais), Google Ads & Local Services Ads (LSA).
* **Orquestração Omni-Agent Multi-AI:**
  * **Google Gemini 1.5 Flash:** Triagem instantânea (<500ms), cálculo de urgência e roteamento de leads.
  * **OpenAI Whisper + Google Gemini 1.5 Pro:** Transcrição de alta precisão (Whisper) e auditoria de negociação multimodal (Gemini Pro).
  * **Anthropic Claude 3.5 Sonnet:** Estratégia de tráfego, maximização de ROAS e redação de copies de alta conversão.
  * **OpenAI Realtime API:** Atendimento de voz autônomo conectado ao Twilio Voice.
  * **OpenAI GPT-4o:** Reengajamento por SMS para leads frios e sequências de e-mail marketing.
  * **OpenAI DALL-E 3:** Geração dinâmica de imagens contextuais para landing pages.

---

## 2. Orquestração Multi-Agent (`server/api/ai/`)

| Rota | Modelo AI | Função Principal |
| :--- | :--- | :--- |
| `/api/ai/triage` | **Gemini 1.5 Flash** | Triagem sub-segundo, urgência, intenção e auto-atribuição |
| `/api/ai/audit` | **Whisper + Gemini 1.5 Pro** | Transcrição de áudio e auditoria de conformidade/negociação |
| `/api/ai/strategy` | **Claude 3.5 Sonnet** | Auditoria de ROAS, análise de tráfego e copywriter de anúncios/LPs |
| `/api/ai/voice-agent` | **OpenAI Realtime API** | Atendente telefônico autônomo 24/7 via Twilio Voice |
| `/api/ai/followup` | **OpenAI GPT-4o** | Reengajamento por SMS e sequências de e-mail marketing |
| `/api/ai/render` | **OpenAI DALL-E 3** | Geração dinâmica de criativos e hero visual para Landing Pages |

---

## 3. Conformidade Regulatória Americana
* **TCPA (Telephone Consumer Protection Act):** Opt-in obrigatório registrado em banco de dados antes de qualquer disparo de SMS ou chamada automatizada.
* **Audit Trail:** Registro imutável de ações (`AuditLog`) para compliance e auditoria interna.
* **SLA de Resposta (Speed-to-Lead):** Métrica calculada em tempo real (`claimedAt - createdAt`) para monitorar o tempo de atendimento da equipe.
* **Stripe Checkout:** Cobrança automatizada com webhook de retroalimentação para o Google Ads (Offline Conversions).
