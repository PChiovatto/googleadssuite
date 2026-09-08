import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))

    // 1. Detect Omnichannel Origin & Parse Payload
    let source = body?.source || 'GOOGLE_ADS'
    let utmSource = body?.utmSource || null
    let utmMedium = body?.utmMedium || 'cpc'
    let utmCampaign = body?.utmCampaign || body?.campaignName || null
    let name = body?.name || null
    let email = body?.email || null
    let phone = body?.phone || body?.phoneNumber || null
    let city = body?.city || null
    let state = body?.state || 'MA'
    let address = body?.address || null
    let zipCode = body?.zipCode || body?.postalCode || null
    let service = body?.serviceInterested || body?.serviceType || 'Interior & Exterior Painting'
    let dealValue = body?.dealValue ? parseFloat(body.dealValue) : null
    let gclid = body?.gclid || null
    let fbclid = body?.fbclid || null

    // Meta (Facebook / Instagram) Lead Ads Webhook Detection
    if (body?.entry && Array.isArray(body.entry)) {
      const entry = body.entry[0]
      const change = entry?.changes?.[0]
      const value = change?.value || {}
      
      // Determine if Instagram or Facebook
      const isInstagram = body?.platform === 'instagram' || value?.platform === 'instagram' || (value?.ad_name && value.ad_name.toLowerCase().includes('instagram'))
      source = isInstagram ? 'INSTAGRAM_ADS' : 'FACEBOOK_ADS'
      utmSource = isInstagram ? 'META_INSTAGRAM' : 'META_FACEBOOK'
      utmMedium = 'lead_ad'
      utmCampaign = value?.ad_name || value?.campaign_name || 'Meta Omnichannel Campaign'
      fbclid = value?.leadgen_id ? `meta_${value.leadgen_id}` : null

      // Parse custom fields if provided
      if (value?.form_data) {
        name = value.form_data.full_name || value.form_data.name || name
        email = value.form_data.email || email
        phone = value.form_data.phone_number || value.form_data.phone || phone
        city = value.form_data.city || city
        service = value.form_data.service || service
      }
    }

    // TikTok Lead Generation Webhook Detection
    if (body?.event === 'lead_gen' || body?.tiktok_lead_id || source === 'TIKTOK_ADS' || source === 'TIKTOK') {
      source = 'TIKTOK_ADS'
      utmSource = 'TIKTOK'
      utmMedium = 'lead_ad'
      utmCampaign = body?.campaign_name || body?.ad_name || 'TikTok Video Ad Campaign'
    }

    // Microsoft / Bing Ads Webhook Detection
    if (body?.platform === 'bing' || body?.platform === 'microsoft' || source === 'MICROSOFT_ADS' || source === 'BING') {
      source = 'MICROSOFT_ADS'
      utmSource = 'MICROSOFT_BING'
      utmMedium = 'cpc'
      utmCampaign = body?.campaignName || 'Microsoft Search Campaign'
    }

    // Google My Business / LSA Detection
    if (source === 'GOOGLE_BUSINESS' || source === 'GOOGLE_LSA' || body?.platform === 'gmb') {
      source = source === 'GOOGLE_LSA' ? 'GOOGLE_LSA' : 'GOOGLE_BUSINESS'
      utmSource = 'GOOGLE_LOCAL'
      utmMedium = 'local_pack'
    }

    // Fallback defaults
    if (!name) name = `Inbound Lead (${source.replace('_', ' ')})`
    if (!dealValue) dealValue = 3500.00 // Average painting estimate default

    const portalToken = crypto.randomBytes(8).toString('hex')
    const referralToken = crypto.randomBytes(6).toString('hex')

    const newLead = await prisma.lead.create({
      data: {
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        gclid,
        fbclid,
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        serviceInterested: service,
        serviceType: service,
        status: 'NOVO',
        dealValue,
        portalToken,
        referralToken,
        rawData: JSON.stringify(body || {}),
        notes: `Captured automatically via Omnichannel Webhook (${source})`
      }
    })

    return {
      success: true,
      message: `Omnichannel lead successfully ingested from ${source}!`,
      leadId: newLead.id,
      source: newLead.source,
      portalToken: newLead.portalToken
    }
  } catch (error: any) {
    console.error('Error processing Omnichannel Webhook:', error)
    return {
      success: false,
      message: error?.message || 'Failed to process omnichannel webhook'
    }
  }
})
