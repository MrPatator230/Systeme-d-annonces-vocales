import { NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { AUDIO_CONFIG, ERROR_MESSAGES, type AudioMetadata, type AudioCategory } from '@/config/audio'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as AudioCategory

    if (!file) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD.GENERIC },
        { status: 400 }
      )
    }

    // Validate file type
    const fileType = file.type
    if (!AUDIO_CONFIG.upload.allowedMimeTypes.includes(fileType)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD.INVALID_TYPE },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > AUDIO_CONFIG.upload.maxSize) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE },
        { status: 400 }
      )
    }

    // Get file extension and create safe filename
    const ext = file.name.split('.').pop()?.toLowerCase()
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const fileName = `${safeName}.${ext}`
    const audioDir = join(process.cwd(), 'public', 'audio')
    const filePath = join(audioDir, fileName)

    // Convert File to ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Write file to disk
    await writeFile(filePath, buffer)

    // Update metadata
    const metadataPath = join(audioDir, 'metadata.json')
    let metadata: AudioMetadata = {
      categories: AUDIO_CONFIG.storage.categories,
      files: {}
    }

    try {
      const content = await readFile(metadataPath, 'utf-8')
      metadata = JSON.parse(content)
    } catch {
      // If metadata file doesn't exist, use default structure
    }

    // Add file to metadata
    metadata.files[fileName] = {
      category: category || AUDIO_CONFIG.storage.defaultCategory,
      createdAt: new Date().toISOString()
    }

    // Save updated metadata
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    return NextResponse.json({
      success: true,
      file: {
        name: fileName,
        path: `${AUDIO_CONFIG.storage.basePath}/${fileName}`,
        category: category || AUDIO_CONFIG.storage.defaultCategory,
        createdAt: metadata.files[fileName].createdAt
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.UPLOAD.GENERIC },
      { status: 500 }
    )
  }
}
