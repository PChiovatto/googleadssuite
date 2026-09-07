import { defineEventHandler } from 'h3'
import { executeGaqlQuery, getMockKeywordMetrics } from '~/server/utils/googleAdsClient'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const gaqlQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_per_conversion,
        metrics.search_impression_share
      FROM campaign
      WHERE segments.date DURING LAST_30_DAYS
      ORDER BY metrics.cost_micros DESC
    `

    const { data: campaigns, isDemo } = await executeGaqlQuery(gaqlQuery)
    const today = new Date()

    // 1. Persist or update campaigns in DB
    for (const c of campaigns) {
      await prisma.campaignMetrics.create({
        data: {
          date: today,
          campaignId: c.campaignId,
          campaignName: c.campaignName,
          status: c.status,
          advertisingChannel: c.advertisingChannel,
          impressions: c.impressions,
          clicks: c.clicks,
          cost: c.cost,
          conversions: c.conversions,
          conversionValue: c.conversionValue,
          ctr: c.ctr,
          averageCpc: c.averageCpc,
          costPerConversion: c.costPerConversion,
          roas: c.roas,
          searchImpressionShare: c.searchImpressionShare
        }
      })
    }

    // 2. Persist mock keywords if keywords table is empty
    const existingKeywordsCount = await prisma.keywordMetrics.count()
    if (existingKeywordsCount === 0) {
      const keywords = getMockKeywordMetrics()
      for (const k of keywords) {
        await prisma.keywordMetrics.create({
          data: {
            campaignId: k.campaignId,
            keyword: k.keyword,
            matchType: k.matchType,
            impressions: k.impressions,
            clicks: k.clicks,
            cost: k.cost,
            conversions: k.conversions,
            cpc: k.cpc,
            qualityScore: k.qualityScore
          }
        })
      }
    }

    // 3. Update Account Setting record
    await prisma.accountSetting.upsert({
      where: { customerId: 'primary-account' },
      update: {
        lastSyncedAt: new Date(),
        isDemo
      },
      create: {
        customerId: 'primary-account',
        accountName: isDemo ? 'Boston Painters & Services (Demo Account)' : 'Live Google Ads Account',
        isDemo,
        lastSyncedAt: new Date()
      }
    })

    return {
      success: true,
      message: isDemo
        ? 'Métricas sincronizadas com sucesso (Modo Demonstração ativo até configurar credenciais no .env).'
        : 'Métricas sincronizadas diretamente da Google Ads API com sucesso!',
      isDemo,
      syncedAt: new Date().toISOString(),
      campaignsCount: campaigns.length
    }
  } catch (error: any) {
    console.error('Error syncing Google Ads metrics:', error)
    return {
      success: false,
      error: error?.message || 'Falha ao sincronizar métricas'
    }
  }
})
