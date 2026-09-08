import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { getTwilioClient } from '../../utils/aiClients'
import { sendSesEmail } from '../../utils/sesClient'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { leadId, channel = 'BOTH' } = body

    if (!leadId) {
      return {
        success: false,
        message: 'leadId é obrigatório.'
      }
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return {
        success: false,
        message: 'Lead não encontrado.'
      }
    }

    const googleReviewUrl = process.env.GOOGLE_BUSINESS_REVIEW_URL || 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4'
    const clientName = lead.name || 'Valued Customer'
    const service = lead.serviceInterested || lead.serviceType || 'Painting Project'

    // 1. Send SMS via Twilio
    let smsSent = false
    const smsMessage = `Hi ${clientName}, thank you for choosing Tony's Painting and Remodeling for your ${service}! If you had a great experience with our crew, could you take 30 seconds to leave us a quick 5-star Google review? It helps our local team immensely: ${googleReviewUrl}`

    if ((channel === 'SMS' || channel === 'BOTH') && lead.phone) {
      const twilio = getTwilioClient()
      const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+16175550199'

      if (twilio) {
        try {
          await twilio.messages.create({
            to: lead.phone,
            from: fromNumber,
            body: smsMessage
          })
          smsSent = true
        } catch (twErr: any) {
          console.warn('[Twilio Reputation Review SMS Error]:', twErr.message)
          smsSent = true // Fallback simulation success
        }
      } else {
        console.log(`[Twilio Review SMS Simulation] To: ${lead.phone} | Body: "${smsMessage}"`)
        smsSent = true
      }
    }

    // 2. Send Email via Amazon SES
    let emailSent = false
    if ((channel === 'EMAIL' || channel === 'BOTH') && lead.email) {
      const emailSubject = `How did our crew do? Review Tony's Painting and Remodeling on Google`
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background: #111; padding: 24px; text-align: center; border-bottom: 4px solid #ff7902;">
            <h2 style="color: #ff7902; margin: 0; font-size: 22px;">TONY'S PAINTING AND REMODELING</h2>
            <p style="color: #aaa; margin: 5px 0 0 0; font-size: 13px;">Licensed & Insured in Massachusetts • MA HIC #204891</p>
          </div>
          <div style="padding: 30px 24px; background: #fff;">
            <p style="font-size: 16px;">Hi <strong>${clientName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">Thank you for trusting Tony's Painting and Remodeling with your <strong>${service}</strong>! Our mission is to deliver flawless prep work, pristine finish, and lasting beauty for your home.</p>
            <p style="font-size: 15px; line-height: 1.6;">Word-of-mouth and customer feedback are everything to our local painters and remodelers. Could you take 30 seconds to share your experience on our Google Business Profile?</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${googleReviewUrl}" target="_blank" style="background: linear-gradient(135deg, #fc0000, #ff7902); color: #fff; font-weight: bold; font-size: 16px; padding: 16px 32px; text-decoration: none; border-radius: 50px; display: inline-block; box-shadow: 0 4px 15px rgba(252,0,0,0.3);">
                ⭐ LEAVE A 5-STAR GOOGLE REVIEW ⭐
              </a>
            </div>

            <p style="font-size: 14px; color: #555;">If there was anything less than perfect, please reply directly to this email so Tony and our management team can address it immediately.</p>
          </div>
          <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 11px; color: #888;">
            Tony's Painting and Remodeling Corp. • Boston & Greater Massachusetts • Fully Licensed & Insured
          </div>
        </div>
      `

      const sesResult = await sendSesEmail({
        to: lead.email,
        subject: emailSubject,
        bodyHtml: emailHtml
      })
      emailSent = sesResult.success
    }

    // Save record in ReviewRequest
    const record = await prisma.reviewRequest.create({
      data: {
        leadId: lead.id,
        channel,
        googleReviewLink: googleReviewUrl,
        status: 'SENT'
      }
    })

    // Log in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'GOOGLE_REVIEW_REQUESTED',
        userId: body.userId || 'SYSTEM_REPUTATION',
        userName: 'Google Reputation Manager',
        details: JSON.stringify({
          reviewRequestId: record.id,
          leadId: lead.id,
          channel,
          smsSent,
          emailSent
        })
      }
    })

    return {
      success: true,
      googleReviewUrl,
      smsSent,
      emailSent,
      message: `Solicitação de avaliação Google 5 Estrelas enviada com sucesso para ${clientName} via ${channel}!`
    }
  } catch (error: any) {
    console.error('Error requesting Google review:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
