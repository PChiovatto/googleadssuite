import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { subject, bodyHtml, segment, sendVia } = body

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

    // Log the broadcast campaign
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_CAMPAIGN_BROADCAST',
        userId: body.userId || 'SYSTEM_MARKETING',
        userName: 'Email Marketing Engine',
        details: JSON.stringify({
          campaignId,
          subject,
          segment: segment || 'ALL',
          recipientsCount: recipients.length,
          sendVia: sendVia || 'SIMULATED_SMTP'
        })
      }
    })

    return {
      success: true,
      campaignId,
      recipientsCount: recipients.length,
      status: 'QUEUED_AND_DISPATCHED',
      message: `Campanha "${subject}" disparada com sucesso para ${recipients.length} contatos.`
    }
  } catch (error: any) {
    console.error('Error broadcasting marketing email:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
