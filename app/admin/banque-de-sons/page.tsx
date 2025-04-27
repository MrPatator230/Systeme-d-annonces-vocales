'use client'

import React, { useState, useEffect } from 'react'
import { uploadAudioFile, getAudioFiles, deleteAudioFile, updateAudioCategory } from '@/services/audioService'
import AudioPlayer from '@/components/AudioPlayer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { AUDIO_CONFIG, ERROR_MESSAGES, type AudioFile, type AudioCategory } from '@/config/audio'
import { validateAudioFile } from '@/utils/audioUtils'
import { HiOutlinePencil, HiOutlineTrash, HiXMark, HiCheck } from 'react-icons/hi2'

export default function BankeDeSonsPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AudioCategory>(AUDIO_CONFIG.storage.defaultCategory as AudioCategory)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState('')

  useEffect(() => {
    loadAudioFiles()
  }, [])

  const loadAudioFiles = async () => {
    try {
      const files = await getAudioFiles()
      // Ensure correct typing of categories
      const typedFiles = files.map(file => ({
        ...file,
        category: (AUDIO_CONFIG.storage.categories.includes(file.category as AudioCategory)
          ? file.category
          : AUDIO_CONFIG.storage.defaultCategory) as AudioCategory
      }))
      setAudioFiles(typedFiles)
    } catch (error) {
      console.error('Error loading audio files:', error)
      setError('Erreur lors du chargement des fichiers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsUploading(true)
    setError('')

    try {
      for (const file of Array.from(files)) {
        const validation = await validateAudioFile(file)
        if (!validation.isValid) {
          setError(validation.message)
          continue
        }

        const result = await uploadAudioFile(file, selectedCategory)
        if (result.success) {
          await loadAudioFiles()
        } else {
          setError(result.message || 'Erreur lors de l\'upload')
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      setError('Erreur lors de l\'upload des fichiers')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (filename: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return
    }

    try {
      const success = await deleteAudioFile(filename)
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

  const handleStartRename = (file: AudioFile) => {
    setEditingFile(file.name)
    const nameParts = file.name.split('.')
    nameParts.pop() // Remove extension
    setNewFileName(nameParts.join('.'))
  }

  const handleRename = async () => {
    if (!editingFile || !newFileName.trim()) return

    const extension = editingFile.split('.').pop() || ''
    const newFullName = `${newFileName.trim()}.${extension}`

    try {
      const response = await fetch('/api/audio/rename', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldName: editingFile,
          newName: newFullName,
        }),
      })

      if (response.ok) {
        await loadAudioFiles()
        setEditingFile(null)
        setNewFileName('')
      } else {
        setError('Erreur lors du renommage du fichier')
      }
    } catch (error) {
      console.error('Error renaming file:', error)
      setError('Erreur lors du renommage du fichier')
    }
  }

  const handleCategoryChange = async (file: AudioFile, newCategory: AudioCategory) => {
    try {
      const success = await updateAudioCategory(file.name, newCategory)
      if (success) {
        await loadAudioFiles()
      } else {
        setError('Erreur lors de la mise à jour de la catégorie')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      setError('Erreur lors de la mise à jour de la catégorie')
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Banque de sons</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Importer des fichiers audio</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as AudioCategory)}
            className="p-2 border rounded"
          >
            {AUDIO_CONFIG.storage.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept={AUDIO_CONFIG.upload.allowedTypes}
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="audio-upload"
            className={`
              cursor-pointer inline-flex items-center px-4 py-2 rounded-lg
              ${isUploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isUploading ? 'Upload en cours...' : 'Sélectionner des fichiers audio'}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Formats acceptés: MP3, WAV • Taille maximum: 10MB
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Fichiers audio disponibles</h2>
        <div className="space-y-2">
          {audioFiles.map((file) => (
            <div
              key={file.path}
              className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
            >
              <div className="flex-1">
                {editingFile === file.name ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="flex-1 p-1 border rounded"
                      autoFocus
                    />
                    <button
                      onClick={handleRename}
                      className="p-2 text-green-600 hover:text-green-700"
                      title="Sauvegarder"
                    >
                      <HiCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingFile(null)}
                      className="p-2 text-gray-600 hover:text-gray-700"
                      title="Annuler"
                    >
                      <HiXMark className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <AudioPlayer
                    src={file.path}
                    name={file.name}
                  />
                )}
              </div>

              <div className="flex items-center space-x-4 ml-4">
                <select
                  value={file.category}
                  onChange={(e) => handleCategoryChange(file, e.target.value as AudioCategory)}
                  className="p-1 text-sm border rounded"
                >
                  {AUDIO_CONFIG.storage.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleStartRename(file)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  title="Renommer"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleDeleteFile(file.name)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Supprimer"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {audioFiles.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Aucun fichier audio disponible
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
