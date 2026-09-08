import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { emailId, name, email, phone, city, serviceInterested } = body

    if (!emailId) {
      return { success: false, message: 'ID da mensagem é obrigatório.' }
    }

    const emailMsg = await prisma.emailMessage.findUnique({ where: { id: emailId } })
    if (!emailMsg) {
      return { success: false, message: 'Mensagem de e-mail não encontrada.' }
    }

    const extractedName = name || emailMsg.from.split('<')[0].replace(/"/g, '').trim() || 'Novo Lead via E-mail'
    const extractedEmail = email || emailMsg.from.match(/<([^>]+)>/)?.[1] || emailMsg.from

    // Create lead in CRM
    const lead = await prisma.lead.create({
      data: {
        source: 'EMAIL',
        name: extractedName,
        email: extractedEmail,
        phone: phone || null,
        city: city || 'Boston',
        state: 'MA',
        serviceInterested: serviceInterested || 'Pintura & Remodelação',
        serviceType: 'Residential Painting',
        status: 'NOVO',
        notes: `Criado automaticamente pela Central de E-mail a partir da mensagem: "${emailMsg.subject}"`,
        aiScore: 8,
        aiQualification: 'Lead corporativo criado a partir de contato direto por e-mail.'
      }
    })

    // Associate email with lead
    await prisma.emailMessage.update({
      where: { id: emailId },
      data: { leadId: lead.id }
    })

    return {
      success: true,
      lead
    }
  } catch (err: any) {
    console.error('Erro ao converter e-mail em lead:', err)
    return { success: false, error: err.message }
  }
})
