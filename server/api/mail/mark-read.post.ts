import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { emailId, read, starred } = body

    if (!emailId) {
      return { success: false, message: 'emailId é obrigatório.' }
    }

    const updated = await prisma.emailMessage.update({
      where: { id: emailId },
      data: {
        ...(read !== undefined ? { read: Boolean(read) } : {}),
        ...(starred !== undefined ? { starred: Boolean(starred) } : {})
      }
    })

    return {
      success: true,
      email: updated
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
