import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { appointmentId, status, date, notes } = body

    if (!appointmentId) {
      return {
        success: false,
        message: 'appointmentId é obrigatório.'
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(status ? { status } : {}),
        ...(date ? { date: new Date(date) } : {}),
        ...(notes !== undefined ? { notes } : {})
      }
    })

    return {
      success: true,
      appointment: updated,
      message: `Agendamento atualizado para status "${updated.status}".`
    }
  } catch (error: any) {
    console.error('Error updating appointment:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
