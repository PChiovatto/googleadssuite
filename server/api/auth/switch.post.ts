import { defineEventHandler, readBody, setCookie } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { userId } = body

    if (!userId) {
      return { success: false, message: 'User ID is required.' }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    })

    if (!user) {
      return { success: false, message: 'User not found.' }
    }

    // Set cookie for 30 days
    setCookie(event, 'auth_user_id', user.id, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      httpOnly: false
    })

    const roleMap: Record<string, string> = {
      MASTER: 'Master Administrator',
      CEO: 'CEO & General Manager',
      MANAGER: 'CEO & General Manager',
      SALES: 'Sales Estimator',
      CONSULTANT: 'Sales Estimator',
      FIELD_WORKER: 'Field Technician'
    }

    const roleTitle = roleMap[user.role] || user.role

    return {
      success: true,
      user,
      message: `Active session switched to ${user.name} (${roleTitle})`
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
