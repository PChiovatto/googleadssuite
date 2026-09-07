import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Google Local Services Ads webhook payload parser
    const name = body?.customer_name || body?.caller_name || 'Cliente Google LSA'
    const phone = body?.customer_phone || body?.caller_phone || '+1 (617) 555-0199'
    const service = body?.service_type || 'Google Guaranteed - Pintura Residencial'
    const city = body?.city || 'Boston'
    const state = body?.state || 'MA'

    const lead = await prisma.lead.create({
      data: {
        source: 'GOOGLE_LSA',
        name,
        phone,
        serviceInterested: `${service} (${city}, ${state})`,
        city,
        state,
        status: 'NOVO',
        notes: 'Lead recebido via Google Local Services Ads (Google Guaranteed)',
        tcpaConsent: true,
        rawData: JSON.stringify(body || {})
      }
    })

    return {
      success: true,
      message: 'Lead do Google LSA recebido e cadastrado no CRM!',
      leadId: lead.id
    }
  } catch (err: any) {
    console.error('Error in LSA webhook:', err)
    return {
      success: false,
      error: err?.message || 'Falha ao processar LSA webhook'
    }
  }
})
