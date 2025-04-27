import { AUDIO_CONFIG, type AudioFile, type AudioCategory } from '@/config/audio'

export async function getAudioFiles(): Promise<AudioFile[]> {
  try {
    const response = await fetch('/api/audio/list')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }

    return data.files
  } catch (error) {
    console.error('Error fetching audio files:', error)
    throw error
  }
}

export async function uploadAudioFile(file: File, category: AudioCategory) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)

    const response = await fetch('/api/audio/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    return {
      success: response.ok,
      message: data.error || 'Fichier uploadé avec succès',
      file: data.file,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'upload du fichier',
    }
  }
}

export async function deleteAudioFile(filename: string): Promise<boolean> {
  try {
    const response = await fetch('/api/audio/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    })

    const data = await response.json()
    return response.ok && data.success
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

export async function updateAudioCategory(filename: string, category: AudioCategory): Promise<boolean> {
  try {
    const response = await fetch('/api/audio/update-category', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, category }),
    })

    const data = await response.json()
    return response.ok && data.success
  } catch (error) {
    console.error('Error updating category:', error)
    return false
  }
}

export async function concatenateAudioFiles(files: string[], outputName: string) {
  try {
    const response = await fetch('/api/audio/concatenate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files, outputName }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      error: data.error,
      outputPath: data.outputPath,
    }
  } catch (error) {
    console.error('Error concatenating files:', error)
    return {
      success: false,
      error: 'Erreur lors de la concaténation des fichiers',
    }
  }
}

export async function renameAudioFile(oldName: string, newName: string) {
  try {
    const response = await fetch('/api/audio/rename', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldName, newName }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      error: data.error,
      newPath: data.newPath,
    }
  } catch (error) {
    console.error('Error renaming file:', error)
    return {
      success: false,
      error: 'Erreur lors du renommage du fichier',
    }
  }
}
