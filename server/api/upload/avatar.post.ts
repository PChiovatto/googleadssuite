import { defineEventHandler, readBody } from 'h3'
import fs from 'node:fs'
import path from 'node:path'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { image, fileName, userId } = body

    if (!image) {
      return { success: false, message: 'Image data is required.' }
    }

    let avatarUrl = ''

    // Case 1: Image is a base64 Data URL
    if (typeof image === 'string' && image.startsWith('data:image/')) {
      const match = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/)
      if (!match) {
        return { success: false, message: 'Invalid image format.' }
      }

      const mimeType = match[1]
      const base64Data = match[2]
      const buffer = Buffer.from(base64Data, 'base64')

      let ext = 'png'
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg'
      else if (mimeType.includes('webp')) ext = 'webp'
      else if (mimeType.includes('gif')) ext = 'gif'

      const publicDir = path.resolve(process.cwd(), 'public', 'avatars')
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
      }

      const cleanUserId = (userId || 'user').replace(/[^a-zA-Z0-9_-]/g, '')
      const savedFileName = `${cleanUserId}-${Date.now()}.${ext}`
      const targetFilePath = path.join(publicDir, savedFileName)

      fs.writeFileSync(targetFilePath, buffer)
      avatarUrl = `/avatars/${savedFileName}`
    } else if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/'))) {
      // Case 2: Direct URL
      avatarUrl = image.trim()
    } else {
      return { success: false, message: 'Unsupported image data.' }
    }

    // If userId was provided, immediately update user in DB
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl }
      }).catch((err) => {
        console.warn('Could not auto-update user avatarUrl:', err.message)
      })
    }

    return {
      success: true,
      url: avatarUrl,
      message: 'Avatar photo uploaded and saved successfully!'
    }
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    return { success: false, message: error.message || 'Failed to process avatar image.' }
  }
})
