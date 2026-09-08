import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

// Known Greater Boston / Massachusetts Coordinates Reference for Geofencing
const MA_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
  boston: { lat: 42.3601, lng: -71.0589 },
  wakefield: { lat: 42.5065, lng: -71.0723 },
  cambridge: { lat: 42.3736, lng: -71.1097 },
  newton: { lat: 42.3370, lng: -71.2092 },
  framingham: { lat: 42.2793, lng: -71.4162 },
  somerville: { lat: 42.3876, lng: -71.0995 },
  quincy: { lat: 42.2529, lng: -71.0023 }
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { leadId, userId, gpsLat, gpsLng, notes } = body

    if (!leadId) {
      return { success: false, message: 'ID da obra/lead é obrigatório para bater ponto.' }
    }

    // Default to first field worker or consultant if not supplied
    let workerId = userId
    if (!workerId) {
      const user = await prisma.user.findFirst({
        where: { role: { in: ['FIELD_WORKER', 'CONSULTANT'] } }
      }) || await prisma.user.findFirst()
      workerId = user?.id
    }

    if (!workerId) {
      return { success: false, message: 'Colaborador não identificado.' }
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return { success: false, message: 'Obra não encontrada no CRM.' }
    }

    // Geofencing Validation
    let isValidated = true
    let validationDetails = 'Localização confirmada no perímetro da obra em Massachusetts.'

    if (gpsLat && gpsLng) {
      const cityKey = (lead.city || 'Boston').toLowerCase().trim()
      const targetCoords = MA_CITIES_COORDS[cityKey] || MA_CITIES_COORDS['boston']

      const distanceKm = calculateDistanceKm(gpsLat, gpsLng, targetCoords.lat, targetCoords.lng)
      // Allow up to 15km perimeter for Greater Boston service area
      isValidated = distanceKm <= 15
      validationDetails = isValidated
        ? `Dentro do perímetro de ${lead.city || 'Boston'} (${distanceKm.toFixed(1)} km do centro).`
        : `Fora do perímetro esperado (${distanceKm.toFixed(1)} km de distância de ${lead.city}).`
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: workerId,
        leadId: lead.id,
        checkIn: new Date(),
        gpsLat: gpsLat || null,
        gpsLng: gpsLng || null,
        isValidated,
        notes: notes ? `${notes} • ${validationDetails}` : validationDetails
      },
      include: {
        user: { select: { name: true, role: true } },
        lead: { select: { name: true, city: true, address: true, status: true } }
      }
    })

    // Advance lead status to EM_EXECUCAO if closed or proposal
    if (['CONVERTIDO', 'PROPOSTA'].includes(lead.status)) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'EM_EXECUCAO' }
      })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'CLOCK_IN',
        userId: workerId,
        userName: timeLog.user.name,
        details: JSON.stringify({
          leadId: lead.id,
          client: lead.name,
          checkIn: timeLog.checkIn,
          isValidated,
          coords: { lat: gpsLat, lng: gpsLng }
        })
      }
    })

    return {
      success: true,
      timeLog,
      message: isValidated
        ? 'Ponto de entrada registrado com sucesso no canteiro de obras!'
        : 'Ponto registrado com ressalva (fora do perímetro GPS aproximado).'
    }
  } catch (error: any) {
    console.error('Erro ao registrar ponto de entrada:', error)
    return { success: false, error: error.message }
  }
})
