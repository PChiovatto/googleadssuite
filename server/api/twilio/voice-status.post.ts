import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getTwilioClient } from '~/server/utils/aiClients'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const callStatus = body.CallStatus || body.callStatus || 'no-answer'
  const fromNumber = body.From || body.from || '+16175550198'
  const toNumber = body.To || body.to || process.env.TWILIO_PHONE_NUMBER || '+16175550199'

  // Verifica se a chamada foi perdida
  const isMissed = ['no-answer', 'busy', 'failed', 'canceled'].includes(callStatus.toLowerCase())
  if (!isMissed) {
    return { success: true, message: 'Chamada atendida ou em andamento, sem necessidade de MCTB.' }
  }

  // Busca ou cria o Lead associado a este telefone
  let lead = await prisma.lead.findFirst({
    where: { phone: fromNumber }
  })

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        source: 'GOOGLE_ADS_CALL',
        name: 'Lead Telefônico ' + fromNumber.slice(-4),
        phone: fromNumber,
        status: 'NOVO',
        serviceInterested: 'Pintura / Reforma Residencial',
        city: 'Greater Boston',
        state: 'MA',
        notes: 'Lead gerado por chamada perdida via Google Ads / LSA.'
      }
    })
  }

  // Mensagem automática de Missed Call Text Back (MCTB)
  const mctbMessage = `Tony's Painting: Olá! Aqui é o Marcos da Tony's Painting and Remodeling. Desculpe não ter atendido agora, estou em uma obra com um cliente. Você precisa de um orçamento para pintura interna, externa ou reforma?`

  // Dispara o SMS via Twilio
  const twilio = getTwilioClient()
  if (twilio) {
    try {
      await twilio.messages.create({
        to: fromNumber,
        from: toNumber,
        body: mctbMessage
      })
    } catch (err) {
      console.warn('Twilio MCTB SMS failed (mock fallback active):', err)
    }
  }

  // Atualiza Lead e grava no ChatMessage
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      mctbTriggered: true,
      mctbStatus: 'TRIGGERED'
    }
  })

  await prisma.chatMessage.create({
    data: {
      leadId: lead.id,
      channel: 'SMS',
      direction: 'OUTBOUND',
      from: toNumber,
      to: fromNumber,
      body: mctbMessage,
      aiGenerated: true
    }
  })

  // Registra no CallLog como tentativa perdida
  await prisma.callLog.create({
    data: {
      leadId: lead.id,
      agentId: 'system_mctb',
      agentName: 'MCTB Auto-Responder',
      durationSeconds: 0,
      sentiment: 'NEUTRAL',
      isAiRescue: true,
      rescueReason: `MISSED_CALL_STATUS_${callStatus.toUpperCase()}`
    }
  })

  return {
    success: true,
    leadId: lead.id,
    mctbTriggered: true,
    message: mctbMessage
  }
})
