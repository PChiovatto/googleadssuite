import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { sendSesEmail } from '../../utils/sesClient'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { subject, bodyHtml, segment, sendVia = 'AMAZON_SES' } = body

    if (!subject || !bodyHtml) {
      return {
        success: false,
        message: 'Assunto e conteúdo do e-mail são obrigatórios.'
      }
    }

    const whereClause: any = {
      email: { not: null }
    }

    if (segment && segment !== 'ALL') {
      whereClause.status = segment
    }

    const recipients = await prisma.lead.findMany({
      where: whereClause,
      select: { id: true, name: true, email: true }
    })

    const campaignId = 'CAMP_' + Date.now().toString(36).toUpperCase()

    // Dispatch via Amazon SES
    const emailsList = recipients.map(r => r.email).filter(Boolean) as string[]
    let sesResult = { success: true, messageId: 'sim-broadcast-001', provider: 'AMAZON_SES_SIMULATED' }

    if (emailsList.length > 0) {
      sesResult = await sendSesEmail({
        to: emailsList,
        subject,
        bodyHtml
      })
    }

    // Log the broadcast campaign with AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_CAMPAIGN_BROADCAST',
        userId: body.userId || 'SYSTEM_MARKETING',
        userName: 'Amazon SES Marketing Engine',
        details: JSON.stringify({
          campaignId,
          subject,
          segment: segment || 'ALL',
          recipientsCount: recipients.length,
          sendVia,
          sesMessageId: sesResult.messageId,
          provider: sesResult.provider
        })
      }
    })

    return {
      success: true,
      campaignId,
      recipientsCount: recipients.length,
      status: 'QUEUED_AND_DISPATCHED',
      provider: sesResult.provider,
      sesMessageId: sesResult.messageId,
      message: `Campanha "${subject}" disparada via Amazon SES para ${recipients.length} contatos.`
    }
  } catch (error: any) {
    console.error('Error broadcasting marketing email:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
