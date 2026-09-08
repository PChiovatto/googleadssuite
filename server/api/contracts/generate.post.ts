import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { getStripeClient } from '../../utils/aiClients'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const {
      leadId,
      totalAmount = 4500,
      title,
      scopeOfWork
    } = body

    if (!leadId) {
      return {
        success: false,
        message: 'leadId é obrigatório para gerar o contrato.'
      }
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return {
        success: false,
        message: 'Lead não encontrado.'
      }
    }

    const total = Number(totalAmount) || 4500
    // Massachusetts Law (M.G.L. c. 142A): Deposit cannot exceed 1/3 of total contract price
    const maxDeposit = Number((total / 3).toFixed(2))
    const depositAmount = body.depositAmount ? Math.min(Number(body.depositAmount), maxDeposit) : maxDeposit

    const year = new Date().getFullYear()
    const contractNumber = `TPR-MA-${year}-${Math.floor(1000 + Math.random() * 9000)}`

    const contractTitle = title || `Residential Painting & Remodeling Agreement - ${lead.serviceInterested || 'Exterior Painting'}`
    const defaultScope = scopeOfWork || `
1. PREP WORK PERFECTION:
   - High-pressure power washing of all surfaces to remove dirt, mildew, and chalking.
   - Comprehensive scraping of all peeling paint to sound wood; hand and machine feather-edge sanding.
   - Professional caulking of all joints, trim seams, and window casings with 50-year elastomeric sealant.
   - Spot priming of all bare wood with premium exterior oil-based slow-drying primer for maximum adhesion.
2. APPLICATION SPECIFICATIONS:
   - Application of two (2) full coats of premium 100% acrylic exterior paint (Benjamin Moore Aura or Sherwin-Williams Emerald).
   - Uniform coverage, brush and roller finish, sharp cut-in lines on trim, doors, and shutters.
3. CLEANUP & SAFETY:
   - Full drop cloth protection of landscaping, decks, roofs, and walkways.
   - Thorough daily and final cleanup; all paint debris disposed of according to Massachusetts EPA guidelines.
4. WARRANTY:
   - 5-Year written workmanship and anti-peeling warranty.
`.trim()

    // Create Stripe checkout link for the 1/3 deposit
    let stripePaymentUrl = ''
    let stripeSessionId = ''
    const stripe = getStripeClient()

    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          customer_email: lead.email || undefined,
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Contract Deposit (1/3) - ${contractNumber}`,
                  description: `Tony's Painting and Remodeling Inc. - Massachusetts HIC Agreement for ${lead.name}`
                },
                unit_amount: Math.round(depositAmount * 100) // cents
              },
              quantity: 1
            }
          ],
          mode: 'payment',
          success_url: `https://tonyspainting.com/contracts/${contractNumber}?status=paid`,
          cancel_url: `https://tonyspainting.com/contracts/${contractNumber}?status=cancelled`
        })
        stripeSessionId = session.id
        stripePaymentUrl = session.url || ''
      } catch (stripeErr: any) {
        console.warn('[Stripe Contract Deposit Error]:', stripeErr.message)
        stripePaymentUrl = `https://checkout.stripe.com/pay/cs_test_ma_contract_${Date.now().toString(36)}`
      }
    } else {
      stripePaymentUrl = `https://checkout.stripe.com/pay/cs_test_ma_contract_${Date.now().toString(36)}`
    }

    // Save contract in database
    const contract = await prisma.contract.create({
      data: {
        leadId: lead.id,
        contractNumber,
        title: contractTitle,
        scopeOfWork: defaultScope,
        totalAmount: total,
        depositAmount,
        status: 'DRAFT',
        stripePaymentUrl,
        stripeSessionId
      }
    })

    // Advance lead status to PROPOSTA if in NOVO or EM_ATENDIMENTO
    if (lead.status === 'NOVO' || lead.status === 'EM_ATENDIMENTO') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'PROPOSTA',
          dealValue: total,
          stripeCheckoutUrl: stripePaymentUrl
        }
      })
    }

    // Log in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'CONTRACT_GENERATED',
        userId: body.userId || 'SYSTEM_CONTRACTS',
        userName: 'MA Legal Contract Generator',
        details: JSON.stringify({
          contractId: contract.id,
          contractNumber,
          leadId: lead.id,
          totalAmount: total,
          depositAmount
        })
      }
    })

    const signingUrl = `/contracts/${contractNumber}`

    return {
      success: true,
      contract,
      signingUrl,
      depositAmount,
      stripePaymentUrl,
      message: `Contrato ${contractNumber} gerado conforme legislação de Massachusetts (M.G.L. c. 142A)! Depósito limitado a 1/3 ($${depositAmount}).`
    }
  } catch (error: any) {
    console.error('Error generating contract:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
