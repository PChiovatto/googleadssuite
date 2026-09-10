import { defineEventHandler, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const token = event.context.params?.token
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token é obrigatório' })
  }

  const reviewReq = await prisma.reviewRequest.findUnique({
    where: { token },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          serviceInterested: true,
          city: true
        }
      }
    }
  })

  if (!reviewReq) {
    throw createError({ statusCode: 404, statusMessage: 'Solicitação de avaliação não encontrada ou expirada' })
  }

  return {
    reviewRequest: reviewReq,
    lead: reviewReq.lead,
    company: {
      name: "Tony's Painting and Remodeling",
      logo: "/logo-tonys.png",
      phone: "+1 (617) 555-0199"
    }
  }
})
