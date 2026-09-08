const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Sincronizando dados no nome de Tony's Painting and Remodeling ===");

  await prisma.accountSetting.upsert({
    where: { customerId: 'primary-account' },
    update: {
      accountName: "Tony's Painting and Remodeling Inc.",
      isDemo: true,
      lastSyncedAt: new Date()
    },
    create: {
      customerId: 'primary-account',
      accountName: "Tony's Painting and Remodeling Inc.",
      isDemo: true,
      lastSyncedAt: new Date()
    }
  });
  console.log("✓ AccountSetting configurado para: Tony's Painting and Remodeling Inc.");

  const contracts = await prisma.contract.findMany();
  for (const c of contracts) {
    const newNumber = c.contractNumber.replace('FBP-', 'TPR-');
    await prisma.contract.update({
      where: { id: c.id },
      data: {
        contractNumber: newNumber,
        title: c.title.replace('FBP', "Tony's Painting").replace('First Boston Painters', "Tony's Painting and Remodeling")
      }
    });
    console.log(`✓ Contrato ${c.contractNumber} atualizado para ${newNumber}`);
  }

  const leads = await prisma.lead.findMany();
  for (const lead of leads) {
    let whatsappScript = lead.whatsappScript;
    let aiQualification = lead.aiQualification;

    if (lead.name.includes('Robert Callahan')) {
      whatsappScript = "Hi Robert! Thank you for requesting an estimate with Tony's Painting and Remodeling. We have your Newton exterior siding and trim project scheduled for our senior estimator. Looking forward to meeting you!";
      aiQualification = "Proprietário de imóvel colonial em Newton, MA. Alta propensão de fechamento para pintura externa e reparo de guarnições de madeira.";
    } else if (lead.name.includes('Emily Watson')) {
      whatsappScript = "Hi Emily! This is Tony's Painting and Remodeling. We received your inquiry regarding cabinet refinishing in Waltham. Would you be free for a 20-min consultation this Wednesday at 11 AM?";
      aiQualification = "Reforma de armários de cozinha em Waltham, MA. Lead vindo do Google Local Services Ads com garantia Google. Prioridade alta.";
    } else if (lead.name.includes('Michael Chang')) {
      whatsappScript = "Hi Michael! This is Tony's Painting and Remodeling. We specialize in high-end interior skim coat prep and Benjamin Moore finishes in Brookline. Let's schedule your in-home walk-through!";
      aiQualification = "Pintura interior completa e nivelamento de paredes (skim coating) em Brookline, MA. Ticket estimado em $12.000.";
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        aiScore: lead.aiScore || 9,
        aiQualification: aiQualification || "Lead qualificado para serviços de pintura residencial pela Tony's Painting and Remodeling.",
        whatsappScript: whatsappScript || `Hi ${lead.name}! This is Tony's Painting and Remodeling. We received your request. Let's schedule your free in-home estimate!`
      }
    });
    console.log(`✓ Lead ${lead.name} atualizado com scripts e qualificações da Tony's Painting`);
  }

  console.log("=== Sincronização concluída com sucesso! ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
