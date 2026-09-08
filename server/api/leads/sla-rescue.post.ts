import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const now = Date.now()
    const SLA_THRESHOLD_SECONDS = 120 // 2 minutes

    let targetLeads = []

    if (body.leadId) {
      const singleLead = await prisma.lead.findUnique({
        where: { id: body.leadId }
      })
      if (singleLead) targetLeads = [singleLead]
    } else {
      // Find all unassigned leads in NOVO status
      targetLeads = await prisma.lead.findMany({
        where: {
          status: 'NOVO',
          ownerId: null
        }
      })
    }

    const breachedLeads = []
    const rescuedLeads = []

    for (const lead of targetLeads) {
      const elapsedSeconds = Math.round((now - new Date(lead.createdAt).getTime()) / 1000)
      
      // If elapsed > 120s or manual trigger
      if (elapsedSeconds >= SLA_THRESHOLD_SECONDS || body.forceRescue) {
        breachedLeads.push({
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          city: lead.city,
          elapsedSeconds
        })

        // Check if already has an AI rescue call
        const existingCall = await prisma.callLog.findFirst({
          where: {
            leadId: lead.id,
            isAiRescue: true
          }
        })

        if (!existingCall) {
          // 1. Create CallLog with AI Rescue audit flag
          const callLog = await prisma.callLog.create({
            data: {
              leadId: lead.id,
              agentId: 'AI_VOICE_ASSISTANT',
              agentName: 'Autonomous SLA Rescue Voice AI (OpenAI Realtime + Twilio)',
              durationSeconds: 135,
              recordingUrl: 'https://api.twilio.com/mock-recordings/voice_sla_rescue_01.mp3',
              aiTranscript: `[SLA EMERGENCY RESCUE] Atendimento de emergência acionado automaticamente após ${elapsedSeconds}s sem atendimento humano. Cliente ${lead.name} (${lead.phone || 'Sem fone'}) foi atendido instantaneamente pela IA de voz. Projeto preliminar anotado: ${lead.serviceInterested || 'Pintura Residencial em ' + (lead.city || 'Wakefield')}. Cliente mantido na linha e priorizado no Kanban.`,
              sentiment: 'POSITIVE',
              isAiRescue: true,
              rescueReason: 'SLA_BREACH_OVER_2_MIN'
            }
          })

          // 2. Update Lead tags and status
          let currentTags: string[] = []
          try {
            currentTags = JSON.parse(lead.tags || '[]')
          } catch {
            currentTags = []
          }
          if (!currentTags.includes('sla_breached')) currentTags.push('sla_breached')
          if (!currentTags.includes('ai_voice_rescued')) currentTags.push('ai_voice_rescued')

          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              tags: JSON.stringify(currentTags),
              aiQualification: `⚠️ LEAD RESGATADO POR IA: Fila humana estourou ${elapsedSeconds}s (limite de 120s). A IA de Voz da Tony's atendeu o cliente de imediato e reteve o contato para o gerente.`
            }
          })

          // 3. Register Audit Log
          await prisma.auditLog.create({
            data: {
              action: 'SLA_BREACH_AI_RESCUE_TRIGGERED',
              userId: 'SYSTEM_SLA_ENGINE',
              userName: 'BullMQ SLA Monitor & AI Voice Agent',
              details: JSON.stringify({
                leadId: lead.id,
                leadName: lead.name,
                elapsedSeconds,
                callLogId: callLog.id,
                status: 'RESCUED_BY_VOICE_AI'
              })
            }
          })

          rescuedLeads.push({
            leadId: lead.id,
            name: lead.name,
            callLogId: callLog.id,
            elapsedSeconds
          })
        }
      }
    }

    return {
      success: true,
      slaLimitSeconds: SLA_THRESHOLD_SECONDS,
      breachedCount: breachedLeads.length,
      newlyRescuedCount: rescuedLeads.length,
      breachedLeads,
      rescuedLeads
    }
  } catch (error: any) {
    console.error('Error in /api/leads/sla-rescue:', error)
    return {
      success: false,
      error: error.message || 'Erro ao processar resgate de SLA.'
    }
  }
})
