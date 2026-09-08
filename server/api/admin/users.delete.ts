import { defineEventHandler, readBody, getCookie, createError } from 'h3'
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
        select: { id: true, role: true }
      })
    } else {
      currentUser = await prisma.user.findFirst({
        where: { role: 'MASTER' },
        select: { id: true, role: true }
      })
    }

    if (!currentUser || (currentUser.role !== 'MASTER' && currentUser.role !== 'ADMIN')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access Denied: Only MASTER administrators can remove user profiles.'
      })
    }

    const body = await readBody(event)
    const { id } = body

    if (!id) {
      return { success: false, message: 'User ID is required.' }
    }

    if (id === currentUser.id) {
      return { success: false, message: 'Security restriction: You cannot delete your currently active Master session.' }
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true }
    })

    if (!targetUser) {
      return { success: false, message: 'User profile not found.' }
    }

    // If target is also a MASTER, make sure at least one other MASTER remains
    if (targetUser.role === 'MASTER') {
      const masterCount = await prisma.user.count({
        where: { role: 'MASTER' }
      })
      if (masterCount <= 1) {
        return { success: false, message: 'Security restriction: Cannot delete the last remaining Master Administrator.' }
      }
    }

    await prisma.user.delete({
      where: { id }
    })

    return {
      success: true,
      message: `Profile for ${targetUser.name} (${targetUser.role}) has been removed.`
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    return { success: false, error: error.message }
  }
})
