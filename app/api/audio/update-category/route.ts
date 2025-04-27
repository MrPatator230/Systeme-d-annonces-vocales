import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { AUDIO_CONFIG, ERROR_MESSAGES, type AudioMetadata, type AudioCategory } from '@/config/audio'

export async function PUT(request: Request) {
  try {
    const { filename, category } = await request.json()

    if (!filename || !category) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CATEGORY.INVALID },
        { status: 400 }
      )
    }

    // Validate category
    if (!AUDIO_CONFIG.storage.categories.includes(category)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CATEGORY.INVALID },
        { status: 400 }
      )
    }

    const audioDir = join(process.cwd(), 'public', 'audio')
    const metadataPath = join(audioDir, 'metadata.json')

    // Read and update metadata
    let metadata: AudioMetadata = {
      categories: AUDIO_CONFIG.storage.categories,
      files: {}
    }

    try {
      const content = await readFile(metadataPath, 'utf-8')
      metadata = JSON.parse(content)

      if (!metadata.files[filename]) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.DELETE.NOT_FOUND },
          { status: 404 }
        )
      }

      // Update category
      metadata.files[filename] = {
        ...metadata.files[filename],
        category: category as AudioCategory
      }

      // Save updated metadata
      await writeFile(metadataPath, JSON.stringify(metadata, null, 2))

      return NextResponse.json({
        success: true,
        message: 'Catégorie mise à jour avec succès',
        file: {
          name: filename,
          path: `${AUDIO_CONFIG.storage.basePath}/${filename}`,
          category,
          createdAt: metadata.files[filename].createdAt
        }
      })
    } catch (error) {
      console.error('Error updating category:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.CATEGORY.UPDATE_FAILED },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing category update:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.CATEGORY.UPDATE_FAILED },
      { status: 500 }
    )
  }
}
