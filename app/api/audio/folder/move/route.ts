import { NextResponse } from 'next/server'
import { rename } from 'fs/promises'
import { join } from 'path'
import { readMetadata, writeMetadata } from '@/utils/audioUtils'

export async function PUT(request: Request) {
  try {
    const { sourcePath, targetPath } = await request.json()
    
    // Get the folder name from source path
    const folderName = sourcePath.split('/').pop()
    const newPath = `${targetPath}/${folderName}`
    
    // Create the full paths
    const audioDir = join(process.cwd(), 'public', 'audio')
    const sourceFolderPath = join(audioDir, sourcePath)
    const targetFolderPath = join(audioDir, newPath)
    
    // Move the folder
    await rename(sourceFolderPath, targetFolderPath)
    
    // Update metadata
    const metadata = await readMetadata()
    
    // Update folder entry
    const sourceFolderInfo = metadata.folders[sourcePath]
    delete metadata.folders[sourcePath]
    metadata.folders[newPath] = {
      name: folderName,
      createdAt: sourceFolderInfo.createdAt
    }
    
    // Update paths for nested folders and files
    for (const [path, info] of Object.entries(metadata.folders)) {
      if (path.startsWith(sourcePath + '/')) {
        const updatedPath = path.replace(sourcePath, newPath)
        metadata.folders[updatedPath] = {
          name: info.name,
          createdAt: info.createdAt
        }
        delete metadata.folders[path]
      }
    }
    
    for (const [path, info] of Object.entries(metadata.files)) {
      if (path.startsWith(sourcePath + '/')) {
        const updatedPath = path.replace(sourcePath, newPath)
        metadata.files[updatedPath] = {
          name: info.name,
          createdAt: info.createdAt
        }
        delete metadata.files[path]
      }
    }
    
    await writeMetadata(metadata)
    
    return NextResponse.json({ 
      success: true, 
      path: newPath 
    })
  } catch (error) {
    console.error('Error moving folder:', error)
    return NextResponse.json(
      { error: 'Erreur lors du déplacement du dossier' },
      { status: 500 }
    )
  }
}
