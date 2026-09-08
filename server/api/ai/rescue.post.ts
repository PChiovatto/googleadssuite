import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { getOpenAIClient } from '../../utils/aiClients'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    let lead: any = null

    if (body.leadId) {
      lead = await prisma.lead.findUnique({
        where: { id: body.leadId },
        include: { contracts: true, owner: true }
      })
    } else {
      // Find a lead in PROPOSTA that has been waiting longest
      lead = await prisma.lead.findFirst({
        where: {
          status: 'PROPOSTA'
        },
        orderBy: { updatedAt: 'asc' },
        include: { contracts: true, owner: true }
      })
    }

    if (!lead) {
      return {
        success: false,
        message: 'Nenhum lead em status PROPOSTA encontrado para resgate.'
      }
    }

    // Calculate elapsed hours since creation/update
    const lastActivity = new Date(lead.updatedAt || lead.createdAt).getTime()
    const now = Date.now()
    const stagnantHours = Math.max(1, Math.round((now - lastActivity) / (1000 * 60 * 60)))

    const openAI = getOpenAIClient()
    let rescueResult: {
      sms: string
      emailSubject: string
      emailBody: string
      recommendedOffer: string
      predictedObjection: string
    } | null = null

    if (openAI) {
      try {
        const completion = await openAI.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an elite Sales Recovery Specialist for Tony's Painting and Remodeling in Massachusetts.
Your goal is "Rescue Lead": re-engaging a homeowner whose proposal has been pending for over 48 hours without being signed.
Address common friction points (uncertainty on colors, pricing flexibility, scheduling before winter/spring seasons).
Emphasize Tony's key trust anchors: 5-Year Written Warranty, Licensed & Insured MA HIC #204891, and a complimentary Sherwin-Williams / Benjamin Moore color sample match.
Always keep SMS compliant with TCPA (include "Reply STOP to opt out").
Return ONLY valid JSON:
{
  "sms": string,
  "emailSubject": string,
  "emailBody": string,
  "recommendedOffer": string,
  "predictedObjection": string
}`
            },
            {
              role: 'user',
              content: `Lead: ${lead.name}
Phone: ${lead.phone || 'N/A'}
Service: ${lead.serviceInterested || 'Pintura Residencial Premium'}
City: ${lead.city || 'Wakefield'}, MA
Quote Value: $${lead.dealValue || 4800}
Proposal Age: ${stagnantHours} hours`
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          rescueResult = JSON.parse(content)
        }
      } catch (err: any) {
        console.warn('OpenAI Rescue Lead fallback:', err.message)
      }
    }

    // High quality contextual fallback
    if (!rescueResult) {
      const deal = lead.dealValue ? `$${Number(lead.dealValue).toLocaleString('en-US')}` : '$4,850'
      const city = lead.city || 'Wakefield'
      rescueResult = {
        sms: `Hi ${lead.name}, this is Tony from Tony's Painting & Remodeling! Checking in on the ${lead.serviceInterested || 'painting proposal'} for your home in ${city} (${deal}). We have an open crew window next week and can include a complimentary Sherwin-Williams color consultation + $200 off your deposit if locked in by Friday. Would love to answer any questions! (Reply STOP to opt out)`,
        emailSubject: `Follow-up on your painting estimate for ${lead.name} — Tony's Painting & Remodeling`,
        emailBody: `Hi ${lead.name},\n\nI hope your week is off to a great start! Tony here from Tony's Painting & Remodeling.\n\nI wanted to follow up on the custom proposal we sent over for your project in ${city} (${deal}). We know selecting the right contractor and finalizing colors is an important decision.\n\nAs a reminder, all our residential work includes:\n• Full 5-Year Written Warranty on labor & materials\n• Fully licensed and insured (MA HIC #204891)\n• Premium Sherwin-Williams Emerald & Benjamin Moore Aura finishes\n\nIf you have any questions about the scope, or if you'd like to adjust the schedule to fit your timeline, simply reply to this email or call/text us directly at (617) 555-0198.\n\nBest regards,\nTony & the Team\nTony's Painting and Remodeling`,
        recommendedOffer: '$200 de desconto no sinal ou consultoria de cores Sherwin-Williams grátis',
        predictedObjection: 'Incerteza no prazo ou comparação de orçamentos'
      }
    }

    // Persist WhatsApp/SMS script to Lead
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        whatsappScript: rescueResult.sms,
        updatedAt: new Date()
      }
    })

    // Log to Audit trail
    await prisma.auditLog.create({
      data: {
        action: 'AI_RESCUE_LEAD_TRIGGERED',
        userId: lead.ownerId || 'SYSTEM_AI',
        userName: lead.owner?.name || 'Omni-Agent Rescue',
        details: JSON.stringify({
          leadId: lead.id,
          leadName: lead.name,
          stagnantHours,
          offer: rescueResult.recommendedOffer,
          timestamp: new Date().toISOString()
        })
      }
    })

    return {
      success: true,
      lead: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        city: lead.city,
        dealValue: lead.dealValue,
        status: lead.status
      },
      stagnantHours,
      rescue: rescueResult
    }
  } catch (error: any) {
    console.error('Error in /api/ai/rescue:', error)
    return {
      success: false,
      error: error.message || 'Erro ao processar resgate de lead.'
    }
  }
})
