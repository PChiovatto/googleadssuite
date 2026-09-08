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
        statusMessage: 'Access Denied: Only MASTER administrators can configure user profiles.'
      })
    }

    const body = await readBody(event)
    const { id, name, email, role, hourlyRate, avatarUrl, password } = body

    if (!id) {
      return { success: false, message: 'User ID is required.' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return { success: false, message: 'User profile not found.' }
    }

    // If changing email, ensure it's not taken by another user
    if (email && email.trim().toLowerCase() !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() }
      })
      if (emailTaken) {
        return { success: false, message: `Email ${email} is already in use by another profile.` }
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name.trim()
    if (email) updateData.email = email.trim().toLowerCase()
    if (role) updateData.role = role
    if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate)
    if (avatarUrl) updateData.avatarUrl = avatarUrl.trim()
    if (password && password.trim().length > 0) updateData.password = password.trim()

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
      user: updatedUser,
      message: `Profile for ${updatedUser.name} updated successfully.`
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    return { success: false, error: error.message }
  }
})
