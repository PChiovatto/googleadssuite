import { defineEventHandler, getCookie, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const cookieUserId = getCookie(event, 'auth_user_id')
    const headerUserId = event.node.req.headers['x-user-id'] as string
    const targetId = cookieUserId || headerUserId

    let currentUser = null
    if (targetId) {
      currentUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, role: true, email: true }
      })
    } else {
      // Default to first user or Master
      currentUser = await prisma.user.findFirst({
        where: { role: 'MASTER' },
        select: { id: true, role: true, email: true }
      })
    }

    if (!currentUser || (currentUser.role !== 'MASTER' && currentUser.role !== 'ADMIN')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied: Only MASTER administrators are authorized to configure user profiles.'
      })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hourlyRate: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            leads: true,
            timeLogs: true,
            emails: true
          }
        }
      }
    })

    return {
      success: true,
      users
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    return { success: false, error: error.message }
  }
})
