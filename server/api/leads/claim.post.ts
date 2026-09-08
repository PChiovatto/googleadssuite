import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { leadId, userId, userName = 'Consultor' } = body || {}

    if (!leadId) {
      return { success: false, message: 'ID do Lead é obrigatório.' }
    }

    // 1. Ensure user exists or create a default consultant
    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    }

    if (!user) {
      // Find or create default active consultant
      user = await prisma.user.findFirst({ where: { role: 'CONSULTANT' } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'john@tonyspainting.com',
            name: userName || 'John Miller (Senior Estimator)',
            role: 'CONSULTANT'
          }
        })
      }
    }

    // 2. Concurrency-Safe Atomic Update (Prevents race conditions)
    const updated = await prisma.lead.updateMany({
      where: {
        id: leadId,
        ownerId: null // Only updates if NOT claimed yet
      },
      data: {
        ownerId: user.id,
        status: 'EM_ATENDIMENTO',
        claimedAt: new Date()
      }
    })

    // 3. Collision Detected: Another consultant claimed it first!
    if (updated.count === 0) {
      const currentLead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { owner: true }
      })

      const ownerName = currentLead?.owner?.name || 'outro consultor'
      return {
        success: false,
        claimed: true,
        message: `Tarde demais! Este contato já está sendo atendido por ${ownerName}.`,
        ownerName
      }
    }

    // 4. Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CLAIM_LEAD',
          userId: user.id,
          userName: user.name,
          details: JSON.stringify({ leadId, claimedAt: new Date() })
        }
      })
    } catch (auditErr) {
      console.warn('Failed to write audit log:', auditErr)
    }

    return {
      success: true,
      claimed: true,
      message: 'Lead assumido com sucesso! Conexão iniciada.',
      owner: user
    }
  } catch (err: any) {
    console.error('Error claiming lead:', err)
    return {
      success: false,
      message: err?.message || 'Falha ao processar reivindicação do lead.'
    }
  }
})
