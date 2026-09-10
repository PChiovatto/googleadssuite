import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const leadId = query.leadId as string | undefined

  // Lista todos os leads que têm mensagens ou chamadas registradas
  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 30,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      serviceInterested: true,
      status: true,
      mctbStatus: true,
      updatedAt: true
    }
  })

  // Se um lead específico foi selecionado (ou o primeiro da lista)
  const targetLeadId = leadId || (leads[0]?.id)
  let timeline: any[] = []
  let selectedLead: any = null

  if (targetLeadId) {
    selectedLead = await prisma.lead.findUnique({
      where: { id: targetLeadId },
      include: {
        appointments: true,
        contracts: true,
        estimates: true
      }
    })

    // 1. Mensagens Unificadas de Chat (SMS, Notas, etc.)
    const chatMessages = await prisma.chatMessage.findMany({
      where: { leadId: targetLeadId },
      orderBy: { createdAt: 'asc' }
    })

    // 2. E-mails do Lead
    const emails = await prisma.emailMessage.findMany({
      where: { leadId: targetLeadId },
      orderBy: { createdAt: 'asc' }
    })

    // 3. Chamadas do Lead
    const calls = await prisma.callLog.findMany({
      where: { leadId: targetLeadId },
      orderBy: { createdAt: 'asc' }
    })

    // Normaliza todos os itens para a timeline
    timeline = [
      ...chatMessages.map(m => ({
        id: m.id,
        type: m.channel, // SMS, INTERNAL_NOTE, etc.
        direction: m.direction,
        sender: m.direction === 'OUTBOUND' ? (m.from || 'Tony\'s Painting') : (selectedLead?.name || 'Cliente'),
        body: m.body,
        audioUrl: m.audioUrl,
        aiGenerated: m.aiGenerated,
        createdAt: m.createdAt
      })),
      ...emails.map(e => ({
        id: e.id,
        type: 'EMAIL',
        direction: e.direction,
        sender: e.from,
        subject: e.subject,
        body: e.body,
        aiGenerated: false,
        createdAt: e.createdAt
      })),
      ...calls.map(c => ({
        id: c.id,
        type: 'CALL_RECORDING',
        direction: 'INBOUND',
        sender: c.agentName || 'Atendimento',
        body: c.aiTranscript || `Chamada telefônica gravada (${c.durationSeconds}s). Sentimento: ${c.sentiment || 'Neutro'}.`,
        audioUrl: c.recordingUrl || 'https://actions.google.com/sounds/v1/teleport/teleport_arrive.ogg',
        aiGenerated: false,
        createdAt: c.createdAt
      }))
    ]

    // Ordena toda a timeline de forma estritamente cronológica
    timeline.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  return {
    leads,
    selectedLead,
    timeline
  }
})
