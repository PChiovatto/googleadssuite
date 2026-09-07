import { defineEventHandler, readBody, getCookie } from 'h3'
import { prisma } from '../../utils/prisma'
import { sendSesEmail } from '../../utils/sesClient'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { to, subject, bodyHtml, leadId } = body

    if (!to || !subject || !bodyHtml) {
      return {
        success: false,
        message: 'Destinatário, assunto e conteúdo são obrigatórios.'
      }
    }

    const cookieUserId = getCookie(event, 'auth_user_id')
    const senderUserId = body.userId || cookieUserId

    let user = null
    if (senderUserId) {
      user = await prisma.user.findUnique({ where: { id: senderUserId } })
    }
    if (!user) {
      user = await prisma.user.findFirst()
    }

    if (!user) {
      return {
        success: false,
        message: 'Nenhum usuário remetente encontrado.'
      }
    }

    // 1. Dispatch via Amazon SES
    const sesResult = await sendSesEmail({
      to,
      subject,
      bodyHtml,
      from: `${user.name} <${user.email}>`
    })

    // 2. Save Outbound Message to DB
    const emailMessage = await prisma.emailMessage.create({
      data: {
        userId: user.id,
        leadId: leadId || null,
        direction: 'OUTBOUND',
        folder: 'SENT',
        from: user.email,
        to,
        subject,
        body: bodyHtml,
        read: true,
        messageId: sesResult.messageId
      }
    })

    // 3. If tied to a lead, record follow-up in lead notes
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          notes: `E-mail enviado por ${user.name}: "${subject}" via Amazon SES`
        }
      })
    }

    // 4. Log in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_OUTBOUND_DISPATCHED',
        userId: user.id,
        userName: user.name,
        details: JSON.stringify({
          emailId: emailMessage.id,
          to,
          subject,
          sesMessageId: sesResult.messageId,
          provider: sesResult.provider
        })
      }
    })

    return {
      success: true,
      email: emailMessage,
      sesMessageId: sesResult.messageId,
      message: `E-mail enviado com sucesso via Amazon SES para ${to}!`
    }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
