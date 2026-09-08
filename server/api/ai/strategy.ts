import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { getAnthropicClient, simulateClaudeStrategy } from '../../utils/aiClients'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    
    // Fetch real metrics from SQLite if not passed
    let campaigns = body.campaigns
    if (!campaigns || campaigns.length === 0) {
      campaigns = await prisma.campaignMetrics.findMany({
        take: 5,
        orderBy: { date: 'desc' }
      })
    }

    const anthropic = getAnthropicClient()
    let strategyResult: any = null

    if (anthropic) {
      try {
        const prompt = `You are the Principal Ads Strategist & Conversion Copywriter (Claude 3.5 Sonnet) for Tony's Painting and Remodeling in Massachusetts.
Analyze these campaign metrics:
${JSON.stringify(campaigns, null, 2)}

Provide a master performance review, negative keyword recommendations, 2 high-converting ad copy variations tailored to homeowners in MA, and landing page optimization insights.
Return ONLY raw JSON (no markdown fences):
{
  "summary": string,
  "findings": string[],
  "negativeKeywordsRecommended": string[],
  "adCopyVariations": [
    { "headline": string, "subheadline": string, "callToAction": string }
  ],
  "landingPageOptimization": string
}`

        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })

        const contentBlock = response.content[0]
        if (contentBlock.type === 'text') {
          const cleanJson = contentBlock.text.trim().replace(/```json/g, '').replace(/```/g, '').trim()
          strategyResult = JSON.parse(cleanJson)
          strategyResult.modelUsed = 'claude-3-5-sonnet-20241022'
          strategyResult.isSimulation = false
        }
      } catch (anthropicErr) {
        console.warn('Anthropic API fallback triggered:', anthropicErr)
        strategyResult = simulateClaudeStrategy(campaigns)
      }
    } else {
      strategyResult = simulateClaudeStrategy(campaigns)
    }

    // Persist in AiConsultation
    await prisma.aiConsultation.create({
      data: {
        promptType: 'CLAUDE_STRATEGY_ROAS',
        contextData: JSON.stringify({ campaignsCount: campaigns?.length || 0 }),
        aiRecommendation: JSON.stringify(strategyResult)
      }
    })

    await prisma.auditLog.create({
      data: {
        action: 'CLAUDE_STRATEGY_GENERATED',
        userId: 'SYSTEM_CLAUDE_SONNET',
        userName: 'Claude 3.5 Sonnet Strategist',
        details: JSON.stringify({
          model: strategyResult.modelUsed || 'claude-3-5-sonnet',
          isSimulation: strategyResult.isSimulation ?? false
        })
      }
    })

    return {
      success: true,
      strategy: strategyResult
    }
  } catch (error: any) {
    console.error('Error in Claude strategy endpoint:', error)
    return {
      success: false,
      error: error.message || 'Falha ao processar estratégia com Claude 3.5 Sonnet'
    }
  }
})
