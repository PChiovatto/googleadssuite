import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

const HOURLY_LABOR_RATE_USD = 45.0 // Average MA painter/carpenter loaded wage

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { timeLogId, leadId, userId, notes } = body

    let timeLog = null
    if (timeLogId) {
      timeLog = await prisma.timeLog.findUnique({ where: { id: timeLogId } })
    } else if (userId) {
      timeLog = await prisma.timeLog.findFirst({
        where: { userId, checkOut: null },
        orderBy: { checkIn: 'desc' }
      })
    } else if (leadId) {
      timeLog = await prisma.timeLog.findFirst({
        where: { leadId, checkOut: null },
        orderBy: { checkIn: 'desc' }
      })
    }

    if (!timeLog) {
      return { success: false, message: 'Nenhum registro de ponto aberto encontrado.' }
    }

    const checkOut = new Date()
    const checkIn = new Date(timeLog.checkIn)
    const durationHours = Math.max(0.25, (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60))

    const updatedLog = await prisma.timeLog.update({
      where: { id: timeLog.id },
      data: {
        checkOut,
        notes: notes ? `${timeLog.notes || ''} • Saída: ${notes}` : timeLog.notes
      },
      include: {
        user: { select: { name: true, role: true } },
        lead: true
      }
    })

    // Recalculate Job Costing & Net Profit for the Lead
    const allLeadLogs = await prisma.timeLog.findMany({
      where: { leadId: timeLog.leadId, checkOut: { not: null } }
    })

    let totalLaborHours = 0
    for (const log of allLeadLogs) {
      if (log.checkOut && log.checkIn) {
        totalLaborHours += (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60)
      }
    }

    const totalLaborCost = totalLaborHours * HOURLY_LABOR_RATE_USD

    // Sum material orders
    const materials = await prisma.materialOrder.findMany({
      where: { leadId: timeLog.leadId }
    })
    const totalMaterialsCost = materials.reduce((acc, m) => acc + (m.totalCost || 0), 0)

    const dealValue = updatedLog.lead.dealValue || 0
    const netProfit = Number((dealValue - (totalLaborCost + totalMaterialsCost)).toFixed(2))

    await prisma.lead.update({
      where: { id: timeLog.leadId },
      data: { netProfit }
    })

    // Log in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'CLOCK_OUT',
        userId: updatedLog.userId,
        userName: updatedLog.user.name,
        details: JSON.stringify({
          leadId: timeLog.leadId,
          client: updatedLog.lead.name,
          hoursWorked: durationHours.toFixed(2),
          totalLaborHours: totalLaborHours.toFixed(2),
          totalLaborCost,
          totalMaterialsCost,
          netProfit
        })
      }
    })

    return {
      success: true,
      timeLog: updatedLog,
      hoursWorked: Number(durationHours.toFixed(2)),
      jobCosting: {
        dealValue,
        totalLaborCost: Number(totalLaborCost.toFixed(2)),
        totalMaterialsCost: Number(totalMaterialsCost.toFixed(2)),
        netProfit
      },
      message: `Ponto de saída registrado com sucesso! (${durationHours.toFixed(2)} horas computadas)`
    }
  } catch (error: any) {
    console.error('Erro ao registrar ponto de saída:', error)
    return { success: false, error: error.message }
  }
})
