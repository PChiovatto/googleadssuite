import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // POST: Record call log with audio transcript & Gemini AI summary
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const { leadId, agentId, agentName, durationSeconds = 180, recordingUrl, aiTranscript, sentiment } = body || {}

      const call = await prisma.callLog.create({
        data: {
          leadId: leadId || 'sample_lead',
          agentId: agentId || 'agent_1',
          agentName: agentName || 'John Miller',
          durationSeconds: Number(durationSeconds),
          recordingUrl: recordingUrl || 'https://api.twilio.com/recordings/sample.mp3',
          aiTranscript: aiTranscript || 'Cliente confirmou interesse na pintura externa de casa de 2 andares em Newton, MA. Agendou visita para terça-feira às 14h.',
          sentiment: sentiment || 'POSITIVE'
        }
      })

      return { success: true, call }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha ao salvar chamada' }
    }
  }

  // GET: List recent call logs
  try {
    let calls = await prisma.callLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    if (calls.length === 0) {
      // Seed sample call logs
      await prisma.callLog.createMany({
        data: [
          {
            leadId: 'cmtrfjnrx0001',
            agentId: 'user_1',
            agentName: 'John Miller',
            durationSeconds: 245,
            recordingUrl: 'https://cdn.example.com/recordings/rec_01.mp3',
            aiTranscript: 'Cliente Robert Sullivan atendeu no 2º toque. Negociado pintura de 4 cômodos internos em South Boston. Orçamento estimado em $4.200. Visita técnica confirmada para quarta-feira.',
            sentiment: 'POSITIVE'
          },
          {
            leadId: 'cmtrfjnrx0002',
            agentId: 'user_2',
            agentName: 'Sarah Jenkins',
            durationSeconds: 180,
            recordingUrl: 'https://cdn.example.com/recordings/rec_02.mp3',
            aiTranscript: 'Patricia Alencar questionou tempo de secagem e marcas de tinta. Explicado uso exclusivo de Benjamin Moore / Sherwin Williams. Muito receptiva. Aguardando aprovação do marido.',
            sentiment: 'NEUTRAL'
          },
          {
            leadId: 'cmtrfjnrx0003',
            agentId: 'user_3',
            agentName: 'David Costa',
            durationSeconds: 95,
            recordingUrl: 'https://cdn.example.com/recordings/rec_03.mp3',
            aiTranscript: 'Jennifer Smith confirmou restauração de armários de cozinha em laca branca. Contrato fechado por $3.800.',
            sentiment: 'POSITIVE'
          }
        ]
      })

      calls = await prisma.callLog.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }

    return { success: true, calls }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao listar chamadas' }
  }
})
