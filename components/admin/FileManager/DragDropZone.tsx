'use client'

import React, { useState, useCallback } from 'react'
import { HiOutlineCloudArrowUp } from 'react-icons/hi2'
import { AUDIO_CONFIG } from '@/config/audio'

interface DragDropZoneProps {
  currentPath: string
  onUpload: (files: File[]) => Promise<void>
  isUploading: boolean
}

const DragDropZone = ({ currentPath, onUpload, isUploading }: DragDropZoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (isUploading) return

    const files = Array.from(e.dataTransfer.files).filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      return extension === 'mp3' || extension === 'wav'
    })

    if (files.length > 0) {
      onUpload(files)
    }
  }, [isUploading, onUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files))
    }
  }, [onUpload])

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={AUDIO_CONFIG.upload.allowedTypes}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />
      <div className="flex flex-col items-center space-y-2">
        <HiOutlineCloudArrowUp className="w-12 h-12 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600">Déposez les fichiers ici...</p>
        ) : isUploading ? (
          <p className="text-gray-500">Upload en cours...</p>
        ) : (
          <>
            <p className="text-gray-600">
              Glissez et déposez des fichiers audio ici, ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">
              Formats acceptés: MP3, WAV • Taille maximum: 10MB
            </p>
            <p className="text-sm text-gray-500">
              Dossier actuel: {currentPath}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default DragDropZone
