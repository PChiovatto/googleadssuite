import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { leadId, status, notes } = body || {}

    if (!leadId) {
      return { success: false, error: 'ID do Lead é obrigatório' }
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {})
      }
    })

    return {
      success: true,
      lead: updated
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Falha ao atualizar status'
    }
  }
})
