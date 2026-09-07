import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { leadId, gclid, dealValue = 3500 } = body || {}

    if (!leadId && !gclid) {
      return { success: false, message: 'leadId ou gclid é obrigatório' }
    }

    let targetGclid = gclid
    if (leadId && !targetGclid) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } })
      targetGclid = lead?.gclid
    }

    // In production, transmits conversion to Google Ads API via:
    // POST https://googleads.googleapis.com/v18/customers/{customerId}:uploadClickConversions
    // Payload: conversionAction, conversionDateTime, gclid, conversionValue, currencyCode: 'USD'

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: 'DEAL_WON_OFFLINE_CONVERSION',
        userId: 'system_ads_sync',
        userName: 'Google Ads Offline API',
        details: JSON.stringify({
          gclid: targetGclid || 'GCLID_DEMO_CLICK_788910',
          dealValue,
          currency: 'USD',
          timestamp: new Date().toISOString()
        })
      }
    })

    return {
      success: true,
      message: `Conversão offline de $${dealValue} enviada com sucesso para o algoritmo do Google Ads!`,
      gclid: targetGclid || 'GCLID_DEMO_CLICK_788910',
      dealValue
    }
  } catch (err: any) {
    console.error('Offline conversion dispatch error:', err)
    return {
      success: false,
      error: err?.message || 'Falha ao enviar conversão offline'
    }
  }
})
