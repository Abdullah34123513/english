import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createLogger } from '@/lib/logger'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

const logger = createLogger('ProfileImageUploadAPI')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 9)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `profile_${timestamp}_${randomId}.${fileExtension}`

    // Process and optimize image
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create different sizes for responsive images
    const sizes = {
      large: { width: 400, height: 400 },   // For profile pages
      medium: { width: 200, height: 200 },  // For cards and lists
      small: { width: 80, height: 80 }      // For avatars and thumbnails
    }

    const processedImages = {}
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')

    try {
      // Process each size
      for (const [sizeName, dimensions] of Object.entries(sizes)) {
        const processedBuffer = await sharp(buffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 }) // Convert to JPEG with 85% quality for better compression
          .toBuffer()

        const sizeFileName = fileName.replace(`.${fileExtension}`, `_${sizeName}.jpg`)
        const filePath = join(uploadDir, sizeFileName)
        
        await writeFile(filePath, processedBuffer)
        processedImages[sizeName] = `/uploads/profiles/${sizeFileName}`
      }

      // Keep original image for high-quality needs
      const originalFilePath = join(uploadDir, fileName)
      await writeFile(originalFilePath, buffer)
      processedImages.original = `/uploads/profiles/${fileName}`

    } catch (writeError) {
      logger.error('Error writing files:', writeError)
      return NextResponse.json({ error: 'Failed to save files' }, { status: 500 })
    }

    logger.logUserInfo('Profile image uploaded and processed', { 
      userId: session.user.email, 
      fileName, 
      fileSize: file.size,
      processedSizes: Object.keys(processedImages)
    })

    return NextResponse.json({ 
      urls: processedImages,
      primaryUrl: processedImages.medium, // Use medium size as primary
      message: 'Profile image uploaded and optimized successfully' 
    })
  } catch (error) {
    logger.error('Error uploading profile image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}