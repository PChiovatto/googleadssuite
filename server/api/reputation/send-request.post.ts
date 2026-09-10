import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getTwilioClient } from '~/server/utils/aiClients'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { leadId, channel = 'SMS' } = body

  if (!leadId) {
    throw createError({ statusCode: 400, statusMessage: 'leadId é obrigatório' })
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead não encontrado' })
  }

  const token = 'rev_' + crypto.randomBytes(8).toString('hex')
  const origin = process.env.AUTH_ORIGIN || 'http://localhost:3000'
  const reviewUrl = `${origin}/review/${token}`

  const reviewReq = await prisma.reviewRequest.create({
    data: {
      leadId,
      token,
      channel,
      googleReviewLink: reviewUrl,
      status: 'SENT'
    }
  })

  const smsText = `Tony's Painting: Olá ${lead.name}! Finalizamos sua obra com muito orgulho. Como foi sua experiência com nossa equipe? Avalie de 1 a 5 estrelas em 15 segundos: ${reviewUrl}`

  if (channel === 'SMS' && lead.phone) {
    const twilio = getTwilioClient()
    if (twilio) {
      try {
        await twilio.messages.create({
          to: lead.phone,
          from: process.env.TWILIO_PHONE_NUMBER || '+16175550199',
          body: smsText
        })
      } catch (err) {
        console.warn('Twilio review SMS failed (mock fallback active):', err)
      }
    }
  }

  await prisma.chatMessage.create({
    data: {
      leadId,
      channel: 'SMS',
      direction: 'OUTBOUND',
      to: lead.phone,
      body: `[SOLICITAÇÃO DE AVALIAÇÃO DISPARADA]: ${reviewUrl}`
    }
  })

  return {
    success: true,
    reviewRequest: reviewReq,
    reviewUrl
  }
})
