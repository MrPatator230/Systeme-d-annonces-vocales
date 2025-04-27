'use client'

import React, { useState, useEffect } from 'react'
import { HiOutlinePlay, HiOutlineStop, HiOutlineTrash, HiArrowDown } from 'react-icons/hi2'
import { useAudio } from '@/contexts/AudioContext'
import { getAudioFiles, deleteAudioFile } from '@/services/audioService'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatDuration } from '@/utils/audioUtils'
import { AUDIO_CONFIG, type AudioFile, type AudioCategory } from '@/config/audio'

export default function ListeAnnoncesPage() {
  const [announcements, setAnnouncements] = useState<AudioFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { currentFile, playAudio, stopAudio } = useAudio()

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    setIsLoading(true)
    try {
      const files = await getAudioFiles()
      // Filter only announcements and ensure correct typing
      const announcementFiles = files
        .filter(file => file.category === 'Annonces')
        .map(file => ({
          ...file,
          category: (AUDIO_CONFIG.storage.categories.includes(file.category as AudioCategory)
            ? file.category
            : AUDIO_CONFIG.storage.defaultCategory) as AudioCategory
        }))
      setAnnouncements(announcementFiles)
    } catch (error) {
      console.error('Error loading announcements:', error)
      setError('Erreur lors du chargement des annonces')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (file: AudioFile) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return
    }

    try {
      const success = await deleteAudioFile(file.name)
      if (success) {
        await loadAnnouncements()
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      setError('Erreur lors de la suppression')
    }
  }

  const handleDownload = (file: AudioFile) => {
    const link = document.createElement('a')
    link.href = file.path
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePlayToggle = (file: AudioFile) => {
    if (currentFile?.path === file.path) {
      stopAudio()
    } else {
      playAudio(file)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Liste des annonces</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lecture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Aucune annonce disponible
                  </td>
                </tr>
              ) : (
                announcements.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePlayToggle(file)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        {currentFile?.path === file.path ? (
                          <HiOutlineStop className="w-5 h-5 text-red-600" />
                        ) : (
                          <HiOutlinePlay className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {file.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(file.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Télécharger"
                        >
                          <HiArrowDown className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
