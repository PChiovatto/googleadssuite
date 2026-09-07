import { PrismaClient } from '@prisma/client'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db')
const defaultUrl = `file:${dbPath.replace(/\\/g, '/')}`

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || defaultUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


