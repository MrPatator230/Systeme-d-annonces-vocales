import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { AudioMetadata } from '@/config/audio'

const METADATA_PATH = join(process.cwd(), 'public', 'audio', 'metadata.json')

export async function readMetadata(): Promise<AudioMetadata> {
  try {
    const content = await readFile(METADATA_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    // Return default structure if file doesn't exist
    return {
      folders: {},
      files: {}
    }
  }
}

export async function writeMetadata(metadata: AudioMetadata): Promise<void> {
  await writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf-8')
}

export async function validateAudioFile(file: File): Promise<{ isValid: boolean; message: string }> {
  // Check file size
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'Le fichier est trop volumineux (max 10MB)'
    }
  }

  // Check file type
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/wave']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Format de fichier non supporté (MP3 ou WAV uniquement)'
    }
  }

  return {
    isValid: true,
    message: ''
  }
}

export function sanitizeFilename(filename: string): string {
  // Remove any path traversal characters
  const sanitized = filename.replace(/[/\\?%*:|"<>]/g, '-')
  
  // Ensure the filename doesn't start with a dot
  return sanitized.replace(/^\.+/, '')
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function isAudioFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ['mp3', 'wav'].includes(ext)
}
