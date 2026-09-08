import { defineEventHandler, getQuery, readBody } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  // 1. GET: Retrieve materials for a lead or global procurement
  if (method === 'GET') {
    try {
      const query = getQuery(event)
      const leadId = query.leadId as string | undefined

      const where: any = {}
      if (leadId) where.leadId = leadId

      const materials = await prisma.materialOrder.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
              dealValue: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const totalCost = materials.reduce((acc, m) => acc + (m.totalCost || 0), 0)
      const pendingCount = materials.filter(m => m.status === 'PENDING').length
      const purchasedCount = materials.filter(m => m.status === 'PURCHASED').length

      return {
        success: true,
        materials,
        stats: {
          totalCost: Number(totalCost.toFixed(2)),
          totalOrders: materials.length,
          pendingCount,
          purchasedCount
        }
      }
    } catch (error: any) {
      console.error('Erro ao buscar pedidos de materiais:', error)
      return { success: false, error: error.message, materials: [] }
    }
  }

  // 2. POST: Create or update a material order (Procurement)
  if (method === 'POST') {
    try {
      const body = await readBody(event).catch(() => ({}))
      const { id, leadId, item, quantity, unit, unitCost, supplier, status } = body

      // If id is provided, update status or details
      if (id) {
        const existing = await prisma.materialOrder.findUnique({ where: { id } })
        if (!existing) {
          return { success: false, message: 'Pedido de material não encontrado.' }
        }

        const newQuantity = quantity !== undefined ? Number(quantity) : existing.quantity
        const newUnitCost = unitCost !== undefined ? Number(unitCost) : existing.unitCost
        const totalCost = Number((newQuantity * newUnitCost).toFixed(2))

        const updated = await prisma.materialOrder.update({
          where: { id },
          data: {
            item: item || existing.item,
            quantity: newQuantity,
            unit: unit || existing.unit,
            unitCost: newUnitCost,
            totalCost,
            status: status || existing.status,
            supplier: supplier || existing.supplier
          }
        })

        return { success: true, material: updated, message: 'Pedido atualizado com sucesso!' }
      }

      // New material order creation
      if (!leadId || !item) {
        return { success: false, message: 'Obra (leadId) e descrição do item são obrigatórios.' }
      }

      const q = Number(quantity || 1)
      const cost = Number(unitCost || 0)
      const totalCost = Number((q * cost).toFixed(2))

      const created = await prisma.materialOrder.create({
        data: {
          leadId,
          item,
          quantity: q,
          unit: unit || 'galões',
          unitCost: cost,
          totalCost,
          status: status || 'PENDING',
          supplier: supplier || 'Sherwin-Williams / Benjamin Moore'
        },
        include: {
          lead: { select: { name: true, city: true } }
        }
      })

      // Recalculate Lead Net Profit (Job Costing)
      const allMaterials = await prisma.materialOrder.findMany({ where: { leadId } })
      const leadMaterialsTotal = allMaterials.reduce((acc, m) => acc + (m.totalCost || 0), 0)

      const lead = await prisma.lead.findUnique({ where: { id: leadId } })
      if (lead?.dealValue) {
        const timeLogs = await prisma.timeLog.findMany({
          where: { leadId, checkOut: { not: null } }
        })
        let totalLaborHours = 0
        for (const log of timeLogs) {
          if (log.checkOut && log.checkIn) {
            totalLaborHours += (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60)
          }
        }
        const totalLabor = totalLaborHours * 45.0
        const netProfit = Number((lead.dealValue - (totalLabor + leadMaterialsTotal)).toFixed(2))
        await prisma.lead.update({ where: { id: leadId }, data: { netProfit } })
      }

      return {
        success: true,
        material: created,
        message: 'Pedido de material cadastrado com sucesso!'
      }
    } catch (error: any) {
      console.error('Erro ao salvar pedido de material:', error)
      return { success: false, error: error.message }
    }
  }
})
