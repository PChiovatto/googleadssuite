import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getGeminiClient, simulateGeminiTriage } from '../../utils/aiClients'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    let lead: any = null

    if (body.leadId) {
      lead = await prisma.lead.findUnique({
        where: { id: body.leadId },
        include: { owner: true }
      })
    } else if (body.lead) {
      lead = body.lead
    } else {
      // Pick the latest unassigned lead or recent lead
      lead = await prisma.lead.findFirst({
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!lead) {
      throw createError({ statusCode: 404, statusMessage: 'Nenhum lead encontrado para triagem.' })
    }

    const gemini = getGeminiClient()
    let triageResult: any = null

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const prompt = `You are an ultra-fast US Lead Triage Specialist for First Boston Painters & Services.
Analyze the following lead data:
Name: ${lead.name || 'Unknown'}
Phone: ${lead.phone || 'N/A'}
Service Interested: ${lead.serviceInterested || lead.serviceType || 'General Painting'}
City: ${lead.city || 'Boston'}
State: ${lead.state || 'MA'}
Keyword: ${lead.keyword || 'None'}
Device: ${lead.device || 'Mobile'}
Notes: ${lead.notes || 'None'}

Return ONLY a valid raw JSON object (no markdown, no backticks) with:
{
  "score": number (1 to 10),
  "priority": "HOT" | "WARM" | "COLD",
  "urgency": "HIGH" | "MEDIUM" | "LOW",
  "intent": string (concise summary of intent),
  "budgetEstimate": string (e.g. "$3,000 - $6,000"),
  "recommendedAction": string,
  "suggestedScript": string (high-converting SMS or phone opening hook)
}`
        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()
        triageResult = JSON.parse(cleanJson)
        triageResult.modelUsed = 'gemini-1.5-flash'
        triageResult.isSimulation = false
      } catch (aiErr) {
        console.warn('Gemini Live API fallback triggered:', aiErr)
        triageResult = simulateGeminiTriage(lead)
      }
    } else {
      triageResult = simulateGeminiTriage(lead)
    }

    // Persist AI insights back to the database if lead has an ID
    if (lead.id) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          aiScore: triageResult.score,
          aiQualification: triageResult.intent,
          whatsappScript: triageResult.suggestedScript
        }
      })

      await prisma.auditLog.create({
        data: {
          action: 'AI_TRIAGE_EXECUTED',
          userId: 'SYSTEM_GEMINI_FLASH',
          userName: 'Gemini 1.5 Flash Triage Agent',
          details: JSON.stringify({
            leadId: lead.id,
            score: triageResult.score,
            priority: triageResult.priority,
            urgency: triageResult.urgency,
            model: triageResult.modelUsed
          })
        }
      })
    }

    return {
      success: true,
      leadId: lead.id,
      leadName: lead.name,
      triage: triageResult
    }
  } catch (error: any) {
    console.error('Error in Gemini triage endpoint:', error)
    return {
      success: false,
      error: error.message || 'Falha ao executar triagem de IA'
    }
  }
})
