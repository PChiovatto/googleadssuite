import { defineEventHandler, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const token = event.context.params?.token
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token é obrigatório' })
  }

  const estimate = await prisma.estimate.findUnique({
    where: { token },
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
          serviceInterested: true
        }
      }
    }
  })

  if (!estimate) {
    throw createError({ statusCode: 404, statusMessage: 'Orçamento não encontrado ou expirado' })
  }

  let parsedAddons = []
  try {
    parsedAddons = JSON.parse(estimate.addonsJson || '[]')
  } catch {
    parsedAddons = []
  }

  return {
    estimate: {
      ...estimate,
      addons: parsedAddons
    },
    company: {
      name: "Tony's Painting and Remodeling",
      license: "MA HIC #192847 | EPA Lead-Safe Certified",
      phone: "+1 (617) 555-0199",
      email: "contact@tonyspainting.com",
      address: "Greater Boston & Metrowest, MA",
      terms: "Conforme a legislação de Massachusetts (M.G.L. c. 142A), o depósito inicial é estritamente limitado ao teto máximo legal de 1/3 (33,33%) do valor do contrato."
    }
  }
})
