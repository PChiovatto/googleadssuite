export interface RawCampaignMetric {
  campaignId: string
  campaignName: string
  status: string
  advertisingChannel: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversionValue: number
  ctr: number
  averageCpc: number
  costPerConversion: number
  roas: number
  searchImpressionShare: number
}

export interface RawKeywordMetric {
  campaignId: string
  keyword: string
  matchType: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  cpc: number
  qualityScore: number
}

export function isGoogleAdsConfigured(): boolean {
  const config = useRuntimeConfig()
  return Boolean(
    config.googleAdsDeveloperToken &&
    config.googleAdsClientId &&
    config.googleAdsClientSecret &&
    config.googleAdsRefreshToken &&
    config.googleAdsCustomerId
  )
}

/**
 * Executes a GAQL (Google Ads Query Language) query against Google Ads API v18
 * If not configured, returns realistic demo data.
 */
export async function executeGaqlQuery(query: string): Promise<{ data: RawCampaignMetric[], isDemo: boolean }> {
  const config = useRuntimeConfig()

  if (!isGoogleAdsConfigured()) {
    return {
      data: getMockCampaignMetrics(),
      isDemo: true
    }
  }

  try {
    // 1. Refresh OAuth Access Token using Refresh Token
    const tokenRes: any = await $fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: config.googleAdsClientId,
        client_secret: config.googleAdsClientSecret,
        refresh_token: config.googleAdsRefreshToken,
        grant_type: 'refresh_token'
      })
    })

    const accessToken = tokenRes.access_token
    const customerId = config.googleAdsCustomerId.replace(/-/g, '')

    // 2. Query Google Ads API v18 searchStream
    const headers: Record<string, string> = {
      'developer-token': config.googleAdsDeveloperToken,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }

    if (config.googleAdsLoginCustomerId) {
      headers['login-customer-id'] = config.googleAdsLoginCustomerId.replace(/-/g, '')
    }

    const response: any = await $fetch(
      `https://googleads.googleapis.com/v18/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers,
        body: { query }
      }
    )

    // Map Google Ads API stream response
    const results: RawCampaignMetric[] = []
    if (Array.isArray(response)) {
      for (const batch of response) {
        if (batch.results) {
          for (const row of batch.results) {
            const cost = (Number(row.metrics?.costMicros) || 0) / 1_000_000
            const conversions = Number(row.metrics?.conversions) || 0
            const conversionValue = Number(row.metrics?.conversionsValue) || 0
            const clicks = Number(row.metrics?.clicks) || 0
            const impressions = Number(row.metrics?.impressions) || 0
            const ctr = (Number(row.metrics?.ctr) || 0) * 100
            const averageCpc = (Number(row.metrics?.averageCpc) || 0) / 1_000_000
            const costPerConversion = conversions > 0 ? cost / conversions : 0
            const roas = cost > 0 ? conversionValue / cost : 0
            const searchImpressionShare = (Number(row.metrics?.searchImpressionShare) || 0) * 100

            results.push({
              campaignId: String(row.campaign?.id || 'unknown'),
              campaignName: String(row.campaign?.name || 'Unnamed Campaign'),
              status: String(row.campaign?.status || 'ENABLED'),
              advertisingChannel: String(row.campaign?.advertisingChannelType || 'SEARCH'),
              impressions,
              clicks,
              cost: Number(cost.toFixed(2)),
              conversions: Number(conversions.toFixed(1)),
              conversionValue: Number(conversionValue.toFixed(2)),
              ctr: Number(ctr.toFixed(2)),
              averageCpc: Number(averageCpc.toFixed(2)),
              costPerConversion: Number(costPerConversion.toFixed(2)),
              roas: Number(roas.toFixed(2)),
              searchImpressionShare: Number(searchImpressionShare.toFixed(1))
            })
          }
        }
      }
    }

    return {
      data: results.length > 0 ? results : getMockCampaignMetrics(),
      isDemo: results.length === 0
    }
  } catch (error: any) {
    console.error('Google Ads API Error, falling back to cached/demo data:', error?.message || error)
    return {
      data: getMockCampaignMetrics(),
      isDemo: true
    }
  }
}

export function getMockCampaignMetrics(): RawCampaignMetric[] {
  return [
    {
      campaignId: '101',
      campaignName: 'Search - Boston High Intent Painters',
      status: 'ENABLED',
      advertisingChannel: 'SEARCH',
      impressions: 48250,
      clicks: 3410,
      cost: 4850.20,
      conversions: 215.0,
      conversionValue: 24800.00,
      ctr: 7.07,
      averageCpc: 1.42,
      costPerConversion: 22.56,
      roas: 5.11,
      searchImpressionShare: 78.4
    },
    {
      campaignId: '102',
      campaignName: 'Search - Exterior Painting Massachusetts',
      status: 'ENABLED',
      advertisingChannel: 'SEARCH',
      impressions: 32190,
      clicks: 1980,
      cost: 3240.50,
      conversions: 110.0,
      conversionValue: 16500.00,
      ctr: 6.15,
      averageCpc: 1.64,
      costPerConversion: 29.46,
      roas: 5.09,
      searchImpressionShare: 64.2
    },
    {
      campaignId: '103',
      campaignName: 'Performance Max - Residential & Cabinets',
      status: 'ENABLED',
      advertisingChannel: 'PERFORMANCE_MAX',
      impressions: 89400,
      clicks: 4120,
      cost: 2980.00,
      conversions: 145.0,
      conversionValue: 12800.00,
      ctr: 4.61,
      averageCpc: 0.72,
      costPerConversion: 20.55,
      roas: 4.30,
      searchImpressionShare: 52.8
    },
    {
      campaignId: '104',
      campaignName: 'Display - Remarketing Website Visitors',
      status: 'ENABLED',
      advertisingChannel: 'DISPLAY',
      impressions: 115000,
      clicks: 1850,
      cost: 840.10,
      conversions: 38.0,
      conversionValue: 3450.00,
      ctr: 1.61,
      averageCpc: 0.45,
      costPerConversion: 22.11,
      roas: 4.11,
      searchImpressionShare: 89.1
    },
    {
      campaignId: '105',
      campaignName: 'Search - Commercial & Office Painting',
      status: 'PAUSED',
      advertisingChannel: 'SEARCH',
      impressions: 14200,
      clicks: 520,
      cost: 1680.00,
      conversions: 18.0,
      conversionValue: 4200.00,
      ctr: 3.66,
      averageCpc: 3.23,
      costPerConversion: 93.33,
      roas: 2.50,
      searchImpressionShare: 31.5
    }
  ]
}

export function getMockKeywordMetrics(): RawKeywordMetric[] {
  return [
    {
      campaignId: '101',
      keyword: 'painters in boston ma',
      matchType: 'PHRASE',
      impressions: 14200,
      clicks: 1280,
      cost: 1650.00,
      conversions: 94,
      cpc: 1.29,
      qualityScore: 9
    },
    {
      campaignId: '101',
      keyword: 'best house painters near me',
      matchType: 'PHRASE',
      impressions: 11200,
      clicks: 940,
      cost: 1320.00,
      conversions: 62,
      cpc: 1.40,
      qualityScore: 8
    },
    {
      campaignId: '102',
      keyword: 'exterior house painting cost',
      matchType: 'BROAD',
      impressions: 18500,
      clicks: 890,
      cost: 1540.00,
      conversions: 35,
      cpc: 1.73,
      qualityScore: 7
    },
    {
      campaignId: '103',
      keyword: 'kitchen cabinet refinishing boston',
      matchType: 'EXACT',
      impressions: 8900,
      clicks: 720,
      cost: 950.00,
      conversions: 48,
      cpc: 1.32,
      qualityScore: 9
    },
    {
      campaignId: '105',
      keyword: 'commercial painting contractors',
      matchType: 'BROAD',
      impressions: 9400,
      clicks: 290,
      cost: 1120.00,
      conversions: 8,
      cpc: 3.86,
      qualityScore: 5
    }
  ]
}
