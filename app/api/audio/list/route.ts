import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { AUDIO_CONFIG, type AudioMetadata, type AudioFile } from '@/config/audio'

export async function GET() {
  try {
    const audioDir = join(process.cwd(), 'public', 'audio')
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

    // Convert metadata to array of files with full paths
    const files: AudioFile[] = Object.entries(metadata.files).map(([filename, info]) => ({
      name: filename,
      path: `${AUDIO_CONFIG.storage.basePath}/${filename}`,
      category: info.category,
      createdAt: info.createdAt
    }))

    // Sort files by creation date (newest first)
    files.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      success: true,
      files,
      categories: AUDIO_CONFIG.storage.categories
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
      { status: 500 }
    )
  }
}
