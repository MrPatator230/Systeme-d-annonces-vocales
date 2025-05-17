import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { readMetadata, writeMetadata } from '@/utils/audioUtils'

export async function DELETE(request: Request) {
  try {
    const { path } = await request.json()
    
    // Create the full path
    const audioDir = join(process.cwd(), 'public', 'audio')
    const filePath = join(audioDir, path.replace('/audio', ''))
    const relativePath = filePath.replace(audioDir, '').replace(/\\/g, '/')

    // Delete the file
    await unlink(filePath)

    // Update metadata
    const metadata = await readMetadata()
    delete metadata.files[relativePath]
    await writeMetadata(metadata)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    )
  }
}
