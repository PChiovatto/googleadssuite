import { defineEventHandler, getCookie } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const cookieUserId = getCookie(event, 'auth_user_id')
    const headerUserId = event.node.req.headers['x-user-id'] as string
    const targetId = cookieUserId || headerUserId

    let user = null

    if (targetId) {
      user = await prisma.user.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true
        }
      })
    }

    if (!user) {
      // Default to CEO, Manager, Master, or first user
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { role: 'CEO' },
            { role: 'MANAGER' },
            { role: 'MASTER' }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true
        }
      })

      if (!user) {
        user = await prisma.user.findFirst({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            createdAt: true
          }
        })
      }
    }

    return {
      success: true,
      user
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})
