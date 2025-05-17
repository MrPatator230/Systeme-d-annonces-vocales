import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { readMetadata } from '@/utils/audioUtils'
import { AudioFile, Folder } from '@/config/audio'

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name)
      return entry.isDirectory() ? getAllFiles(fullPath) : [fullPath]
    })
  )
  return files.flat()
}

export async function GET() {
  try {
    const audioDir = join(process.cwd(), 'public', 'audio')
    const metadata = await readMetadata()

    // Get all files recursively
    const allFiles = await getAllFiles(audioDir)
    
    // Convert to relative paths and filter audio files
    const audioFiles = allFiles
      .map(file => file.replace(audioDir, '').replace(/\\/g, '/'))
      .filter(file => /\.(mp3|wav)$/i.test(file))

    // Create file objects with metadata
    const files: AudioFile[] = audioFiles.map(path => {
      const name = path.split('/').pop() || ''
      const fileInfo = metadata.files[path] || {
        name,
        createdAt: new Date().toISOString()
      }

      return {
        name,
        path: `/audio${path}`,
        createdAt: fileInfo.createdAt
      }
    })

    // Create folder objects with metadata
    const folders: Folder[] = Object.entries(metadata.folders).map(([path, info]) => ({
      name: info.name,
      path,
      createdAt: info.createdAt
    }))

    // Sort files by creation date (newest first)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Sort folders by name
    folders.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      files,
      folders
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
      { status: 500 }
    )
  }
}
