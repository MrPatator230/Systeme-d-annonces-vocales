import { AudioFile, Folder } from '@/config/audio'

export async function getAudioFiles(): Promise<{ files: AudioFile[], folders: Folder[] }> {
  try {
    const response = await fetch('/api/audio/list')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }

    return {
      files: data.files,
      folders: data.folders
    }
  } catch (error) {
    console.error('Error fetching audio files:', error)
    throw error
  }
}

export async function uploadAudioFile(file: File, path: string) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

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

export async function deleteAudioFile(path: string): Promise<boolean> {
  try {
    const response = await fetch('/api/audio/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })

    const data = await response.json()
    return response.ok && data.success
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

export async function renameAudioFile(path: string, newName: string) {
  try {
    const response = await fetch('/api/audio/rename', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, newName }),
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

export async function createFolder(parentPath: string, name: string) {
  try {
    const response = await fetch('/api/audio/folder/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: parentPath, name }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      error: data.error,
      path: data.path,
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    return {
      success: false,
      error: 'Erreur lors de la création du dossier',
    }
  }
}

export async function renameFolder(path: string, newName: string) {
  try {
    const response = await fetch('/api/audio/folder/rename', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPath: path, newName }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      error: data.error,
      path: data.path,
    }
  } catch (error) {
    console.error('Error renaming folder:', error)
    return {
      success: false,
      error: 'Erreur lors du renommage du dossier',
    }
  }
}

export async function deleteFolder(path: string) {
  try {
    const response = await fetch('/api/audio/folder/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      error: data.error,
    }
  } catch (error) {
    console.error('Error deleting folder:', error)
    return {
      success: false,
      error: 'Erreur lors de la suppression du dossier',
    }
  }
}

export async function moveFolder(sourcePath: string, targetPath: string) {
  try {
    const response = await fetch('/api/audio/folder/move', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourcePath, targetPath }),
    })

    const data = await response.json()
    return {
      success: response.ok,
      error: data.error,
      path: data.path,
    }
  } catch (error) {
    console.error('Error moving folder:', error)
    return {
      success: false,
      error: 'Erreur lors du déplacement du dossier',
    }
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
