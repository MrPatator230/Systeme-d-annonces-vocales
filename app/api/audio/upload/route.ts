import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { readMetadata, writeMetadata, validateAudioFile, sanitizeFilename } from '@/utils/audioUtils'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = await validateAudioFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      )
    }

    // Sanitize filename and create full path
    const filename = sanitizeFilename(file.name)
    const audioDir = join(process.cwd(), 'public', 'audio')
    const targetDir = join(audioDir, path.replace('/audio', ''))
    const filePath = join(targetDir, filename)
    const relativePath = filePath.replace(audioDir, '').replace(/\\/g, '/')

    // Create directory if it doesn't exist
    await mkdir(dirname(filePath), { recursive: true })

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update metadata
    const metadata = await readMetadata()
    metadata.files[relativePath] = {
      name: filename,
      createdAt: new Date().toISOString()
    }
    await writeMetadata(metadata)

    return NextResponse.json({
      success: true,
      file: {
        name: filename,
        path: `/audio${relativePath}`,
        createdAt: metadata.files[relativePath].createdAt
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
