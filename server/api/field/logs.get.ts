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

    const timeLogs = await prisma.timeLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true } },
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
    const activeJobs = await prisma.lead.findMany({
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

    return {
      success: true,
      timeLogs,
      activeShift,
      activeJobs
    }
  } catch (error: any) {
    console.error('Erro ao buscar registros de campo:', error)
    return { success: false, error: error.message, timeLogs: [], activeJobs: [] }
  }
})
