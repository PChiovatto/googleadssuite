import { defineEventHandler, getQuery, readBody, getMethod } from 'h3'
import { prisma } from '../../utils/prisma'

// Massachusetts Municipal Permit Knowledge Base (780 CMR & Historic District Bylaws)
const MA_MUNICIPAL_PERMIT_RULES: Record<string, {
  requiresPermitByDefault: boolean
  epaLeadSafeLikely: boolean
  historicDistrictReview: boolean
  issuingAuthority: string
  leadTurnaroundDays: number
  guidelines: string
}> = {
  'boston': {
    requiresPermitByDefault: false,
    epaLeadSafeLikely: true,
    historicDistrictReview: true,
    issuingAuthority: 'City of Boston Inspectional Services Dept (ISD)',
    leadTurnaroundDays: 5,
    guidelines: 'Pintura residencial padrão não exige alvará de construção, exceto em distritos históricos (Beacon Hill, Back Bay, South End) onde alterações externas requerem Landmarks Commission. Imóveis pré-1978 exigem conformidade EPA RRP Lead-Safe.'
  },
  'cambridge': {
    requiresPermitByDefault: false,
    epaLeadSafeLikely: true,
    historicDistrictReview: true,
    issuingAuthority: 'Cambridge Inspectional Services Department',
    leadTurnaroundDays: 7,
    guidelines: 'Exige protocolo rígido de contenção de pó e raspagem segura para casas pré-1978. Pintura externa em Harvard Square/Brattle St requer autorização da Historic Commission.'
  },
  'wakefield': {
    requiresPermitByDefault: false,
    epaLeadSafeLikely: true,
    historicDistrictReview: false,
    issuingAuthority: 'Town of Wakefield Building Department',
    leadTurnaroundDays: 3,
    guidelines: 'Pintura de manutenção estética isenta de alvará. Reformas estruturais ou reparos extensivos de rotted wood exigem building permit municipal.'
  },
  'newton': {
    requiresPermitByDefault: false,
    epaLeadSafeLikely: true,
    historicDistrictReview: true,
    issuingAuthority: 'City of Newton Inspectional Services',
    leadTurnaroundDays: 5,
    guidelines: 'Casas com mais de 50 anos têm revisão de preservação histórica antes de alterações em fachadas. Protocolo EPA obrigatório.'
  },
  'somerville': {
    requiresPermitByDefault: false,
    epaLeadSafeLikely: true,
    historicDistrictReview: false,
    issuingAuthority: 'Somerville Inspectional Services Division',
    leadTurnaroundDays: 4,
    guidelines: 'Inspeção de andaimes para calçadas públicas requer alvará de ocupação de via pública (DPW). Contenção de chumbo padrão MA.'
  },
  'brookline': {
    requiresPermitByDefault: false,
    epaLeadSafeLikely: true,
    historicDistrictReview: true,
    issuingAuthority: 'Brookline Building Department & Preservation Commission',
    leadTurnaroundDays: 10,
    guidelines: 'Distritos locais de preservação exigem aprovação de paleta de cores externas em imóveis tombados.'
  },
  'framingham': {
    requiresPermitByDefault: false,
    epaLeadSafeLikely: false,
    historicDistrictReview: false,
    issuingAuthority: 'City of Framingham Building Inspections',
    leadTurnaroundDays: 3,
    guidelines: 'Processo simplificado. Alvara apenas se houver demolição de drywall ou modificação elétrica/encanamento.'
  }
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const leadId = query.leadId as string | undefined

    if (leadId) {
      const permits = await prisma.permitCompliance.findMany({
        where: { leadId },
        include: { lead: true }
      })
      return { success: true, permits }
    }

    // List all permit compliances
    const allPermits = await prisma.permitCompliance.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: { id: true, name: true, city: true, address: true, serviceInterested: true, status: true }
        }
      }
    })

    return { success: true, permits: allPermits }
  }

  if (method === 'POST') {
    const body = await readBody(event).catch(() => ({}))
    const { leadId, city: rawCity, notes, status } = body

    if (!leadId) {
      return { success: false, message: 'leadId é obrigatório.' }
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return { success: false, message: 'Lead não encontrado.' }
    }

    const cityKey = (rawCity || lead.city || 'Wakefield').toLowerCase().trim()
    const rule = MA_MUNICIPAL_PERMIT_RULES[cityKey] || {
      requiresPermitByDefault: false,
      epaLeadSafeLikely: true,
      historicDistrictReview: false,
      issuingAuthority: `Town/City of ${lead.city || 'Massachusetts'} Building Department`,
      leadTurnaroundDays: 4,
      guidelines: 'Conformidade geral com o Código Estadual 780 CMR e norma EPA RRP Lead-Safe para pinturas residenciais.'
    }

    // Determine permit requirement based on service type
    const isStructural = (lead.serviceInterested || '').toLowerCase().includes('drywall') ||
                         (lead.serviceInterested || '').toLowerCase().includes('remodel') ||
                         (lead.serviceInterested || '').toLowerCase().includes('reparo estrutural')

    const requiresPermit = rule.requiresPermitByDefault || isStructural
    const permitType = isStructural 
      ? 'BUILDING_PERMIT' 
      : (rule.historicDistrictReview ? 'HISTORIC_DISTRICT' : 'EPA_LEAD_SAFE')

    const permit = await prisma.permitCompliance.create({
      data: {
        leadId: lead.id,
        city: lead.city || rawCity || 'Wakefield',
        requiresPermit,
        status: status || (requiresPermit ? 'PENDING' : 'EXEMPT'),
        permitType,
        notes: notes || `${rule.issuingAuthority}. ${rule.guidelines}`
      }
    })

    return {
      success: true,
      permit,
      complianceRule: rule
    }
  }

  return { success: false, message: 'Método não suportado' }
})
