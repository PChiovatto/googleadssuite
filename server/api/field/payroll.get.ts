import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userIdQuery = query.userId as string | undefined
    const weekOffset = parseInt((query.weekOffset as string) || '0', 10)

    // Find target user (Field worker / consultant)
    let worker = null
    if (userIdQuery) {
      worker = await prisma.user.findUnique({ where: { id: userIdQuery } })
    }
    if (!worker) {
      worker = await prisma.user.findFirst({
        where: { role: { in: ['FIELD_WORKER', 'CONSULTANT'] } }
      }) || await prisma.user.findFirst()
    }

    if (!worker) {
      return { success: false, message: 'Nenhum colaborador encontrado.' }
    }

    const hourlyRate = worker.hourlyRate || 35.0

    // Compute Week Start (Monday) and Week End (Sunday) based on weekOffset
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sun, 1 = Mon...
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay

    const targetMonday = new Date(now)
    targetMonday.setDate(now.getDate() + diffToMonday + weekOffset * 7)
    targetMonday.setHours(0, 0, 0, 0)

    const targetSunday = new Date(targetMonday)
    targetSunday.setDate(targetMonday.getDate() + 6)
    targetSunday.setHours(23, 59, 59, 999)

    // Fetch logs for the specified week
    const weekLogs = await prisma.timeLog.findMany({
      where: {
        userId: worker.id,
        checkIn: {
          gte: targetMonday,
          lte: targetSunday
        }
      },
      include: {
        lead: {
          select: { id: true, name: true, city: true, address: true, serviceInterested: true }
        }
      },
      orderBy: { checkIn: 'asc' }
    })

    // Breakdown for each of the 7 days of the target week (Mon to Sun)
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    const dayShorts = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const dailyBreakdown = []

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(targetMonday)
      dayDate.setDate(targetMonday.getDate() + i)
      const dayStart = new Date(dayDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayDate)
      dayEnd.setHours(23, 59, 59, 999)

      const logsForDay = weekLogs.filter(log => {
        const checkIn = new Date(log.checkIn)
        return checkIn >= dayStart && checkIn <= dayEnd
      })

      let hoursForDay = 0
      let earnedForDay = 0
      for (const log of logsForDay) {
        let h = log.totalHours
        if (h === null || h === undefined) {
          if (log.checkOut) {
            const raw = (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60)
            h = Math.max(0.1, raw >= 0.5 ? raw - 0.5 : raw)
          } else {
            h = 0
          }
        }
        hoursForDay += h
        earnedForDay += log.earnedPay !== null && log.earnedPay !== undefined ? log.earnedPay : h * hourlyRate
      }

      dailyBreakdown.push({
        dayName: dayNames[i],
        dayShort: dayShorts[i],
        dateStr: dayDate.toISOString().split('T')[0],
        dateFormatted: dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        hours: Number(hoursForDay.toFixed(1)),
        earnedPay: Number(earnedForDay.toFixed(2)),
        shiftsCount: logsForDay.length,
        logs: logsForDay
      })
    }

    const totalWeekHours = Number(dailyBreakdown.reduce((acc, d) => acc + d.hours, 0).toFixed(1))
    const totalWeekEarned = Number(dailyBreakdown.reduce((acc, d) => acc + d.earnedPay, 0).toFixed(2))

    // Monthly summary (current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const daysInMonth = monthEnd.getDate()
    const currentDayOfMonth = Math.max(1, now.getDate())

    const monthLogs = await prisma.timeLog.findMany({
      where: {
        userId: worker.id,
        checkIn: { gte: monthStart, lte: monthEnd },
        checkOut: { not: null }
      }
    })

    let totalMonthHours = 0
    let totalMonthEarned = 0
    for (const log of monthLogs) {
      const h = log.totalHours || (log.checkOut ? Math.max(0.1, ((new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60)) - 0.5) : 0)
      totalMonthHours += h
      totalMonthEarned += log.earnedPay || (h * hourlyRate)
    }

    totalMonthHours = Number(totalMonthHours.toFixed(1))
    totalMonthEarned = Number(totalMonthEarned.toFixed(2))

    // Monthly projection based on current run rate
    const projectedMonthEarned = Number(((totalMonthEarned / currentDayOfMonth) * daysInMonth).toFixed(2))

    // Format week range label
    const weekLabel = `${targetMonday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${targetSunday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`

    return {
      success: true,
      worker: {
        id: worker.id,
        name: worker.name,
        role: worker.role,
        hourlyRate
      },
      weekOffset,
      weekLabel,
      weekRange: {
        start: targetMonday.toISOString(),
        end: targetSunday.toISOString()
      },
      totalWeekHours,
      totalWeekEarned,
      dailyBreakdown,
      monthSummary: {
        monthName: now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        totalHours: totalMonthHours,
        totalEarned: totalMonthEarned,
        projectedEarned: projectedMonthEarned
      },
      weekLogs
    }
  } catch (error: any) {
    console.error('Erro ao calcular holerite do colaborador:', error)
    return { success: false, error: error.message }
  }
})
