import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getTwilioClient, getGeminiModel } from '~/server/utils/aiClients'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const fromNumber = body.From || body.from || ''
  const toNumber = body.To || body.to || process.env.TWILIO_PHONE_NUMBER || '+16175550199'
  const messageBody = body.Body || body.body || ''

  if (!fromNumber || !messageBody) {
    return { success: false, message: 'From e Body são obrigatórios' }
  }

  // Localiza ou cria o Lead
  let lead = await prisma.lead.findFirst({
    where: { phone: fromNumber }
  })

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        source: 'INBOUND_SMS',
        name: 'Lead SMS ' + fromNumber.slice(-4),
        phone: fromNumber,
        status: 'NOVO',
        serviceInterested: 'Pintura / Reforma'
      }
    })
  }

  // Registra a mensagem recebida no ChatMessage
  await prisma.chatMessage.create({
    data: {
      leadId: lead.id,
      channel: 'SMS',
      direction: 'INBOUND',
      from: fromNumber,
      to: toNumber,
      body: messageBody
    }
  })

  // Prepara resposta com Gemini 1.5 Flash
  let aiReply = `Obrigado pelo retorno! Nossa equipe técnica atende em toda a Grande Boston e região. Qual seria o seu endereço ou cidade para agendarmos uma avaliação gratuita?`

  try {
    const gemini = getGeminiModel('gemini-1.5-flash')
    if (gemini) {
      const prompt = `Você é Marcos, consultor sênior da Tony's Painting and Remodeling em Massachusetts (EUA).
O cliente enviou a seguinte mensagem por SMS: "${messageBody}".
Histórico do cliente: Nome: ${lead.name}, Cidade: ${lead.city || 'Massachusetts'}, Serviço: ${lead.serviceInterested || 'Pintura'}.
Responda de forma calorosa, profissional, curta e objetiva (máximo 2 a 3 frases, ideal para SMS).
Peça o endereço/cidade ou sugira agendar uma estimativa presencial gratuita amanhã às 10h ou 14h.
Responda em português (se o cliente falou português) ou inglês (se falou inglês).`

      const result = await gemini.generateContent(prompt)
      const text = result.response.text()
      if (text && text.trim().length > 0) {
        aiReply = text.trim()
      }
    }
  } catch (err) {
    console.warn('Gemini SMS auto-responder fallback:', err)
  }

  // Dispara resposta por SMS via Twilio
  const twilio = getTwilioClient()
  if (twilio) {
    try {
      await twilio.messages.create({
        to: fromNumber,
        from: toNumber,
        body: aiReply
      })
    } catch (err) {
      console.warn('Twilio response SMS failed:', err)
    }
  }

  // Salva a resposta da IA no ChatMessage
  await prisma.chatMessage.create({
    data: {
      leadId: lead.id,
      channel: 'SMS',
      direction: 'OUTBOUND',
      from: toNumber,
      to: fromNumber,
      body: aiReply,
      aiGenerated: true
    }
  })

  // Atualiza status do MCTB para ENGAGED
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      mctbStatus: 'ENGAGED',
      status: 'EM_ATENDIMENTO'
    }
  })

  return {
    success: true,
    leadId: lead.id,
    customerMessage: messageBody,
    aiReply
  }
})
