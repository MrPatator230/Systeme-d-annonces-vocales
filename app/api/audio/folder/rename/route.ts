import { NextResponse } from 'next/server'
import { rename } from 'fs/promises'
import { join } from 'path'
import { readMetadata, writeMetadata } from '@/utils/audioUtils'

export async function PUT(request: Request) {
  try {
    const { oldPath, newName } = await request.json()
    
    // Get the parent directory path
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'))
    const newPath = parentPath ? `${parentPath}/${newName}` : newName
    
    // Create the full paths
    const audioDir = join(process.cwd(), 'public', 'audio')
    const oldFolderPath = join(audioDir, oldPath)
    const newFolderPath = join(audioDir, newPath)
    
    // Rename the folder
    await rename(oldFolderPath, newFolderPath)
    
    // Update metadata
    const metadata = await readMetadata()
    
    // Update folder entry
    const oldFolderInfo = metadata.folders[oldPath]
    delete metadata.folders[oldPath]
    metadata.folders[newPath] = {
      ...oldFolderInfo,
      name: newName
    }
    
    // Update paths for nested folders and files
    for (const [path, info] of Object.entries(metadata.folders)) {
      if (path.startsWith(oldPath + '/')) {
        const updatedPath = path.replace(oldPath, newPath)
        metadata.folders[updatedPath] = info
        delete metadata.folders[path]
      }
    }
    
    for (const [path, info] of Object.entries(metadata.files)) {
      if (path.startsWith(oldPath + '/')) {
        const updatedPath = path.replace(oldPath, newPath)
        metadata.files[updatedPath] = info
        delete metadata.files[path]
      }
    }
    
    await writeMetadata(metadata)
    
    return NextResponse.json({ success: true, path: newPath })
  } catch (error) {
    console.error('Error renaming folder:', error)
    return NextResponse.json(
      { error: 'Erreur lors du renommage du dossier' },
      { status: 500 }
    )
  }
}
