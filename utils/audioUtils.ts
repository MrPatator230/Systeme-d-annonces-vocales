import { AUDIO_CONFIG, ERROR_MESSAGES } from '@/config/audio'

interface ValidationResult {
  isValid: boolean
  message: string
}

export async function validateAudioFile(file: File): Promise<ValidationResult> {
  // Check file size
  if (file.size > AUDIO_CONFIG.upload.maxSize) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.UPLOAD.FILE_TOO_LARGE
    }
  }

  // Check file type
  if (!AUDIO_CONFIG.upload.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.UPLOAD.INVALID_TYPE
    }
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !AUDIO_CONFIG.upload.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.UPLOAD.INVALID_TYPE
    }
  }

  return {
    isValid: true,
    message: 'Fichier valide'
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function generateSafeFileName(originalName: string): string {
  const baseName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const extension = originalName.split('.').pop()?.toLowerCase()
  return `${baseName}.${extension}`
}

export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const objectUrl = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl)
      resolve(audio.duration)
    })

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(ERROR_MESSAGES.PLAYBACK.LOAD_ERROR))
    })

    audio.src = objectUrl
  })
}

export function validateFileName(name: string): boolean {
  return /^[a-zA-Z0-9-_ ]+\.(mp3|wav)$/i.test(name)
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Annonces': 'bg-blue-100 text-blue-800',
    'Stations': 'bg-green-100 text-green-800',
    'Horaires': 'bg-yellow-100 text-yellow-800',
    'Messages': 'bg-purple-100 text-purple-800',
    'Effets sonores': 'bg-red-100 text-red-800',
    'Non classé': 'bg-gray-100 text-gray-800'
  }
  return colors[category] || colors['Non classé']
}

export async function concatenateAudioBuffers(audioBuffers: AudioBuffer[], audioContext: AudioContext): Promise<AudioBuffer> {
  // Calculate total duration
  const totalLength = audioBuffers.reduce((total, buffer) => total + buffer.length, 0)
  const sampleRate = audioBuffers[0].sampleRate
  const numberOfChannels = audioBuffers[0].numberOfChannels

  // Create new buffer for the concatenated audio
  const result = audioContext.createBuffer(
    numberOfChannels,
    totalLength,
    sampleRate
  )

  // Fill the result buffer
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = result.getChannelData(channel)
    let offset = 0

    for (const buffer of audioBuffers) {
      channelData.set(buffer.getChannelData(channel), offset)
      offset += buffer.length
    }
  }

  return result
}
