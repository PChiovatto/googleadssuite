import { defineEventHandler } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const estimates = await prisma.estimate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          status: true
        }
      }
    }
  })

  return {
    estimates
  }
})
