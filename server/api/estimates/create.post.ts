import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { getTwilioClient } from '~/server/utils/aiClients'
import { sendSesEmail } from '~/server/utils/sesClient'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    leadId,
    title = 'Proposta de Pintura & Reforma Residencial - Tony\'s Remodeling',
    goodTitle = 'Bronze Standard',
    goodPrice = 5400,
    goodScope = '1 Demão de Tinta Duration, raspagem básica, lixamento e 1 ano de garantia.',
    betterTitle = 'Silver Signature (Recomendado)',
    betterPrice = 7800,
    betterScope = 'Lavagem de alta pressão, raspagem total, primer nas manchas, 2 demãos de Sherwin-Williams Emerald, calafetação completa de janelas e 3 anos de garantia.',
    bestTitle = 'Gold Presidential Luxury',
    bestPrice = 10900,
    bestScope = 'Tudo do Silver + Tinta autonivelante Rain Refresh, acabamento acetinado nos rodapés/calhas, pintura de portas decorativas e 7 anos de garantia com retoque anual grátis.',
    addons = [
      { id: 'front_door', title: 'Pintura da Porta de Entrada High-Gloss', price: 450, selected: false },
      { id: 'deck_stain', title: 'Verniz e Restauração do Deck de Madeira', price: 1600, selected: false },
      { id: 'drywall_repair', title: 'Reparo de Rachaduras de Drywall', price: 750, selected: false }
    ],
    sendSms = true,
    sendEmail = true
  } = body

  if (!leadId) {
    throw createError({ statusCode: 400, statusMessage: 'leadId é obrigatório' })
  }

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead não encontrado' })
  }

  // Token único para o link interativo
  const token = 'est_' + crypto.randomBytes(8).toString('hex')
  const totalAmount = Number(betterPrice)
  const depositAmount = Math.round((totalAmount / 3) * 100) / 100

  const estimate = await prisma.estimate.create({
    data: {
      leadId,
      token,
      title,
      selectedTier: 'BETTER',
      goodTitle,
      goodPrice: Number(goodPrice),
      goodScope,
      betterTitle,
      betterPrice: Number(betterPrice),
      betterScope,
      bestTitle,
      bestPrice: Number(bestPrice),
      bestScope,
      addonsJson: JSON.stringify(addons),
      totalAmount,
      depositAmount,
      status: 'SENT'
    }
  })

  // Atualiza status do Lead para PROPOSTA
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'PROPOSTA',
      dealValue: totalAmount
    }
  })

  // Monta link do orçamento interativo
  const origin = process.env.AUTH_ORIGIN || 'http://localhost:3000'
  const estimateUrl = `${origin}/estimate/${token}`

  // Disparo opcional por SMS
  if (sendSms && lead.phone) {
    try {
      const twilio = getTwilioClient()
      if (twilio) {
        await twilio.messages.create({
          to: lead.phone,
          from: process.env.TWILIO_PHONE_NUMBER || '+16175550199',
          body: `Tony's Painting: Olá ${lead.name}! Sua proposta interativa com 3 opções (Good/Better/Best) está pronta. Escolha seu pacote e assine aqui: ${estimateUrl}`
        })
      }
    } catch (err) {
      console.warn('Falha no envio de SMS da proposta (mock mode ativo):', err)
    }
  }

  // Disparo opcional por E-mail
  if (sendEmail && lead.email) {
    try {
      await sendSesEmail({
        to: lead.email,
        subject: `Sua Proposta Interativa - Tony's Painting and Remodeling`,
        body: `Olá ${lead.name},\n\nPreparamos sua estimativa interativa para o projeto de pintura e reforma.\n\nAcesse o link abaixo para visualizar os pacotes Good, Better e Best, selecionar itens extras e aprovar com assinatura digital e sinal de 1/3:\n\n${estimateUrl}\n\nAtenciosamente,\nTony's Painting and Remodeling\nMA HIC #192847`
      })
    } catch (err) {
      console.warn('Falha no envio de E-mail da proposta:', err)
    }
  }

  // Registra no ChatMessage
  await prisma.chatMessage.create({
    data: {
      leadId,
      channel: 'SMS',
      direction: 'OUTBOUND',
      to: lead.phone || lead.email,
      body: `[PROPOSTA ENVIADA] Proposta Good/Better/Best enviada ao cliente: ${estimateUrl}`
    }
  })

  return {
    success: true,
    estimate,
    estimateUrl
  }
})
