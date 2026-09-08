import { defineEventHandler, getQuery, readBody, getMethod } from 'h3'
import { prisma } from '../../utils/prisma'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const token = query.token as string | undefined

    if (token) {
      const referrerLead = await prisma.lead.findUnique({
        where: { referralToken: token },
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
          referralToken: true,
          createdAt: true
        }
      })

      if (!referrerLead) {
        return { success: false, message: 'Código de indicação não encontrado ou inválido.' }
      }

      // Count referrals that came from this lead
      const referredLeads = await prisma.lead.findMany({
        where: {
          tags: {
            contains: `ref:${token}`
          }
        },
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
          dealValue: true,
          createdAt: true
        }
      })

      const convertedCount = referredLeads.filter(l => l.status === 'CONVERTIDO' || l.status === 'FINALIZADO' || l.status === 'EM_EXECUCAO').length
      const totalCashbackEarned = convertedCount * 150 // $150 per converted referral

      return {
        success: true,
        referrer: {
          name: referrerLead.name,
          city: referrerLead.city,
          token: referrerLead.referralToken,
          referralLink: `https://tonysremodeling.com/ref/${referrerLead.referralToken}`
        },
        stats: {
          totalInvited: referredLeads.length,
          totalConverted: convertedCount,
          cashbackEarned: totalCashbackEarned,
          rewardPerReferral: 150, // $150 USD
          inviteeDiscount: 100    // $100 USD welcome credit
        },
        referredLeads
      }
    }

    // List all leads that have referral tokens and their performance
    const topReferrers = await prisma.lead.findMany({
      where: {
        referralToken: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        referralToken: true,
        status: true
      },
      take: 20
    })

    return {
      success: true,
      topReferrers,
      programDetails: {
        referrerBonusUSD: 150,
        inviteeWelcomeDiscountUSD: 100,
        payoutMethod: 'Stripe Instant Transfer / Account Credit'
      }
    }
  }

  if (method === 'POST') {
    const body = await readBody(event).catch(() => ({}))
    const { action, leadId, token, friendName, friendPhone, friendEmail, friendCity, serviceInterested } = body

    // 1. Generate or ensure referral token for a completed lead
    if (action === 'generate_token' && leadId) {
      let lead = await prisma.lead.findUnique({ where: { id: leadId } })
      if (!lead) return { success: false, message: 'Lead não encontrado.' }

      if (!lead.referralToken) {
        const generatedToken = `tony-${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)}-${randomBytes(3).toString('hex')}`
        lead = await prisma.lead.update({
          where: { id: leadId },
          data: { referralToken: generatedToken }
        })
      }

      return {
        success: true,
        referralToken: lead.referralToken,
        referralLink: `https://tonysremodeling.com/ref/${lead.referralToken}`
      }
    }

    // 2. A new prospective customer arrives via referral link
    if (action === 'submit_referral') {
      if (!token || !friendName) {
        return { success: false, message: 'Token de indicação e nome são obrigatórios.' }
      }

      const referrer = await prisma.lead.findUnique({
        where: { referralToken: token }
      })

      if (!referrer) {
        return { success: false, message: 'Código de indicação inválido.' }
      }

      // Create new lead with referral tag
      const newLead = await prisma.lead.create({
        data: {
          name: friendName,
          phone: friendPhone || null,
          email: friendEmail || null,
          city: friendCity || referrer.city || 'Wakefield',
          state: 'MA',
          source: 'REFERRAL_PROGRAM',
          serviceInterested: serviceInterested || 'Pintura Residencial (Indicação de Amigo)',
          status: 'NOVO',
          dealValue: 3500, // Default estimate
          tags: JSON.stringify([`ref:${token}`, `referred_by:${referrer.name}`]),
          aiQualification: `Lead indicado por cliente satisfeito: ${referrer.name} (${referrer.city}). Elegível para bônus de $100 de desconto de boas-vindas e $150 de cashback ao indicador via Stripe.`
        }
      })

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'REFERRAL_LEAD_CREATED',
          userId: referrer.id,
          userName: referrer.name,
          details: JSON.stringify({
            newLeadId: newLead.id,
            friendName,
            referralToken: token
          })
        }
      })

      return {
        success: true,
        message: 'Indicação registrada com sucesso! Seu amigo(a) já recebeu o bônus de $100.',
        leadId: newLead.id,
        referrerName: referrer.name
      }
    }

    return { success: false, message: 'Ação não reconhecida.' }
  }

  return { success: false, message: 'Método não suportado' }
})
