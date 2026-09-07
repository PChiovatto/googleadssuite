import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // 1. Create a lead manually via POST
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const lead = await prisma.lead.create({
        data: {
          source: body.source || 'ORGANIC',
          name: body.name || 'Lead sem nome',
          email: body.email || null,
          phone: body.phone || null,
          serviceInterested: body.serviceInterested || null,
          status: body.status || 'NOVO',
          notes: body.notes || null,
          rawData: JSON.stringify(body || {})
        }
      })
      return { success: true, lead }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha ao criar lead' }
    }
  }

  // 2. GET: List all leads
  try {
    let leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // If leads table is empty, seed realistic initial leads
    if (leads.length === 0) {
      const initialLeads = [
        {
          source: 'GOOGLE_ADS',
          campaignId: '101',
          campaignName: 'Search - Boston High Intent Painters',
          name: 'Robert Sullivan',
          email: 'rsullivan.boston@gmail.com',
          phone: '+1 (617) 555-3291',
          serviceInterested: 'Pintura Interior Completa (Sala, Cozinha e 3 Quartos) - South Boston',
          status: 'NOVO',
          aiScore: 9,
          aiQualification: 'Alta intenção de compra. Imóvel recém-adquirido necessitando de pintura imediata antes da mudança.',
          whatsappScript: 'Olá Robert! Aqui é da First Boston Painters. Vimos seu pedido de orçamento para a pintura interior em South Boston. Podemos agendar uma visita gratuita amanhã às 10h para avaliar o espaço e passar o orçamento na hora?',
          notes: 'Preencheu formulário de extensão de anúncio no Google Search.',
          rawData: JSON.stringify({ source: 'google_lead_extension', form_id: 'form_interior_boston_01' })
        },
        {
          source: 'GOOGLE_ADS',
          campaignId: '102',
          campaignName: 'Search - Exterior Painting Massachusetts',
          name: 'Patricia Alencar',
          email: 'patricia.alencar@yahoo.com',
          phone: '+1 (508) 555-9012',
          serviceInterested: 'Pintura Exterior & Reparo de Madeiras Podres (Rotted Wood) - Framingham MA',
          status: 'EM_ATENDIMENTO',
          aiScore: 8,
          aiQualification: 'Lead qualificado com urgência moderada. Necessita de reparo de carpintaria antes do inverno.',
          whatsappScript: 'Olá Patricia! Tudo bem? Recebemos sua solicitação para pintura externa e troca de madeira danificada. Nossa equipe especializada em prep work atende sua região em Framingham. Gostaria de agendar o free estimate esta semana?',
          notes: 'Entrou em contato pedindo fotos de antes e depois de restauração exterior.',
          rawData: JSON.stringify({ source: 'google_search_ad', form_id: 'form_exterior_ma_02' })
        },
        {
          source: 'GOOGLE_BUSINESS',
          campaignId: null,
          campaignName: null,
          name: 'Carlos Mendes',
          email: 'carlos.mendes.bos@gmail.com',
          phone: '+1 (617) 555-8921',
          serviceInterested: 'Pintura Externa Completa de Casa (2 andares) - Somerville MA',
          status: 'NOVO',
          aiScore: 9,
          aiQualification: 'Lead vindo do Google Maps com alta confiança nas avaliações 5 estrelas. Pronto para fechar orçamento.',
          whatsappScript: 'Olá Carlos, obrigado pelo contato através do nosso Perfil no Google Meu Negócio! Ficamos felizes em ajudar com a pintura externa da sua casa em Somerville. Que dia fica melhor para fazermos a medição sem compromisso?',
          notes: 'Mensagem recebida pelo perfil da empresa no Google Maps.',
          rawData: JSON.stringify({ source: 'google_business_profile_message' })
        },
        {
          source: 'GOOGLE_BUSINESS',
          campaignId: null,
          campaignName: null,
          name: 'Jennifer Smith',
          email: 'jsmith.realty@outlook.com',
          phone: '+1 (781) 555-4309',
          serviceInterested: 'Restauração e Pintura Spray de Armários de Cozinha - Cambridge MA',
          status: 'CONVERTIDO',
          aiScore: 10,
          aiQualification: 'Corretora de imóveis preparando casa para venda. Fechou contrato de $3.800.',
          whatsappScript: 'Contrato assinado. Início dos trabalhos agendado para a próxima segunda-feira.',
          notes: 'Cliente convertida após visita e demonstração de amostras de tinta.',
          rawData: JSON.stringify({ source: 'google_business_profile_call' })
        },
        {
          source: 'GOOGLE_ADS',
          campaignId: '103',
          campaignName: 'Performance Max - Residential & Cabinets',
          name: 'Michael Chang',
          email: 'mchang88@gmail.com',
          phone: '+1 (617) 555-1442',
          serviceInterested: 'Remoção de Papel de Parede e Massa Corrida (Skim Coat)',
          status: 'PERDIDO',
          aiScore: 4,
          aiQualification: 'Procurava apenas compra de materiais/tinta, não contratação de serviço.',
          whatsappScript: 'Cliente esclarecido de que realizamos apenas a prestação de serviço completo.',
          notes: 'Desqualificado por falta de fit.',
          rawData: JSON.stringify({ source: 'google_pmax_lead' })
        }
      ]

      for (const item of initialLeads) {
        await prisma.lead.create({ data: item })
      }

      leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }

    // Compute summary stats
    const stats = {
      total: leads.length,
      ads: leads.filter(l => l.source === 'GOOGLE_ADS').length,
      gbp: leads.filter(l => l.source === 'GOOGLE_BUSINESS').length,
      organic: leads.filter(l => l.source === 'ORGANIC').length,
      converted: leads.filter(l => l.status === 'CONVERTIDO').length,
      inProgress: leads.filter(l => l.status === 'EM_ATENDIMENTO').length,
      newLeads: leads.filter(l => l.status === 'NOVO').length
    }

    return {
      success: true,
      leads,
      stats
    }
  } catch (err: any) {
    console.error('Erro em /api/leads:', err)
    return {
      success: false,
      error: err?.message || 'Falha ao buscar leads'
    }
  }
})
