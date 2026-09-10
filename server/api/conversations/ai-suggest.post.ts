import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getGeminiModel } from '~/server/utils/aiClients'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { leadId, intent = 'FOLLOW_UP' } = body

  if (!leadId) {
    throw createError({ statusCode: 400, statusMessage: 'leadId é obrigatório' })
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      chatMessages: { take: 5, orderBy: { createdAt: 'desc' } },
      estimates: { take: 1, orderBy: { createdAt: 'desc' } }
    }
  })

  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead não encontrado' })
  }

  let suggestion = ''
  try {
    const gemini = getGeminiModel('gemini-1.5-flash')
    if (gemini) {
      const prompt = `Você é Marcos, consultor comercial sênior da Tony's Painting and Remodeling em Boston/MA.
Gere uma sugestão de resposta curta, persuasiva e direta para o cliente ${lead.name} (${lead.serviceInterested || 'Pintura'}).
Objetivo da mensagem: ${intent} (opções: FOLLOW_UP, CONFIRMAR_VISITA, OFERECER_DESCONTO_FECHAMENTO).
Última mensagem trocada: "${lead.chatMessages[0]?.body || 'Sem mensagens recentes'}".
Responda em tom profissional, caloroso e focado em fechar contrato com conformidade MA HIC.`

      const result = await gemini.generateContent(prompt)
      suggestion = result.response.text()?.trim() || ''
    }
  } catch (err) {
    console.warn('Gemini AI suggest fallback:', err)
  }

  if (!suggestion) {
    suggestion = `Olá ${lead.name}, tudo bem? Aqui é o Marcos da Tony's Painting. Gostaria de verificar se ficou alguma dúvida em relação ao seu projeto. Conseguimos agendar a visita da equipe técnica para esta semana?`
  }

  return {
    success: true,
    suggestion
  }
})
