import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, rating, feedbackText = '' } = body

  if (!token || !rating) {
    throw createError({ statusCode: 400, statusMessage: 'Token e nota (1-5) são obrigatórios' })
  }

  const reviewReq = await prisma.reviewRequest.findUnique({
    where: { token },
    include: { lead: true }
  })

  if (!reviewReq) {
    throw createError({ statusCode: 404, statusMessage: 'Solicitação de avaliação não encontrada' })
  }

  const numRating = Number(rating)
  const isPositive = numRating >= 4
  const googleReviewUrl = process.env.GOOGLE_BUSINESS_REVIEW_URL || 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4'

  if (isPositive) {
    // 🌟 Nota 4 ou 5: Sucesso! Redireciona para o Google Meu Negócio
    await prisma.reviewRequest.update({
      where: { token },
      data: {
        rating: numRating,
        status: 'RATED_GOOGLE',
        redirectedToGoogle: true,
        feedbackText: feedbackText || 'Avaliação 5 estrelas positiva com redirecionamento ao Google.'
      }
    })

    // Registra no ChatMessage
    await prisma.chatMessage.create({
      data: {
        leadId: reviewReq.leadId,
        channel: 'INTERNAL_NOTE',
        direction: 'INBOUND',
        body: `⭐⭐⭐⭐⭐ [REVIEW POSITIVO - NOTA ${numRating}!] O cliente avaliou positivamente e foi encaminhado para o Google Meu Negócio oficial.`
      }
    })

    return {
      success: true,
      action: 'REDIRECT_GOOGLE',
      googleReviewUrl,
      message: 'Muito obrigado! Sua avaliação positiva nos ajuda muito. Por favor, confirme no Google Meu Negócio.'
    }
  } else {
    // 🛡️ Nota 1, 2 ou 3: Guarda-Costas acionado!
    // Bloqueia link do Google, registra ouvidoria interna e notifica o Gerente!
    await prisma.reviewRequest.update({
      where: { token },
      data: {
        rating: numRating,
        status: 'RATED_INTERNAL',
        redirectedToGoogle: false,
        managerAlertSent: true,
        feedbackText: feedbackText || 'Cliente insatisfeito retido na ouvidoria interna.'
      }
    })

    // Registra alerta no AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'REPUTATION_GUARD_ALERT',
        userId: 'system_guard',
        userName: 'Reputation Guard 2-Step',
        details: JSON.stringify({
          leadId: reviewReq.leadId,
          leadName: reviewReq.lead.name,
          rating: numRating,
          feedbackText,
          urgentActionRequired: 'Gerente deve ligar para o cliente nas próximas 2 horas para resolução amigável.'
        })
      }
    })

    // Registra no ChatMessage
    await prisma.chatMessage.create({
      data: {
        leadId: reviewReq.leadId,
        channel: 'INTERNAL_NOTE',
        direction: 'INBOUND',
        body: `🚨 [ALERTA DE REPUTAÇÃO - NOTA ${numRating}!] Cliente não ficou 100% satisfeito. O link do Google foi bloqueado. Feedback: "${feedbackText}". Gerente acionado para atendimento prioritário.`
      }
    })

    return {
      success: true,
      action: 'INTERNAL_RESOLUTION',
      message: 'Agradecemos sinceramente pelo seu feedback sincero. Nosso gerente geral entrará em contato para garantir que qualquer ponto seja corrigido com prioridade máxima.'
    }
  }
})
