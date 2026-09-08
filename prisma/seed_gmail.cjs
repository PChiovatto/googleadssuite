const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found');
    return;
  }
  const leads = await prisma.lead.findMany();
  const lead1 = leads.find(l => l.name.includes('Robert')) || leads[0];

  await prisma.emailMessage.deleteMany({});

  const messages = [
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Vercel',
      to: 'pchiovatto@gmail.com',
      subject: '1 new project available to import',
      body: '<p>Hello, pchiovatto.</p><p>A new project in <strong>PChiovatto/googleadssuite</strong> is available to import and deploy on Vercel.</p><p><a href="https://vercel.com/new" style="display:inline-block;padding:8px 16px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Deploy Project</a></p>',
      read: false,
      starred: false,
      createdAt: new Date('2026-09-07T15:32:00')
    },
    {
      userId: user.id,
      leadId: lead1 ? lead1.id : null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Robert Callahan (Lead)',
      to: 'tony@tonyspainting.com',
      subject: "Tony's Painting: Estimate for Exterior Painting & Trim Repair in Newton",
      body: '<p>Hi Tony,</p><p>Thank you for coming to Newton to inspect our exterior siding and trim. We loved the detailed scope of work. Can you confirm if work can begin next week? We are ready to sign the MA HIC contract and pay the deposit.</p><p>Best regards,<br>Robert Callahan<br>Newton, MA</p>',
      read: false,
      starred: true,
      createdAt: new Date('2026-09-07T15:15:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Amazon.com',
      to: 'pchiovatto@gmail.com',
      subject: 'Revision to Your Amazon.com Account',
      body: '<p>Thanks for visiting Amazon.com!</p><p>Per your request, we have successfully changed your password. Visit Your Account at Amazon.com to view your recent orders and settings.</p>',
      read: false,
      starred: true,
      createdAt: new Date('2026-09-07T15:00:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Amazon.com',
      to: 'pchiovatto@gmail.com',
      subject: 'amazon.com: Password recovery - Paulo Chiovatto',
      body: '<p>Someone is attempting to reset the password of your account.</p><p><strong>When:</strong> Sep 07, 2026 02:59 PM Eastern Daylight Time<br><strong>Device:</strong> Google Chrome on Windows<br><strong>Location:</strong> Boston, MA</p>',
      read: false,
      starred: false,
      createdAt: new Date('2026-09-07T14:59:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Christiansen',
      to: 'pchiovatto@gmail.com',
      subject: 'Application status',
      body: '<p>A new set of auto insurance options is available for you to review.</p><p>Hi Paulo, We reviewed the information connected to your request and found several auto insurance policies tailored to Massachusetts regulations with multi-policy discounts.</p>',
      read: false,
      starred: false,
      createdAt: new Date('2026-09-07T14:51:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Notification',
      to: 'pchiovatto@gmail.com',
      subject: 'Your Verizon bill is ready',
      body: '<p>Your monthly statement is ready for review.</p><p>Account: Fios Gigabit Internet & Mobile Bundle.<br>Amount: $149.99<br>Auto-pay scheduled for Sep 20, 2026.</p>',
      read: false,
      starred: false,
      createdAt: new Date('2026-09-07T08:13:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Claude.ai',
      to: 'pchiovatto@gmail.com',
      subject: 'Your secure link to Claude.ai is here | 2026-09-06 23:53:31',
      body: '<p>Sign in to Claude.ai</p><p>Click the button below to finish signing in. This link expires in 10 minutes.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-06T23:53:31')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Claude.ai',
      to: 'pchiovatto@gmail.com',
      subject: 'Your secure link to Claude.ai is here | 2026-09-06 23:52:47',
      body: '<p>Sign in to Claude.ai</p><p>Click the button below to finish signing in. This link expires in 10 minutes.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-06T23:52:47')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Numbers',
      to: 'pchiovatto@gmail.com',
      subject: 'The Harmony You Maintain By Disappearing',
      body: '<p>Everyone knows what you do for them. No one knows what you want.</p><p>When you constantly make concessions to maintain peace, you slowly render your real preferences invisible...</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-06T18:00:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'America',
      to: 'pchiovatto@gmail.com',
      subject: 'Zelle® payment of $260.00 to Maria Ramos Aluguci Carro has been sent',
      body: '<p>Zelle payment sent successfully.</p><p><strong>Amount:</strong> $260.00<br><strong>Recipient:</strong> Maria Ramos Aluguci Carro<br><strong>Phone:</strong> 781-632-1495<br><strong>From:</strong> Account ending in 7189</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-06T16:20:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'America',
      to: 'pchiovatto@gmail.com',
      subject: 'Zelle® payment of $150.00 to Baby has been sent',
      body: '<p>Zelle payment sent successfully.</p><p><strong>Amount:</strong> $150.00<br><strong>Recipient:</strong> Baby<br><strong>From:</strong> Account ending in 7189</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-06T14:10:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Wise',
      to: 'pchiovatto@gmail.com',
      subject: 'Transfer sent (#2354592557)',
      body: '<p>Communication code: 051205 Wise. Your account for the world\'s money.</p><p>Your transfer of funds has been delivered to the recipient bank account.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-05T12:00:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Numbers',
      to: 'pchiovatto@gmail.com',
      subject: 'The Foundation You Have Outgrown But Keep Defending',
      body: '<p>Everyone knows what you do for them. No one knows what you want.</p><p>A reflection on high-agency entrepreneurship and systems automation.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-05T10:00:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Antigravity',
      to: 'pchiovatto@gmail.com',
      subject: 'Gemini 3.8 Flash Available In Antigravity',
      body: '<p>Introducing Gemini 3.8 Flash!</p><p>Marking our third Flash release in just six weeks, and building on the momentum of 3.7 Flash. Experience extreme coding speed and enhanced long context understanding.</p>',
      read: true,
      starred: true,
      createdAt: new Date('2026-09-05T09:15:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Kimi Work',
      to: 'pchiovatto@gmail.com',
      subject: 'Descubra os tutoriais do Kimi Work',
      body: '<p>Dois tutoriais do Kimi Work: slides, finanças e fluxos reutilizáveis para aumentar sua produtividade diária.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-05T08:30:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Toast',
      to: 'pchiovatto@gmail.com',
      subject: 'Your Toast account is ready',
      body: '<p>You used Toast ~now keep it on your phone 📱</p><p>Check your order points and loyalty status on local restaurants.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-04T19:00:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'INBOUND',
      folder: 'INBOX',
      from: 'Porto Pizza',
      to: 'pchiovatto@gmail.com',
      subject: 'Porto Pizza - Order Received',
      body: '<p>Order Confirmation Order #116 $26.21 September 4, 2026 at 5:41 PM</p><p>Hi Paulo, thank you for ordering. Expected by: Fri, Sep 4.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-04T17:41:00')
    },
    {
      userId: user.id,
      leadId: null,
      direction: 'OUTBOUND',
      folder: 'SENT',
      from: 'tony@tonyspainting.com',
      to: 'robert.callahan@gmail.com',
      subject: "Tony's Painting: Scope of Work & HIC Agreement (Newton, MA)",
      body: '<p>Hi Robert,</p><p>Attached is the full proposal and Massachusetts Home Improvement Agreement for your exterior painting project. All preparation, pressure washing, sanding and 2 coats of Benjamin Moore paint are included.</p><p>Warmly,<br>Tony Silva<br>Tony\'s Painting and Remodeling Corp.</p>',
      read: true,
      starred: false,
      createdAt: new Date('2026-09-07T11:00:00')
    }
  ];

  for (const m of messages) {
    await prisma.emailMessage.create({ data: m });
  }

  console.log('Seeded authentic email messages matching screenshot successfully!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
