import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getTwilioClient } from '~/server/utils/aiClients'
import { sendSesEmail } from '~/server/utils/sesClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    leadId,
    channel, // 'SMS', 'EMAIL', 'INTERNAL_NOTE'
    message,
    subject = 'Mensagem - Tony\'s Painting and Remodeling'
  } = body

  if (!leadId || !message) {
    throw createError({ statusCode: 400, statusMessage: 'leadId e message são obrigatórios' })
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead não encontrado' })
  }

  let status = 'DELIVERED'

  // 1. Canal SMS
  if (channel === 'SMS') {
    if (!lead.phone) {
      throw createError({ statusCode: 400, statusMessage: 'Lead não possui telefone cadastrado para envio de SMS' })
    }
    const twilio = getTwilioClient()
    if (twilio) {
      try {
        await twilio.messages.create({
          to: lead.phone,
          from: process.env.TWILIO_PHONE_NUMBER || '+16175550199',
          body: message
        })
      } catch (err) {
        console.warn('Twilio SMS sending failed (mock mode active):', err)
      }
    }
    await prisma.chatMessage.create({
      data: {
        leadId,
        channel: 'SMS',
        direction: 'OUTBOUND',
        from: process.env.TWILIO_PHONE_NUMBER || '+1 (617) 555-0199',
        to: lead.phone,
        body: message,
        status
      }
    })
  }

  // 2. Canal E-mail
  else if (channel === 'EMAIL') {
    if (!lead.email) {
      throw createError({ statusCode: 400, statusMessage: 'Lead não possui e-mail cadastrado' })
    }
    try {
      await sendSesEmail({
        to: lead.email,
        subject,
        body: message
      })
    } catch (err) {
      console.warn('SES Email sending failed:', err)
    }
    await prisma.emailMessage.create({
      data: {
        userId: lead.ownerId || 'admin_user',
        leadId,
        direction: 'OUTBOUND',
        from: process.env.AWS_SES_FROM_EMAIL || "Tony's Painting <contact@tonyspainting.com>",
        to: lead.email,
        subject,
        body: message,
        folder: 'SENT'
      }
    })
    await prisma.chatMessage.create({
      data: {
        leadId,
        channel: 'EMAIL',
        direction: 'OUTBOUND',
        from: 'contact@tonyspainting.com',
        to: lead.email,
        subject,
        body: message,
        status
      }
    })
  }

  // 3. Nota Interna da Equipe
  else {
    await prisma.chatMessage.create({
      data: {
        leadId,
        channel: 'INTERNAL_NOTE',
        direction: 'OUTBOUND',
        from: 'Equipe Tony\'s Remodeling',
        body: message,
        status: 'SAVED'
      }
    })
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { updatedAt: new Date() }
  })

  return {
    success: true,
    channel,
    leadId,
    message
  }
})
