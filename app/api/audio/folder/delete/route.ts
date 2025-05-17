import { NextResponse } from 'next/server'
import { rm } from 'fs/promises'
import { join } from 'path'
import { readMetadata, writeMetadata } from '@/utils/audioUtils'

export async function DELETE(request: Request) {
  try {
    const { path } = await request.json()
    
    // Prevent deleting root audio folder
    if (path === '' || path === '/') {
      return NextResponse.json(
        { error: 'Impossible de supprimer le dossier racine' },
        { status: 400 }
      )
    }
    
    // Create the full path
    const audioDir = join(process.cwd(), 'public', 'audio')
    const folderPath = join(audioDir, path)
    
    // Delete the folder and all its contents
    await rm(folderPath, { recursive: true, force: true })
    
    // Update metadata
    const metadata = await readMetadata()
    
    // Remove folder and all nested content from metadata
    delete metadata.folders[path]
    
    // Remove nested folders
    for (const folderPath of Object.keys(metadata.folders)) {
      if (folderPath.startsWith(path + '/')) {
        delete metadata.folders[folderPath]
      }
    }
    
    // Remove nested files
    for (const filePath of Object.keys(metadata.files)) {
      if (filePath.startsWith(path + '/')) {
        delete metadata.files[filePath]
      }
    }
    
    await writeMetadata(metadata)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du dossier' },
      { status: 500 }
    )
  }
}
