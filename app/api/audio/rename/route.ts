import { NextResponse } from 'next/server'
import { rename, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { ERROR_MESSAGES, type AudioMetadata } from '@/config/audio'

export async function PUT(request: Request) {
  try {
    const { oldName, newName } = await request.json()

    if (!oldName || !newName) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RENAME.INVALID_NAME },
        { status: 400 }
      )
    }

    // Validate new filename
    if (!/^[a-zA-Z0-9-_ ]+\.(mp3|wav)$/i.test(newName)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RENAME.INVALID_NAME },
        { status: 400 }
      )
    }

    const audioDir = join(process.cwd(), 'public', 'audio')
    const oldPath = join(audioDir, oldName)
    const newPath = join(audioDir, newName)
    const metadataPath = join(audioDir, 'metadata.json')

    try {
      // Read metadata first to check if new name already exists
      let metadata: AudioMetadata = {
        categories: [],
        files: {}
      }

      try {
        const content = await readFile(metadataPath, 'utf-8')
        metadata = JSON.parse(content)
      } catch {
        // If metadata file doesn't exist, use default structure
      }

      // Check if new filename already exists
      if (metadata.files[newName]) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.RENAME.ALREADY_EXISTS },
          { status: 400 }
        )
      }

      // Rename the file
      await rename(oldPath, newPath)

      // Update metadata
      if (metadata.files[oldName]) {
        metadata.files[newName] = metadata.files[oldName]
        delete metadata.files[oldName]
        await writeFile(metadataPath, JSON.stringify(metadata, null, 2))
      }

      return NextResponse.json({
        success: true,
        message: 'Fichier renommé avec succès',
        newPath: `/audio/${newName}`
      })
    } catch (error) {
      console.error('Error renaming file:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.RENAME.GENERIC },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing rename request:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.RENAME.GENERIC },
      { status: 500 }
    )
  }
}
