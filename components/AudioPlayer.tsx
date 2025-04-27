'use client'

import React from 'react'
import { HiPlay, HiStop } from 'react-icons/hi2'
import { useAudio } from '@/contexts/AudioContext'
import type { AudioFile } from '@/config/audio'

interface AudioPlayerProps {
  src: string
  name: string
  onPlay?: () => void
  onStop?: () => void
}

export default function AudioPlayer({ src, name, onPlay, onStop }: AudioPlayerProps) {
  const { isPlaying, currentFile, playAudio, stopAudio } = useAudio()

  const isCurrentlyPlaying = isPlaying && currentFile?.path === src

  const handlePlay = () => {
    if (isCurrentlyPlaying) {
      stopAudio()
      onStop?.()
    } else {
      const audioFile: AudioFile = {
        name,
        path: src,
        category: 'Non classé',
        createdAt: new Date().toISOString(),
      }
      playAudio(audioFile)
      onPlay?.()
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handlePlay}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title={isCurrentlyPlaying ? 'Arrêter' : 'Lire'}
      >
        {isCurrentlyPlaying ? (
          <HiStop className="w-5 h-5 text-red-600" />
        ) : (
          <HiPlay className="w-5 h-5 text-blue-600" />
        )}
      </button>
      <span className="flex-1 truncate" title={name}>
        {name}
      </span>
      {isCurrentlyPlaying && (
        <div className="flex items-center space-x-2">
          <div className="w-16 h-1 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 animate-[progress_1s_ease-in-out_infinite]"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
