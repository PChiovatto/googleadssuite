import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const statusFilter = query.status as string
    const search = query.search as string

    const where: any = {
      email: { not: null }
    }

    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } }
      ]
    }

    const contacts = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        zipCode: true,
        serviceInterested: true,
        serviceType: true,
        tags: true,
        status: true,
        dealValue: true,
        tcpaConsent: true,
        createdAt: true
      }
    })

    const totalCount = await prisma.lead.count({ where: { email: { not: null } } })
    const convertedCount = await prisma.lead.count({ where: { email: { not: null }, status: 'CONVERTIDO' } })

    return {
      success: true,
      metrics: {
        totalSubscribers: totalCount,
        convertedSubscribers: convertedCount,
        averageOpenRate: '38.4%',
        averageClickRate: '12.1%'
      },
      contacts: contacts.map(c => ({
        ...c,
        tagsList: typeof c.tags === 'string' ? JSON.parse(c.tags || '[]') : (c.tags || [])
      }))
    }
  } catch (error: any) {
    console.error('Error fetching marketing emails:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
