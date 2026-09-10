const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding demo data for 5 Cutting-Edge Features...')

  // 1. Get or create a primary lead
  let lead = await prisma.lead.findFirst({
    where: { phone: '+1 (617) 555-0198' }
  })

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        source: 'GOOGLE_ADS',
        name: 'Sarah Jenkins (Wellesley, MA)',
        phone: '+1 (617) 555-0198',
        email: 'sarah.jenkins.boston@gmail.com',
        address: '42 Forest Street, Wellesley, MA 02482',
        city: 'Wellesley',
        state: 'MA',
        zipCode: '02482',
        serviceInterested: 'Pintura Externa Residencial & Deck',
        status: 'PROPOSTA',
        dealValue: 7800.0,
        mctbTriggered: true,
        mctbStatus: 'ENGAGED',
        notes: 'Cliente de alto padrão em Wellesley interessada em pintura externa e verniz no deck.'
      }
    })
  }

  // 2. Seed an Estimate (Feature 1)
  const existingEstimate = await prisma.estimate.findFirst({
    where: { leadId: lead.id }
  })

  if (!existingEstimate) {
    await prisma.estimate.create({
      data: {
        leadId: lead.id,
        token: 'tonys-wellesley-demo',
        title: 'Pintura Externa & Restauração de Deck - Wellesley Residence',
        selectedTier: 'BETTER',
        goodTitle: 'Bronze Standard',
        goodPrice: 5400.0,
        goodScope: '1 Demão de Tinta Duration, lixamento e raspagem básica, proteção de jardim e 1 ano de garantia.',
        betterTitle: 'Silver Signature (Recomendado)',
        betterPrice: 7800.0,
        betterScope: 'Lavagem de alta pressão, raspagem profunda, primer nas manchas, 2 demãos de Sherwin-Williams Emerald, calafetação completa de janelas e 3 anos de garantia.',
        bestTitle: 'Gold Presidential Luxury',
        bestPrice: 10900.0,
        bestScope: 'Tudo do Silver + Tinta autonivelante Rain Refresh, acabamento acetinado nos rodapés/calhas, pintura de portas decorativas e 7 anos de garantia com retoque anual grátis.',
        addonsJson: JSON.stringify([
          { id: 'front_door', title: 'Pintura da Porta de Entrada High-Gloss', price: 450, selected: true },
          { id: 'deck_stain', title: 'Verniz e Restauração do Deck de Madeira', price: 1600, selected: true },
          { id: 'drywall_repair', title: 'Reparo de Rachaduras de Drywall', price: 750, selected: false }
        ]),
        totalAmount: 9850.0,
        depositAmount: 3283.33,
        status: 'SENT'
      }
    })
    console.log('✓ Estimate created: /estimate/tonys-wellesley-demo')
  }

  // 3. Seed ChatMessages for Conversations Hub (Feature 2 & 3)
  const msgCount = await prisma.chatMessage.count({ where: { leadId: lead.id } })
  if (msgCount === 0) {
    await prisma.chatMessage.createMany({
      data: [
        {
          leadId: lead.id,
          channel: 'SMS',
          direction: 'OUTBOUND',
          from: '+1 (617) 555-0199',
          to: lead.phone,
          body: "Tony's Painting: Olá Sarah! Aqui é o Marcos da Tony's Painting and Remodeling. Desculpe não ter atendido agora, estou em uma obra com um cliente. Você precisa de um orçamento para pintura interna, externa ou reforma?",
          aiGenerated: true,
          createdAt: new Date(Date.now() - 3600000 * 2)
        },
        {
          leadId: lead.id,
          channel: 'SMS',
          direction: 'INBOUND',
          from: lead.phone,
          to: '+1 (617) 555-0199',
          body: 'Oi Marcos! Vi o anúncio de vocês no Google. Preciso de um orçamento urgente para pintar a parte externa da minha casa aqui em Wellesley e restaurar o deck de madeira.',
          createdAt: new Date(Date.now() - 3600000 * 1.8)
        },
        {
          leadId: lead.id,
          channel: 'SMS',
          direction: 'OUTBOUND',
          from: '+1 (617) 555-0199',
          to: lead.phone,
          body: 'Excelente Sarah! Atendemos Wellesley frequentemente com produtos de alta durabilidade da Sherwin-Williams. Podemos agendar uma visita técnica gratuita hoje às 14h para medição?',
          aiGenerated: true,
          createdAt: new Date(Date.now() - 3600000 * 1.7)
        },
        {
          leadId: lead.id,
          channel: 'CALL_RECORDING',
          direction: 'INBOUND',
          from: lead.phone,
          body: 'Chamada de alinhamento com a cliente (124s). Cliente confirmou preferência pela tinta Emerald e solicitou inclusão do deck traseiro na proposta.',
          audioUrl: 'https://actions.google.com/sounds/v1/teleport/teleport_arrive.ogg',
          createdAt: new Date(Date.now() - 3600000 * 1.2)
        },
        {
          leadId: lead.id,
          channel: 'INTERNAL_NOTE',
          direction: 'OUTBOUND',
          from: 'Marcos Silva (Consultor)',
          body: 'Casa com 2 andares, madeira precisa de raspagem média no lado sul. Deck com 30m² necessita lixamento antes do verniz.',
          createdAt: new Date(Date.now() - 3600000 * 1.0)
        }
      ]
    })
    console.log('✓ ChatMessages created for Conversations Hub')
  }

  // 4. Seed ReviewRequest (Feature 4)
  const existingReview = await prisma.reviewRequest.findFirst({
    where: { leadId: lead.id }
  })

  if (!existingReview) {
    await prisma.reviewRequest.create({
      data: {
        leadId: lead.id,
        token: 'tonys-review-demo',
        channel: 'SMS',
        googleReviewLink: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
        status: 'SENT'
      }
    })
    console.log('✓ ReviewRequest created: /review/tonys-review-demo')
  }

  // 5. Seed DispatchTracker (Feature 5)
  const existingDispatch = await prisma.dispatchTracker.findFirst({
    where: { leadId: lead.id }
  })

  if (!existingDispatch) {
    await prisma.dispatchTracker.create({
      data: {
        leadId: lead.id,
        token: 'tonys-track-demo',
        technicianName: 'Marcos Silva',
        technicianRole: 'Consultor Técnico & Estimador Sênior',
        technicianPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        technicianPhone: '+1 (617) 555-0199',
        licenseNumber: 'MA HIC #192847 | EPA Certified',
        vehicleDescription: 'Van Ford Transit Branca #04 - Tony\'s Remodeling',
        destAddress: '42 Forest Street, Wellesley, MA 02482',
        etaMinutes: 14,
        status: 'DISPATCHED'
      }
    })
    console.log('✓ DispatchTracker created: /track/tonys-track-demo')
  }

  console.log('All 5 Cutting-Edge Features demo data seeded successfully!')
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
