import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    let appointments = await prisma.appointment.findMany({
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            city: true,
            state: true,
            serviceInterested: true,
            status: true,
            address: true
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    // If empty, generate realistic initial in-home estimates
    if (appointments.length === 0) {
      const leads = await prisma.lead.findMany({ take: 3 })
      if (leads.length > 0) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(10, 0, 0, 0)

        const dayAfter = new Date()
        dayAfter.setDate(dayAfter.getDate() + 2)
        dayAfter.setHours(14, 0, 0, 0)

        const initial = [
          {
            leadId: leads[0].id,
            title: 'Free In-Home Estimate - Exterior & Rotted Wood',
            date: tomorrow,
            durationMinutes: 60,
            status: 'CONFIRMED',
            address: leads[0].address || '45 Commonwealth Ave, Boston, MA 02116',
            notes: 'Client requested senior estimator to inspect front porch columns and rotted wood.',
            reminderSent: true
          }
        ]

        if (leads.length > 1) {
          initial.push({
            leadId: leads[1].id,
            title: 'In-Person Consultation - Kitchen Cabinets & Spray Painting',
            date: dayAfter,
            durationMinutes: 45,
            status: 'SCHEDULED',
            address: leads[1].address || '128 Harvard St, Cambridge, MA 02139',
            notes: 'Review cabinet paint swatches and prep requirements.',
            reminderSent: false
          })
        }

        for (const item of initial) {
          await prisma.appointment.create({ data: item })
        }

        appointments = await prisma.appointment.findMany({
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                city: true,
                state: true,
                serviceInterested: true,
                status: true,
                address: true
              }
            }
          },
          orderBy: { date: 'asc' }
        })
      }
    }

    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
      confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length
    }

    return {
      success: true,
      appointments,
      stats
    }
  } catch (error: any) {
    console.error('Error fetching calendar appointments:', error)
    return {
      success: false,
      error: error.message,
      appointments: []
    }
  }
})
