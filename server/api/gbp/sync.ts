import { defineEventHandler } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  try {
    // In production, connects with Google Business Profile API (v1)
    // using OAuth2 and locations/{locationId}
    const sampleGbpInquiries = [
      {
        name: 'Carlos Mendes',
        phone: '+1 (617) 555-8921',
        email: 'carlos.mendes.bos@gmail.com',
        serviceInterested: 'Pintura Externa Completa de Casa (2 andares) - Somerville MA',
        notes: 'Contato via Perfil da Empresa no Google Maps. Viu fotos do projeto e avaliações 5 estrelas.',
        status: 'NOVO'
      },
      {
        name: 'Jennifer Smith',
        phone: '+1 (781) 555-4309',
        email: 'jsmith.realty@outlook.com',
        serviceInterested: 'Restauração e Pintura de Armários de Cozinha - Cambridge MA',
        notes: 'Mensagem direta do Google Meu Negócio: "Vocês atendem Cambridge? Gostaria de um orçamento gratuito para armários".',
        status: 'NOVO'
      },
      {
        name: 'Eduardo Silveira',
        phone: '+1 (508) 555-7712',
        email: 'eduardo.silveira99@gmail.com',
        serviceInterested: 'Lavagem de Alta Pressão (Power Washing) e Reparo de Deck de Madeira',
        notes: 'Clique de chamada registrado no Google Meu Negócio.',
        status: 'EM_ATENDIMENTO'
      }
    ]

    let addedCount = 0

    for (const item of sampleGbpInquiries) {
      // Check if lead already exists by phone
      const existing = await prisma.lead.findFirst({
        where: { phone: item.phone }
      })

      if (!existing) {
        await prisma.lead.create({
          data: {
            source: 'GOOGLE_BUSINESS',
            name: item.name,
            phone: item.phone,
            email: item.email,
            serviceInterested: item.serviceInterested,
            notes: item.notes,
            status: item.status,
            rawData: JSON.stringify(item)
          }
        })
        addedCount++
      }
    }

    return {
      success: true,
      message: `Google Meu Negócio sincronizado! ${addedCount} novos contatos adicionados ao CRM.`,
      addedCount
    }
  } catch (error: any) {
    console.error('Erro na sincronização do Google Meu Negócio:', error)
    return {
      success: false,
      error: error?.message || 'Falha ao sincronizar Google Meu Negócio'
    }
  }
})
