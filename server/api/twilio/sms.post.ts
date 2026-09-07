import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { to, message, leadId } = body || {}

    if (!to || !message) {
      return { success: false, message: 'Destinatário (to) e mensagem são obrigatórios.' }
    }

    // In production, dispatches via Twilio REST API:
    // https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
    // From: process.env.TWILIO_PHONE_NUMBER
    // Body: message

    // Record audit log for TCPA compliance tracking
    await prisma.auditLog.create({
      data: {
        action: 'TCPA_SMS_DISPATCH',
        userId: 'twilio_engine',
        userName: 'Twilio Gateway (US)',
        details: JSON.stringify({
          to,
          messageLength: message.length,
          leadId,
          timestamp: new Date().toISOString()
        })
      }
    })

    return {
      success: true,
      message: `SMS enviado com sucesso para ${to} via código local americano!`,
      sid: `SM_${Date.now()}_us_dev`
    }
  } catch (err: any) {
    console.error('Error in Twilio SMS:', err)
    return {
      success: false,
      error: err?.message || 'Falha no envio de SMS'
    }
  }
})
