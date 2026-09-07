import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    
    // Support direct testing or raw Amazon SES / SNS webhook envelope
    let from = body.from || body.sender || 'homeowner@example.com'
    let to = body.to || body.recipient || 'john@bostonpaintersandservices.com'
    let subject = body.subject || 'Nova resposta de cliente'
    let content = body.body || body.html || body.text || '<p>Mensagem recebida via Amazon SES Inbound.</p>'
    let messageId = body.messageId || `ses-inbound-${Date.now().toString(36)}`

    // If wrapped in Amazon SNS envelope
    if (body.Type === 'Notification' && body.Message) {
      try {
        const snsMsg = JSON.parse(body.Message)
        if (snsMsg.mail) {
          from = snsMsg.mail.source || from
          to = snsMsg.mail.destination?.[0] || to
          subject = snsMsg.mail.commonHeaders?.subject || subject
          messageId = snsMsg.mail.messageId || messageId
        }
        if (snsMsg.content) {
          content = snsMsg.content
        }
      } catch (e) {}
    }

    // 1. Find user matching recipient email
    let user = await prisma.user.findFirst({
      where: {
        email: { equals: to }
      }
    })

    // If not found by exact email, assign to default active consultant or manager
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: 'CONSULTANT' } }) ||
             await prisma.user.findFirst()
    }

    if (!user) {
      return { success: false, message: 'Nenhum usuário cadastrado no Workspace.' }
    }

    // 2. Find matching lead by sender email
    const lead = await prisma.lead.findFirst({
      where: { email: { equals: from } }
    })

    // 3. Create Inbound EmailMessage
    const emailMessage = await prisma.emailMessage.create({
      data: {
        userId: user.id,
        leadId: lead?.id || null,
        direction: 'INBOUND',
        folder: 'INBOX',
        from,
        to,
        subject,
        body: content,
        read: false,
        messageId
      }
    })

    // 4. Log in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_INBOUND_RECEIVED',
        userId: user.id,
        userName: user.name,
        details: JSON.stringify({
          emailId: emailMessage.id,
          from,
          to,
          subject,
          leadId: lead?.id || null,
          messageId
        })
      }
    })

    return {
      success: true,
      emailId: emailMessage.id,
      userId: user.id,
      assignedUser: user.name,
      message: `E-mail de ${from} recebido e roteado com sucesso para a caixa de ${user.name}!`
    }
  } catch (error: any) {
    console.error('Error handling Amazon SES Inbound:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
