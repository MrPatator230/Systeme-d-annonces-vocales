'use client'

import React, { useState, useCallback } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useRouter } from 'next/navigation'
import SortableItem from '@/components/SortableItem'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAudio } from '@/contexts/AudioContext'
import { getAudioFilesForConception, concatenateAudioFiles } from '@/services/audioService'
import { AUDIO_CONFIG, type AudioFile, type AudioCategory } from '@/config/audio'

export default function ConceptionAnnoncePage() {
  const router = useRouter()
  const { stopAudio } = useAudio()
  const [isLoading, setIsLoading] = useState(false)
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<AudioFile[]>([])
  const [outputName, setOutputName] = useState('')
  const [error, setError] = useState('')

  // Load audio files
  React.useEffect(() => {
    loadAudioFiles()
  }, [])

  const loadAudioFiles = async () => {
    setIsLoading(true)
    try {
      const files = await getAudioFilesForConception()
      // Ensure the category is of type AudioCategory
      const typedFiles: AudioFile[] = files.map(file => ({
        ...file,
        category: (AUDIO_CONFIG.storage.categories.includes(file.category as AudioCategory) 
          ? file.category 
          : AUDIO_CONFIG.storage.defaultCategory) as AudioCategory
      }))
      setAudioFiles(typedFiles)
    } catch (error) {
      console.error('Error loading files:', error)
      setError('Erreur lors du chargement des fichiers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedFiles((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id)
        const newIndex = items.findIndex((item) => item.name === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleAddFile = (file: AudioFile) => {
    if (!selectedFiles.find(f => f.name === file.name)) {
      setSelectedFiles([...selectedFiles, file])
    }
  }

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter(file => file.name !== id))
  }

  const handleConcatenate = async () => {
    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins un fichier')
      return
    }

    if (!outputName) {
      setError('Veuillez entrer un nom pour l\'annonce')
      return
    }

    setIsLoading(true)
    stopAudio()

    try {
      const result = await concatenateAudioFiles(
        selectedFiles.map(f => f.name),
        `${outputName}.mp3`
      )

      if (result.success) {
        router.push('/admin/liste-annonces')
      } else {
        setError(result.error || 'Erreur lors de la concaténation')
      }
    } catch (error) {
      console.error('Error concatenating files:', error)
      setError('Erreur lors de la concaténation')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Conception d'annonce</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Files */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Fichiers disponibles</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {audioFiles.map((file) => (
              <div
                key={file.name}
                className="p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAddFile(file)}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    file.category === 'Non classé' ? 'bg-gray-100' : 'bg-blue-100'
                  }`}>
                    {file.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sequence Builder */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Séquence d'annonce</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'annonce
            </label>
            <input
              type="text"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              placeholder="Entrez le nom de l'annonce"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedFiles.map(f => f.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedFiles.map((file) => (
                  <SortableItem
                    key={file.name}
                    id={file.name}
                    file={file}
                    onRemove={handleRemoveFile}
                  />
                ))}
                {selectedFiles.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Glissez des fichiers ici pour créer votre annonce
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={handleConcatenate}
            disabled={selectedFiles.length === 0 || !outputName || isLoading}
            className={`
              mt-4 w-full px-4 py-2 rounded-lg font-medium text-white
              ${selectedFiles.length === 0 || !outputName || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {isLoading ? 'Création en cours...' : 'Créer l\'annonce'}
          </button>
        </div>
      </div>
    </div>
  )
}
