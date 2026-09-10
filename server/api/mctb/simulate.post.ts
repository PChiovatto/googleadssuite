import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    phone = '+1 (617) 555-0198',
    customerName = 'Cliente Simulação Boston',
    customerReply = 'Oi, vi o anúncio no Google. Gostaria de um orçamento para pintar 3 quartos e a sala.'
  } = body

  // 1. Cria ou atualiza lead
  let lead = await prisma.lead.findFirst({
    where: { phone }
  })

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        source: 'GOOGLE_ADS_CALL',
        name: customerName,
        phone,
        status: 'NOVO',
        serviceInterested: 'Pintura Interna 3 Quartos + Sala',
        city: 'Newton',
        state: 'MA'
      }
    })
  }

  // 2. Dispara a lógica de Missed Call
  const mctbMessage = `Tony's Painting: Olá ${customerName}! Aqui é o Marcos da Tony's Painting and Remodeling. Desculpe não ter atendido agora, estou em uma obra com um cliente. Você precisa de um orçamento para pintura interna, externa ou reforma?`

  await prisma.chatMessage.create({
    data: {
      leadId: lead.id,
      channel: 'SMS',
      direction: 'OUTBOUND',
      from: '+1 (617) 555-0199',
      to: phone,
      body: mctbMessage,
      aiGenerated: true
    }
  })

  // 3. Simula a resposta do cliente
  await prisma.chatMessage.create({
    data: {
      leadId: lead.id,
      channel: 'SMS',
      direction: 'INBOUND',
      from: phone,
      to: '+1 (617) 555-0199',
      body: customerReply
    }
  })

  // 4. IA responde
  const aiFollowUp = `Perfeito! Nós fazemos preparação completa de paredes com lixamento e 2 demãos de Sherwin-Williams Emerald em Newton e região. Temos horários para avaliação presencial gratuita amanhã às 10h ou 14h. Qual horário fica melhor para você?`

  await prisma.chatMessage.create({
    data: {
      leadId: lead.id,
      channel: 'SMS',
      direction: 'OUTBOUND',
      from: '+1 (617) 555-0199',
      to: phone,
      body: aiFollowUp,
      aiGenerated: true
    }
  })

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      mctbTriggered: true,
      mctbStatus: 'ENGAGED',
      status: 'EM_ATENDIMENTO'
    }
  })

  return {
    success: true,
    leadId: lead.id,
    leadName: lead.name,
    phone,
    steps: [
      { step: '1. Chamada Perdida Detectada', status: 'MISSED_CALL' },
      { step: '2. SMS MCTB Disparado em 5s', message: mctbMessage },
      { step: '3. Cliente Respondeu por SMS', message: customerReply },
      { step: '4. Gemini 1.5 Flash Respondeu', message: aiFollowUp }
    ]
  }
})
