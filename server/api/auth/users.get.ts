import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    // Seed default corporate team
    const defaultUsers = [
      {
        name: 'Master Admin (System Administrator)',
        email: 'master@tonyspainting.com',
        password: 'admin',
        role: 'MASTER',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Tony Silva (CEO & General Manager)',
        email: 'tony@tonyspainting.com',
        password: 'admin',
        role: 'CEO',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'John Miller (Senior Commercial Estimator)',
        email: 'john@tonyspainting.com',
        password: '123',
        role: 'SALES',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Sarah Jenkins (Residential Sales Specialist)',
        email: 'sarah@tonyspainting.com',
        password: '123',
        role: 'SALES',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Carlos Santos (Lead Painter / Field Crew)',
        email: 'carlos@tonyspainting.com',
        password: '123',
        role: 'FIELD_WORKER',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      }
    ]

    for (const u of defaultUsers) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } })
      if (!existing) {
        await prisma.user.create({ data: u })
      }
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { leads: true, emails: true }
        }
      }
    })

    return {
      success: true,
      users
    }
  } catch (error: any) {
    console.error('Error fetching team users:', error)
    return {
      success: false,
      error: error.message,
      users: []
    }
  }
})
