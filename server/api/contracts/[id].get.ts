import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'ID do contrato é obrigatório' })
    }

    const contract = await prisma.contract.findFirst({
      where: {
        OR: [
          { contractNumber: id },
          { id }
        ]
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            serviceInterested: true,
            status: true
          }
        }
      }
    })

    if (!contract) {
      throw createError({ statusCode: 404, statusMessage: 'Contrato não encontrado' })
    }

    return {
      success: true,
      contract
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})
