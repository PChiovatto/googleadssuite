import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string | undefined
    const leadId = query.leadId as string | undefined

    const where: any = {}
    if (userId) where.userId = userId
    if (leadId) where.leadId = leadId

    const gpsLat = query.gpsLat ? parseFloat(query.gpsLat as string) : null
    const gpsLng = query.gpsLng ? parseFloat(query.gpsLng as string) : null

    const timeLogs = await prisma.timeLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true, hourlyRate: true } },
        lead: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            status: true,
            dealValue: true,
            serviceInterested: true
          }
        }
      },
      orderBy: { checkIn: 'desc' },
      take: 50
    })

    // Active shift for current user/worker
    let activeShift = null
    if (userId) {
      activeShift = await prisma.timeLog.findFirst({
        where: { userId, checkOut: null },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              serviceInterested: true
            }
          }
        },
        orderBy: { checkIn: 'desc' }
      })
    }

    // Active project jobs available for field execution
    const rawActiveJobs = await prisma.lead.findMany({
      where: {
        status: { in: ['CONVERTIDO', 'EM_EXECUCAO', 'PROPOSTA'] }
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        serviceInterested: true,
        status: true,
        dealValue: true,
        portalToken: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })

    const MA_CITIES: Record<string, { lat: number; lng: number }> = {
      boston: { lat: 42.3601, lng: -71.0589 },
      wakefield: { lat: 42.5065, lng: -71.0723 },
      cambridge: { lat: 42.3736, lng: -71.1097 },
      newton: { lat: 42.3370, lng: -71.2092 },
      framingham: { lat: 42.2793, lng: -71.4162 },
      somerville: { lat: 42.3876, lng: -71.0995 },
      quincy: { lat: 42.2529, lng: -71.0023 }
    }

    function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
      const R = 6371
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

    const activeJobs = rawActiveJobs.map(job => {
      let distanceKm = null
      if (gpsLat && gpsLng) {
        const cityKey = (job.city || 'boston').toLowerCase().trim()
        const coords = MA_CITIES[cityKey] || MA_CITIES['boston']
        distanceKm = Number(getDistance(gpsLat, gpsLng, coords.lat, coords.lng).toFixed(1))
      }
      return {
        ...job,
        distanceKm
      }
    })

    // Sort active jobs by proximity if distance is available
    if (gpsLat && gpsLng) {
      activeJobs.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999))
    }

    const nearestJob = activeJobs.length > 0 ? activeJobs[0] : null

    return {
      success: true,
      timeLogs,
      activeShift,
      activeJobs,
      nearestJob
    }
  } catch (error: any) {
    console.error('Erro ao buscar registros de campo:', error)
    return { success: false, error: error.message, timeLogs: [], activeJobs: [] }
  }
})
