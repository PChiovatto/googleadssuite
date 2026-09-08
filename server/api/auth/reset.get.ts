import { defineEventHandler, setCookie, sendRedirect } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    let master = await prisma.user.findFirst({
      where: { role: 'MASTER' }
    })
    if (!master) {
      master = await prisma.user.findFirst({
        where: { role: 'CEO' }
      })
    }

    if (master) {
      setCookie(event, 'auth_user_id', master.id, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
        httpOnly: false
      })
    }

    return sendRedirect(event, '/', 302)
  } catch (error) {
    return sendRedirect(event, '/', 302)
  }
})
