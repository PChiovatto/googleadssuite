import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const token = event.context.params?.token

    if (!token) {
      throw createError({ statusCode: 400, message: 'Token de rastreamento do cliente não informado.' })
    }

    // Try finding by portalToken or id fallback
    let lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { portalToken: token },
          { id: token }
        ]
      },
      include: {
        contracts: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        appointments: {
          orderBy: { date: 'asc' }
        },
        media: {
          where: {
            OR: [
              { isPublic: true },
              { type: 'PROGRESSO_OBRA' },
              { type: 'FOTO_ORIGINAL' }
            ]
          },
          orderBy: { createdAt: 'desc' }
        },
        timeLogs: {
          where: { checkOut: { not: null } },
          select: { checkIn: true, checkOut: true }
        }
      }
    })

    if (!lead) {
      throw createError({ statusCode: 404, message: 'Projeto ou obra não encontrada com o link fornecido.' })
    }

    // If portalToken is not yet saved, generate and persist it
    if (!lead.portalToken) {
      const generatedToken = `tony-${lead.id.slice(-8)}`
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: { portalToken: generatedToken },
        include: {
          contracts: { orderBy: { createdAt: 'desc' }, take: 1 },
          appointments: { orderBy: { date: 'asc' } },
          media: {
            where: {
              OR: [
                { isPublic: true },
                { type: 'PROGRESSO_OBRA' },
                { type: 'FOTO_ORIGINAL' }
              ]
            },
            orderBy: { createdAt: 'desc' }
          },
          timeLogs: {
            where: { checkOut: { not: null } },
            select: { checkIn: true, checkOut: true }
          }
        }
      })
    }

    // Calculate stage index for progress bar
    const stages = ['NOVO', 'PROPOSTA', 'CONVERTIDO', 'EM_EXECUCAO', 'FINALIZADO']
    const currentStageIndex = Math.max(0, stages.indexOf(lead.status))

    return {
      success: true,
      company: {
        name: "Tony's Painting and Remodeling Inc.",
        tradingName: "Tony's Remodeling — Painting & Carpentry",
        license: 'MA HIC Registration #204891',
        phone: '+1 (617) 555-0198',
        email: 'tony@tonyspainting.com',
        warranty: 'Garantia Escrita de 5 Anos (Massachusetts M.G.L. c. 142A)'
      },
      lead: {
        id: lead.id,
        name: lead.name,
        city: lead.city || 'Greater Boston, MA',
        address: lead.address || 'Endereço residencial cadastrado',
        serviceInterested: lead.serviceInterested || 'Pintura e Reforma Residencial',
        status: lead.status,
        dealValue: lead.dealValue,
        portalToken: lead.portalToken,
        createdAt: lead.createdAt
      },
      timeline: {
        stages,
        currentStageIndex,
        currentStageName: lead.status
      },
      contract: lead.contracts[0] || null,
      appointments: lead.appointments || [],
      photos: lead.media || []
    }
  } catch (error: any) {
    console.error('Erro ao carregar portal do cliente:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao carregar os dados da obra.'
    })
  }
})
