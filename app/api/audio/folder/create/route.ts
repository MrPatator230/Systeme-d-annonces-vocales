import { NextResponse } from 'next/server'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { readMetadata, writeMetadata } from '@/utils/audioUtils'

export async function POST(request: Request) {
  try {
    const { path, name } = await request.json()
    
    // Create the full path
    const audioDir = join(process.cwd(), 'public', 'audio')
    const newFolderPath = join(audioDir, path, name).replace(/\\/g, '/')
    
    // Create the folder
    await mkdir(newFolderPath, { recursive: true })
    
    // Update metadata
    const metadata = await readMetadata()
    const relativePath = join(path, name).replace(/\\/g, '/')
    
    metadata.folders[relativePath] = {
      name,
      createdAt: new Date().toISOString()
    }
    
    await writeMetadata(metadata)
    
    return NextResponse.json({ success: true, path: relativePath })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du dossier' },
      { status: 500 }
    )
  }
}
