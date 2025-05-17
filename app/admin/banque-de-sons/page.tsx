'use client'

import React, { useState, useEffect } from 'react'
import { 
  getAudioFiles, 
  uploadAudioFile, 
  deleteAudioFile, 
  renameAudioFile,
  createFolder,
  renameFolder,
  deleteFolder,
  moveFolder
} from '@/services/audioService'
import { AudioFile, Folder } from '@/config/audio'
import LoadingSpinner from '@/components/LoadingSpinner'
import FolderTree from '@/components/admin/FileManager/FolderTree'
import FileList from '@/components/admin/FileManager/FileList'
import FolderActions from '@/components/admin/FileManager/FolderActions'
import DragDropZone from '@/components/admin/FileManager/DragDropZone'

export default function BankeDeSonsPage() {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentPath, setCurrentPath] = useState('/audio')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAudioFiles()
  }, [])

  const loadAudioFiles = async () => {
    try {
      const { files, folders } = await getAudioFiles()
      setFiles(files)
      setFolders(folders)
    } catch (error) {
      console.error('Error loading audio files:', error)
      setError('Erreur lors du chargement des fichiers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (uploadedFiles: File[]) => {
    setIsUploading(true)
    setError('')

    try {
      for (const file of uploadedFiles) {
        const result = await uploadAudioFile(file, currentPath)
        if (!result.success) {
          setError(result.message || 'Erreur lors de l\'upload')
          break
        }
      }
      await loadAudioFiles()
    } catch (error) {
      console.error('Error uploading files:', error)
      setError('Erreur lors de l\'upload des fichiers')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (path: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return
    }

    try {
      const success = await deleteAudioFile(path)
      if (success) {
        await loadAudioFiles()
      } else {
        setError('Erreur lors de la suppression du fichier')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      setError('Erreur lors de la suppression du fichier')
    }
  }

  const handleRenameFile = async (path: string, newName: string) => {
    try {
      const result = await renameAudioFile(path, newName)
      if (result.success) {
        await loadAudioFiles()
      } else {
        setError(result.error || 'Erreur lors du renommage du fichier')
      }
    } catch (error) {
      console.error('Error renaming file:', error)
      setError('Erreur lors du renommage du fichier')
    }
  }

  const handleCreateFolder = async (name: string) => {
    try {
      const result = await createFolder(currentPath, name)
      if (result.success) {
        await loadAudioFiles()
      } else {
        setError(result.error || 'Erreur lors de la création du dossier')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      setError('Erreur lors de la création du dossier')
    }
  }

  const handleRenameFolder = async (oldPath: string, newName: string) => {
    try {
      const result = await renameFolder(oldPath, newName)
      if (result.success) {
        await loadAudioFiles()
        if (currentPath === oldPath) {
          setCurrentPath(result.path)
        }
      } else {
        setError(result.error || 'Erreur lors du renommage du dossier')
      }
    } catch (error) {
      console.error('Error renaming folder:', error)
      setError('Erreur lors du renommage du dossier')
    }
  }

  const handleDeleteFolder = async (path: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier et tout son contenu ?')) {
      return
    }

    try {
      const result = await deleteFolder(path)
      if (result.success) {
        await loadAudioFiles()
        if (currentPath.startsWith(path)) {
          setCurrentPath('/audio')
        }
      } else {
        setError(result.error || 'Erreur lors de la suppression du dossier')
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      setError('Erreur lors de la suppression du dossier')
    }
  }

  const handleMoveFolder = async (sourcePath: string, targetPath: string) => {
    try {
      const result = await moveFolder(sourcePath, targetPath)
      if (result.success) {
        await loadAudioFiles()
        if (currentPath.startsWith(sourcePath)) {
          setCurrentPath(result.path)
        }
      } else {
        setError(result.error || 'Erreur lors du déplacement du dossier')
      }
    } catch (error) {
      console.error('Error moving folder:', error)
      setError('Erreur lors du déplacement du dossier')
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Banque de sons</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Left sidebar with folder tree */}
        <div className="col-span-1">
          <FolderTree
            folders={folders}
            currentPath={currentPath}
            onSelectFolder={setCurrentPath}
            onMoveFolder={handleMoveFolder}
          />
        </div>

        {/* Main content area */}
        <div className="col-span-3 space-y-6">
          {/* Folder actions */}
          <FolderActions
            currentPath={currentPath}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />

          {/* Upload zone */}
          <DragDropZone
            currentPath={currentPath}
            onUpload={handleFileUpload}
            isUploading={isUploading}
          />

          {/* File list */}
          <FileList
            files={files}
            currentPath={currentPath}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
          />
        </div>
      </div>
    </div>
  )
}
