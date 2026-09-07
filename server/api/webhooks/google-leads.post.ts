import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate Google Ads Lead Form webhook payload
    // Google Ads sends user_column_data with column_id like 'FULL_NAME', 'EMAIL', 'PHONE_NUMBER', etc.
    const userColumns = body?.user_column_data || []

    const getField = (columnId: string) => {
      const match = userColumns.find((c: any) => c.column_id === columnId)
      return match?.string_value || null
    }

    const name = getField('FULL_NAME') || body?.name || 'Cliente Google Ads'
    const email = getField('EMAIL') || body?.email || null
    const phone = getField('PHONE_NUMBER') || body?.phone || null
    const postalCode = getField('POSTAL_CODE') || body?.postal_code || ''
    const service = getField('CUSTOM_QUESTION') || body?.service || 'Pintura Residencial / Comercial'

    const campaignId = body?.campaign_id ? String(body.campaign_id) : null

    // Look up campaign name if known
    let campaignName = 'Google Ads Lead Form'
    if (campaignId) {
      const campaign = await prisma.campaignMetrics.findFirst({
        where: { campaignId }
      })
      if (campaign) campaignName = campaign.campaignName
    }

    const newLead = await prisma.lead.create({
      data: {
        source: 'GOOGLE_ADS',
        campaignId,
        campaignName,
        name,
        email,
        phone,
        serviceInterested: postalCode ? `${service} (CEP/ZIP: ${postalCode})` : service,
        status: 'NOVO',
        rawData: JSON.stringify(body || {}),
        notes: 'Capturado automaticamente via Webhook do Google Ads'
      }
    })

    return {
      status: 'success',
      message: 'Lead recebido e registrado com sucesso!',
      leadId: newLead.id
    }
  } catch (error: any) {
    console.error('Erro ao processar Webhook do Google Ads:', error)
    return {
      status: 'error',
      message: error?.message || 'Falha ao processar webhook'
    }
  }
})
