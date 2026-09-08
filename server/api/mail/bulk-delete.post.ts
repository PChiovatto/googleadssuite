import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}))
    const { emailIds, folder, permanent } = body

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return { success: false, message: 'Nenhum e-mail selecionado para exclusão.' }
    }

    const shouldPermanentDelete = Boolean(permanent || folder === 'TRASH')

    let count = 0
    if (shouldPermanentDelete) {
      const deleted = await prisma.emailMessage.deleteMany({
        where: { id: { in: emailIds } }
      })
      count = deleted.count
    } else {
      const updated = await prisma.emailMessage.updateMany({
        where: { id: { in: emailIds } },
        data: { folder: 'TRASH' }
      })
      count = updated.count
    }

    // Register in audit trail
    await prisma.auditLog.create({
      data: {
        action: shouldPermanentDelete ? 'EMAIL_PERMANENT_DELETE' : 'EMAIL_MOVE_TO_TRASH',
        userId: 'system_webmail',
        userName: "Tony's Corporate Mail",
        details: JSON.stringify({
          count,
          emailIds,
          permanent: shouldPermanentDelete,
          timestamp: new Date()
        })
      }
    })

    return {
      success: true,
      count,
      permanent: shouldPermanentDelete,
      message: shouldPermanentDelete
        ? `${count} mensagem(ns) excluída(s) permanentemente com sucesso.`
        : `${count} mensagem(ns) movida(s) para a Lixeira.`
    }
  } catch (error: any) {
    console.error('Erro na exclusão em massa de e-mails:', error)
    return { success: false, error: error.message }
  }
})
