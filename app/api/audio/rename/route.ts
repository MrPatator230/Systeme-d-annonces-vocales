import { NextResponse } from 'next/server'
import { rename } from 'fs/promises'
import { join, dirname } from 'path'
import { readMetadata, writeMetadata, sanitizeFilename } from '@/utils/audioUtils'

export async function PUT(request: Request) {
  try {
    const { oldPath, newName } = await request.json()
    
    // Sanitize new name
    const sanitizedNewName = sanitizeFilename(newName)
    
    // Create the full paths
    const audioDir = join(process.cwd(), 'public', 'audio')
    const oldFilePath = join(audioDir, oldPath.replace('/audio', ''))
    const newFilePath = join(dirname(oldFilePath), sanitizedNewName)
    
    const relativeOldPath = oldFilePath.replace(audioDir, '').replace(/\\/g, '/')
    const relativeNewPath = newFilePath.replace(audioDir, '').replace(/\\/g, '/')

    // Rename the file
    await rename(oldFilePath, newFilePath)

    // Update metadata
    const metadata = await readMetadata()
    const fileInfo = metadata.files[relativeOldPath]
    delete metadata.files[relativeOldPath]
    metadata.files[relativeNewPath] = {
      ...fileInfo,
      name: sanitizedNewName
    }
    await writeMetadata(metadata)

    return NextResponse.json({
      success: true,
      newPath: `/audio${relativeNewPath}`
    })
  } catch (error) {
    console.error('Error renaming file:', error)
    return NextResponse.json(
      { error: 'Erreur lors du renommage du fichier' },
      { status: 500 }
    )
  }
}
