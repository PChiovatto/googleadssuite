import { defineEventHandler, readBody, setCookie } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { userId } = body

    if (!userId) {
      return { success: false, message: 'userId é obrigatório.' }
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
      return { success: false, message: 'Usuário não encontrado.' }
    }

    // Set cookie for 30 days
    setCookie(event, 'auth_user_id', user.id, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      httpOnly: false
    })

    return {
      success: true,
      user,
      message: `Sessão alterada para ${user.name} (${user.role === 'MANAGER' ? 'Gestor' : 'Consultor'})`
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
