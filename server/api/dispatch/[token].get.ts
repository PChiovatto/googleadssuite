import { defineEventHandler, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const token = event.context.params?.token
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token é obrigatório' })
  }

  const dispatch = await prisma.dispatchTracker.findUnique({
    where: { token },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          city: true,
          serviceInterested: true
        }
      }
    }
  })

  if (!dispatch) {
    throw createError({ statusCode: 404, statusMessage: 'Rastreamento não encontrado ou expirado' })
  }

  return {
    dispatch,
    lead: dispatch.lead,
    company: {
      name: "Tony's Painting and Remodeling",
      phone: "+1 (617) 555-0199",
      license: "MA HIC #192847",
      guarantee: "100% On-Time Arrival Guarantee"
    }
  }
})
