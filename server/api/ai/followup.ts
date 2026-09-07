import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { getOpenAIClient, getTwilioClient, simulateGPT4oFollowup } from '../../utils/aiClients'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    let lead: any = null

    if (body.leadId) {
      lead = await prisma.lead.findUnique({
        where: { id: body.leadId }
      })
    } else {
      // Find a lead in NOVO or EM_ATENDIMENTO
      lead = await prisma.lead.findFirst({
        where: {
          status: { in: ['NOVO', 'EM_ATENDIMENTO'] }
        },
        orderBy: { createdAt: 'asc' }
      })
    }

    if (!lead) {
      return {
        success: false,
        message: 'Nenhum lead elegível para reengajamento encontrado.'
      }
    }

    const openAI = getOpenAIClient()
    let followupResult: any = null

    if (openAI) {
      try {
        const completion = await openAI.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a high-converting US Sales Follow-up AI Specialist for First Boston Painters & Services.
Create a hyper-personalized SMS re-engagement and an email nurture message for a homeowner lead who hasn't completed their booking.
Ensure 100% compliance with TCPA: include opt-out language ("Reply STOP to opt out") in the SMS.
Return ONLY raw JSON:
{
  "smsMessage": string,
  "emailSubject": string,
  "emailBodyHtml": string
}`
            },
            {
              role: 'user',
              content: `Lead Name: ${lead.name}
Phone: ${lead.phone || 'N/A'}
Service: ${lead.serviceInterested || lead.serviceType || 'Painting'}
City: ${lead.city || 'Boston'}
State: ${lead.state || 'MA'}
Current Status: ${lead.status}`
            }
          ],
          response_format: { type: 'json_object' }
        })

        const content = completion.choices[0].message.content
        if (content) {
          followupResult = JSON.parse(content)
          followupResult.modelUsed = 'gpt-4o'
          followupResult.isSimulation = false
        }
      } catch (err) {
        console.warn('GPT-4o fallback triggered:', err)
        followupResult = simulateGPT4oFollowup(lead)
      }
    } else {
      followupResult = simulateGPT4oFollowup(lead)
    }

    // If dispatch requested and Twilio client available
    let twilioDispatchStatus = 'NOT_REQUESTED'
    if (body.dispatchTwilio && lead.phone && lead.tcpaConsent) {
      const twilio = getTwilioClient()
      if (twilio) {
        try {
          const message = await twilio.messages.create({
            body: followupResult.smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER || '+16175550198',
            to: lead.phone
          })
          twilioDispatchStatus = `SENT: ${message.sid}`
        } catch (twErr: any) {
          twilioDispatchStatus = `FAILED: ${twErr.message}`
        }
      } else {
        twilioDispatchStatus = 'SIMULATED_DISPATCH_SUCCESS'
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'GPT4O_FOLLOWUP_GENERATED',
        userId: body.userId || 'SYSTEM_GPT4O',
        userName: 'GPT-4o Follow-Up Agent',
        details: JSON.stringify({
          leadId: lead.id,
          leadName: lead.name,
          twilioDispatchStatus,
          model: followupResult.modelUsed
        })
      }
    })

    return {
      success: true,
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      followup: followupResult,
      twilioStatus: twilioDispatchStatus
    }
  } catch (error: any) {
    console.error('Error in followup endpoint:', error)
    return {
      success: false,
      error: error.message || 'Falha ao processar reengajamento de lead'
    }
  }
})
