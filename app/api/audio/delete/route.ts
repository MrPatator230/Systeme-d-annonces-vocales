import { NextResponse } from 'next/server'
import { unlink, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { ERROR_MESSAGES, type AudioMetadata } from '@/config/audio'

export async function DELETE(request: Request) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.DELETE.NOT_FOUND },
        { status: 400 }
      )
    }

    const audioDir = join(process.cwd(), 'public', 'audio')
    const filePath = join(audioDir, filename)
    const metadataPath = join(audioDir, 'metadata.json')

    try {
      // Delete the file
      await unlink(filePath)

      // Update metadata
      let metadata: AudioMetadata = {
        categories: [],
        files: {}
      }

      try {
        const content = await readFile(metadataPath, 'utf-8')
        metadata = JSON.parse(content)

        // Remove file from metadata
        if (metadata.files[filename]) {
          delete metadata.files[filename]
          await writeFile(metadataPath, JSON.stringify(metadata, null, 2))
        }
      } catch (error) {
        console.error('Error updating metadata:', error)
        // Continue even if metadata update fails
      }

      return NextResponse.json({
        success: true,
        message: 'Fichier supprimé avec succès'
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: ERROR_MESSAGES.DELETE.NOT_FOUND },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error processing delete request:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.DELETE.GENERIC },
      { status: 500 }
    )
  }
}
