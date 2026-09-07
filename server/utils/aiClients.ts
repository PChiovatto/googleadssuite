import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import twilio from 'twilio'
import Stripe from 'stripe'

// Singleton Client Holders
let geminiClient: GoogleGenerativeAI | null = null
let anthropicClient: Anthropic | null = null
let openAIClient: OpenAI | null = null
let twilioClient: any = null
let stripeClient: Stripe | null = null

export function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini')) {
    return null
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey)
  }
  return geminiClient
}

export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_anthropic')) {
    return null
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_openai')) {
    return null
  }
  if (!openAIClient) {
    openAIClient = new OpenAI({ apiKey })
  }
  return openAIClient
}

export function getTwilioClient(): any {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || sid.includes('your_twilio') || token.includes('your_twilio')) {
    return null
  }
  if (!twilioClient) {
    twilioClient = twilio(sid, token)
  }
  return twilioClient
}

export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.trim() === '' || key.includes('your_stripe')) {
    return null
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

// ==========================================
// Contextual Simulation Fallbacks
// (High-fidelity domain intelligence when keys are omitted)
// ==========================================

export function simulateGeminiTriage(lead: any) {
  const service = lead.serviceInterested || lead.serviceType || 'Serviços de Pintura'
  const city = lead.city || 'Boston'
  const state = lead.state || 'MA'
  const isEmergency = (lead.keyword || '').toLowerCase().includes('urgent') || 
                      (lead.keyword || '').toLowerCase().includes('emergency') ||
                      (lead.notes || '').toLowerCase().includes('rápido')

  const score = isEmergency ? 9 : 8
  const priority = isEmergency ? 'HOT' : 'WARM'
  const urgency = isEmergency ? 'HIGH' : 'MEDIUM'

  return {
    isSimulation: true,
    modelUsed: 'gemini-1.5-flash (Simulated Engine)',
    score,
    status: 'QUALIFIED',
    priority,
    urgency,
    intent: `Alta intenção de contratação para ${service} na região metropolitana de ${city}, ${state}.`,
    budgetEstimate: isEmergency ? '$4,500 - $8,000' : '$2,800 - $5,500',
    autoAssignedReason: `Lead categorizado como ${priority} devido a busca direta por "${lead.keyword || 'local painters'}" com consentimento TCPA ativo.`,
    recommendedAction: 'Disparar ligação imediata em até 3 minutos ou SMS de confirmação de visita para orçamento gratuito.',
    suggestedScript: `Hi ${lead.name || 'there'}! This is First Boston Painters & Services. We received your request for ${service} in ${city}. Are you available for a free in-home estimate tomorrow at 10 AM?`
  }
}

export function simulateGeminiAudit(callData: any) {
  return {
    isSimulation: true,
    modelUsed: 'whisper-1 + gemini-1.5-pro (Simulated Engine)',
    transcription: callData.transcription || `Consultor: Hello, thank you for calling First Boston Painters! My name is Marcos. Am I speaking with the homeowner?
Cliente: Yes, hi Marcos. I need an exterior paint job for a 3-bedroom colonial in Newton, Massachusetts. Some wood on the front porch might be rotting.
Consultor: Perfect, we specialize in exterior carpentry and rotted wood replacement before priming with high-grade oil primer. Are you looking to have this completed within the next 2 weeks?
Cliente: Yes, exactly before the winter sets in. Can someone come over for a free estimate?
Consultor: Absolutely! I have our senior estimator available this Thursday at 2:00 PM. I will send you a text confirmation right now.
Cliente: Sounds great, see you Thursday!`,
    summary: 'Cliente proprietário em Newton, MA buscando pintura externa com reparo de madeira apodrecida na varanda. Prazo de conclusão em 2 semanas.',
    sentimentScore: 'POSITIVE',
    tcpaDisclosed: true,
    objectionsDetected: ['Preocupação com durabilidade do acabamento no inverno', 'Madeira apodrecida'],
    objectionHandlingScore: 9,
    coachingTips: [
      'Excelente confirmação rápida de propriedade e urgência de tempo.',
      'Reforçou a preparação com primer a óleo, que elimina dúvidas de durabilidade.',
      'Sugerido: Lembrar de mencionar a garantia de 5 anos de pintura e aceitação de cartão de crédito.'
    ],
    nextSteps: 'Agendamento presencial confirmado para Quinta-feira às 14h. Enviar SMS com dados do técnico.'
  }
}

export function simulateClaudeStrategy(metrics: any) {
  return {
    isSimulation: true,
    modelUsed: 'claude-3-5-sonnet-latest (Simulated Engine)',
    summary: 'Auditoria Estratégica de Performance Google Ads & Maximização de ROAS',
    findings: [
      'Palavras-chave de cauda longa com geolocalização ("boston interior painters", "cabinet painting massachusetts") estão gerando ROAS de 4.2x com CPA abaixo de $45.',
      'Termos amplos sem modificador de cidade apresentam taxa de rejeição de 48% e devem receber correspondência de frase com negativação em nível de campanha.',
      'Oportunidade imediata: Ativar lances dinâmicos para dispositivos móveis com aumento de +25% entre 08h e 18h EST.'
    ],
    negativeKeywordsRecommended: [
      'free', 'diy', 'spray gun rental', 'home depot paint price', 'curso', 'vagas de emprego'
    ],
    adCopyVariations: [
      {
        headline: 'First Boston Painters | Licensed & Insured Since 2015',
        subheadline: 'Free On-Site Estimates in Greater Boston & North Shore. 100% Prep Work Perfection.',
        callToAction: 'Schedule Free Quote Now'
      },
      {
        headline: 'Exterior & Interior Painting MA | Top-Rated Prep Work',
        subheadline: 'Rotted Wood Repair, Wallpaper Removal & Cabinets. Done Right The First Time.',
        callToAction: 'Call For Instant Pricing'
      }
    ],
    landingPageOptimization: 'Injetar parâmetros dinâmicos da URL {keyword} e {city} diretamente no título H1 para manter o índice de qualidade acima de 9/10 e reduzir o CPC em até 30%.'
  }
}

export function simulateGPT4oFollowup(lead: any) {
  const service = lead.serviceInterested || lead.serviceType || 'Painting Project'
  const name = lead.name || 'Friend'
  const city = lead.city || 'Boston'

  return {
    isSimulation: true,
    modelUsed: 'gpt-4o (Simulated Engine)',
    smsMessage: `Hi ${name}, this is First Boston Painters! Still need help with your ${service} in ${city}? We have a free quote spot open this week. Reply YES to grab it! Reply STOP to opt out.`,
    emailSubject: `Your Free Quote for ${service} in ${city} - First Boston Painters`,
    emailBodyHtml: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        <h2 style="color: #ff7902;">First Boston Painters & Services</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We noticed you were looking into <strong>${service}</strong> in <strong>${city}</strong>. We want to ensure your home gets the premium care and prep work it deserves.</p>
        <p><strong>Why homeowners in Massachusetts choose us:</strong></p>
        <ul>
          <li>Licensed and Insured since 2015</li>
          <li>Thorough prep work: power washing, sanding, and rotted wood replacement</li>
          <li>Free, no-obligation on-site estimates</li>
        </ul>
        <p>Would you like our estimator to stop by this week?</p>
        <p><a href="https://doorbridgefix.com/#quote-form" style="display:inline-block; background:#fc0000; color:#fff; padding:12px 24px; text-decoration:none; border-radius:30px; font-weight:bold;">SCHEDULE YOUR FREE ESTIMATE</a></p>
        <p style="font-size: 12px; color: #777; margin-top: 30px;">First Boston Painters and Services Corp. Licensed & Insured. Reply STOP to unsubscribe.</p>
      </div>
    `
  }
}

export function simulateDallERender(prompt: string) {
  return {
    isSimulation: true,
    modelUsed: 'dall-e-3 (Simulated Engine)',
    prompt,
    imageUrl: 'https://doorbridgefix.com/wp-content/uploads/2026/03/26539541-164C-4A19-8C68-8BF55A6CDDCF_1_105_c.jpg',
    aspectRatio: '16:9',
    revisedPrompt: `A photorealistic modern residential home in Boston Massachusetts, freshly painted exterior with clean trim, pristine landscaping, sunny morning light, architectural photography style.`
  }
}
