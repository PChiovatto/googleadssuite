import { defineEventHandler } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getMockCampaignMetrics, getMockKeywordMetrics } from '~/server/utils/googleAdsClient'

export default defineEventHandler(async () => {
  try {
    // 1. Fetch latest campaign metrics
    let campaigns = await prisma.campaignMetrics.findMany({
      orderBy: { cost: 'desc' },
      take: 20
    })

    // If database is empty, seed initial sample data
    if (campaigns.length === 0) {
      const mockCampaigns = getMockCampaignMetrics()
      const today = new Date()
      for (const c of mockCampaigns) {
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
      campaigns = await prisma.campaignMetrics.findMany({
        orderBy: { cost: 'desc' }
      })
    }

    // 2. Fetch keywords
    let keywords = await prisma.keywordMetrics.findMany({
      orderBy: { cost: 'desc' },
      take: 10
    })

    if (keywords.length === 0) {
      const mockKeywords = getMockKeywordMetrics()
      for (const k of mockKeywords) {
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
      keywords = await prisma.keywordMetrics.findMany({
        orderBy: { cost: 'desc' }
      })
    }

    // 3. Compute Aggregates
    const totals = campaigns.reduce(
      (acc, c) => {
        acc.cost += c.cost
        acc.clicks += c.clicks
        acc.impressions += c.impressions
        acc.conversions += c.conversions
        acc.conversionValue += c.conversionValue
        return acc
      },
      { cost: 0, clicks: 0, impressions: 0, conversions: 0, conversionValue: 0 }
    )

    const avgCpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0
    const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    const cpa = totals.conversions > 0 ? totals.cost / totals.conversions : 0
    const roas = totals.cost > 0 ? totals.conversionValue / totals.cost : 0

    // 4. Account Settings
    const account = await prisma.accountSetting.findUnique({
      where: { customerId: 'primary-account' }
    })

    return {
      success: true,
      totals: {
        cost: Number(totals.cost.toFixed(2)),
        clicks: totals.clicks,
        impressions: totals.impressions,
        conversions: Number(totals.conversions.toFixed(1)),
        conversionValue: Number(totals.conversionValue.toFixed(2)),
        avgCpc: Number(avgCpc.toFixed(2)),
        avgCtr: Number(avgCtr.toFixed(2)),
        cpa: Number(cpa.toFixed(2)),
        roas: Number(roas.toFixed(2))
      },
      campaigns,
      keywords,
      account: account || {
        accountName: 'Boston Painters & Services',
        isDemo: true,
        lastSyncedAt: new Date()
      }
    }
  } catch (error: any) {
    console.error('Error in /api/ads/campaigns:', error)
    return {
      success: false,
      error: error?.message || 'Falha ao buscar dados de campanhas'
    }
  }
})
