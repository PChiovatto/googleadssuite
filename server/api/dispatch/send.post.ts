import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getTwilioClient } from '~/server/utils/aiClients'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    leadId,
    technicianName = 'Marcos Silva',
    technicianRole = 'Consultor Técnico & Estimador Sênior',
    technicianPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    technicianPhone = '+1 (617) 555-0199',
    vehicleDescription = 'Van Ford Transit Branca #04 - Tony\'s Remodeling',
    etaMinutes = 14
  } = body

  if (!leadId) {
    throw createError({ statusCode: 400, statusMessage: 'leadId é obrigatório' })
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead não encontrado' })
  }

  const token = 'trk_' + crypto.randomBytes(8).toString('hex')
  const origin = process.env.AUTH_ORIGIN || 'http://localhost:3000'
  const trackingUrl = `${origin}/track/${token}`

  // Cria registro de despacho
  const dispatch = await prisma.dispatchTracker.create({
    data: {
      leadId,
      token,
      technicianName,
      technicianRole,
      technicianPhoto,
      technicianPhone,
      vehicleDescription,
      licenseNumber: 'MA HIC #192847 | EPA Certified',
      status: 'DISPATCHED',
      destAddress: lead.address || `${lead.city || 'Newton'}, MA`,
      etaMinutes: Number(etaMinutes) || 15
    }
  })

  // Dispara SMS ao cliente avisando que o técnico está a caminho com o link do mapa
  if (lead.phone) {
    const twilio = getTwilioClient()
    const smsMessage = `Tony's Painting: Olá ${lead.name}! Nosso consultor ${technicianName} já está a caminho para a avaliação do seu imóvel. Acompanhe a aproximação no mapa ao vivo e veja os dados da van e licença aqui: ${trackingUrl}`
    if (twilio) {
      try {
        await twilio.messages.create({
          to: lead.phone,
          from: process.env.TWILIO_PHONE_NUMBER || '+16175550199',
          body: smsMessage
        })
      } catch (err) {
        console.warn('Twilio dispatch SMS failed (mock fallback active):', err)
      }
    }
  }

  // Registra no ChatMessage
  await prisma.chatMessage.create({
    data: {
      leadId,
      channel: 'SMS',
      direction: 'OUTBOUND',
      to: lead.phone,
      body: `[TÉCNICO A CAMINHO]: ${technicianName} despachado (ETA: ${etaMinutes} min). Link de rastreamento: ${trackingUrl}`
    }
  })

  return {
    success: true,
    dispatch,
    trackingUrl
  }
})
