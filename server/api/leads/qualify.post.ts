import { defineEventHandler, readBody } from 'h3'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { leadId } = body || {}

    if (!leadId) {
      return { success: false, error: 'ID do Lead é obrigatório' }
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado' }
    }

    const config = useRuntimeConfig()
    let aiScore = 8
    let aiQualification = ''
    let whatsappScript = ''

    if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(config.geminiApiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `
Você é o Diretor Comercial e Estrategista de Vendas da "Tony's Painting and Remodeling" (Boston e Massachusetts).
Analise as informações do seguinte lead:
- Nome: ${lead.name}
- Origem: ${lead.source} (ex: GOOGLE_ADS ou GOOGLE_BUSINESS)
- Campanha de Origem: ${lead.campaignName || 'Direto/Maps'}
- Serviço Solicitado: ${lead.serviceInterested || 'Pintura geral'}
- Detalhes / Observações: ${lead.notes || 'Sem observações'}

Tarefa:
Responda em formato JSON estrito com as seguintes chaves:
{
  "aiScore": <número inteiro de 1 a 10 indicando a propensão de fechamento>,
  "aiQualification": "<parágrafo conciso avaliando o perfil do lead, urgência e valor estimado>",
  "whatsappScript": "<mensagem pronta, empática e persuasiva para o vendedor enviar pelo WhatsApp ou SMS convidando para um orçamento gratuito no local>"
}
Não inclua crases de markdown além do bloco json.
        `

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)

        aiScore = parsed.aiScore || 8
        aiQualification = parsed.aiQualification || 'Lead qualificado via Gemini.'
        whatsappScript = parsed.whatsappScript || 'Olá! Vimos seu pedido de orçamento.'
      } catch (geminiError: any) {
        console.warn('Gemini live call fallback for lead qualification:', geminiError?.message)
        const fallback = generateLeadQualificationFallback(lead)
        aiScore = fallback.aiScore
        aiQualification = fallback.aiQualification
        whatsappScript = fallback.whatsappScript
      }
    } else {
      const fallback = generateLeadQualificationFallback(lead)
      aiScore = fallback.aiScore
      aiQualification = fallback.aiQualification
      whatsappScript = fallback.whatsappScript
    }

    // Update lead in Prisma DB
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        aiScore,
        aiQualification,
        whatsappScript
      }
    })

    return {
      success: true,
      lead: updatedLead
    }
  } catch (err: any) {
    console.error('Erro ao qualificar lead com IA:', err)
    return {
      success: false,
      error: err?.message || 'Falha ao qualificar lead'
    }
  }
})

function generateLeadQualificationFallback(lead: any) {
  const isGbp = lead.source === 'GOOGLE_BUSINESS'
  const sourceName = isGbp ? 'Google Meu Negócio (Maps)' : 'Google Ads'
  const service = lead.serviceInterested || 'serviços de pintura'

  return {
    aiScore: isGbp ? 9 : 8,
    aiQualification: `Lead de alta qualidade originado via ${sourceName}. Demonstra interesse específico em "${service}". Probabilidade alta de fechamento com resposta rápida em menos de 15 minutos.`,
    whatsappScript: `Olá ${lead.name}, tudo bem? Aqui é da equipe Tony's Painting and Remodeling! Recebemos sua mensagem através do ${sourceName} sobre ${service}. Gostaríamos de oferecer um orçamento gratuito no seu local (Free Estimate). Que dia desta semana seria mais conveniente para uma visita rápida da nossa equipe?`
  }
}
