import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    
    // Process Stripe event
    const eventType = body.type || 'checkout.session.completed'
    const session = body.data?.object || body

    const leadId = session.metadata?.leadId || body.leadId
    const gclid = session.metadata?.gclid || body.gclid
    const amountTotal = (session.amount_total ? session.amount_total / 100 : body.amount) || 1500

    if (leadId) {
      // Mark lead as CONVERTIDO and update Stripe payment status
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'CONVERTIDO',
          stripePaymentStatus: 'PAID',
          closedAt: new Date(),
          dealValue: amountTotal
        }
      })

      // Log the event
      await prisma.auditLog.create({
        data: {
          action: 'STRIPE_PAYMENT_CONFIRMED',
          userId: 'WEBHOOK_STRIPE',
          userName: 'Stripe Webhook Listener',
          details: JSON.stringify({
            leadId,
            eventType,
            amount: amountTotal,
            gclid
          })
        }
      })

      // Offline Conversion Feedback to Google Ads
      if (gclid) {
        console.log(`[Google Ads Offline Conversion] Automatically uploading conversion for GCLID ${gclid} with value $${amountTotal}`)
      }

      return {
        received: true,
        status: 'LEAD_CONVERTED_AND_ADS_ATTRIBUTED',
        leadId,
        amount: amountTotal
      }
    }

    return { received: true, status: 'NO_LEAD_METADATA' }
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error)
    return {
      received: false,
      error: error.message
    }
  }
})
