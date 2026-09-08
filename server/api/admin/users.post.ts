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
        statusMessage: 'Access Denied: Only MASTER administrators can create new profiles.'
      })
    }

    const body = await readBody(event)
    const { name, email, password, role, hourlyRate, avatarUrl } = body

    if (!email || !name || !role) {
      return { success: false, message: 'Name, email, and role are required fields.' }
    }

    // Check if email is already in use
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (existing) {
      return { success: false, message: `A user with email ${email} already exists.` }
    }

    const validRoles = ['MASTER', 'CEO', 'SALES', 'FIELD_WORKER']
    if (!validRoles.includes(role)) {
      return { success: false, message: `Invalid role specified. Must be one of: ${validRoles.join(', ')}` }
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password || 'tonys2026',
        role,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 35.0,
        avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hourlyRate: true,
        avatarUrl: true,
        createdAt: true
      }
    })

    return {
      success: true,
      user: newUser,
      message: `Profile created successfully for ${newUser.name} as ${newUser.role}.`
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    return { success: false, error: error.message }
  }
})
