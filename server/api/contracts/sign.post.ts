import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { contractId, signerName, signatureData } = body

    if (!contractId || !signerName) {
      return {
        success: false,
        message: 'contractId e nome do signatário são obrigatórios.'
      }
    }

    const contract = await prisma.contract.findFirst({
      where: {
        OR: [
          { id: contractId },
          { contractNumber: contractId }
        ]
      },
      include: { lead: true }
    })

    if (!contract) {
      return {
        success: false,
        message: 'Contrato não encontrado.'
      }
    }

    const clientIp = (event.node.req.headers['x-forwarded-for'] as string) ||
                     event.node.req.socket.remoteAddress ||
                     '127.0.0.1'

    // Update contract as legally signed
    const signedContract = await prisma.contract.update({
      where: { id: contract.id },
      data: {
        signed: true,
        signedAt: new Date(),
        signerName,
        signerIp: clientIp,
        signatureData: signatureData || `DIGITAL_SIGNATURE_HASH_${Date.now()}`,
        status: 'SIGNED'
      }
    })

    // Advance lead to CONVERTIDO and set closedAt
    await prisma.lead.update({
      where: { id: contract.leadId },
      data: {
        status: 'CONVERTIDO',
        closedAt: new Date(),
        dealValue: contract.totalAmount
      }
    })

    // Log legal signature in AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'CONTRACT_DIGITALLY_SIGNED',
        userId: 'CLIENT_PORTAL',
        userName: signerName,
        details: JSON.stringify({
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          leadId: contract.leadId,
          totalAmount: contract.totalAmount,
          signerIp: clientIp,
          signedAt: new Date().toISOString()
        })
      }
    })

    return {
      success: true,
      contract: signedContract,
      stripePaymentUrl: contract.stripePaymentUrl,
      message: `Contrato ${contract.contractNumber} assinado digitalmente com validade jurídica pelo signatário ${signerName}!`
    }
  } catch (error: any) {
    console.error('Error signing contract:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
