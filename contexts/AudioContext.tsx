'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { AUDIO_CONFIG, ERROR_MESSAGES, type AudioFile } from '@/config/audio'

interface AudioContextType {
  currentAudio: HTMLAudioElement | null
  isPlaying: boolean
  currentFile: AudioFile | null
  volume: number
  playAudio: (file: AudioFile) => void
  stopAudio: () => void
  setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null)
  const [volume, setVolumeState] = useState(AUDIO_CONFIG.player.volume)

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setIsPlaying(false)
      setCurrentFile(null)
    }
  }, [currentAudio])

  const playAudio = useCallback((file: AudioFile) => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        stopAudio()
      }

      // Create and play new audio
      const audio = new Audio(file.path)
      audio.volume = volume

      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentFile(null)
      })

      audio.addEventListener('error', () => {
        console.error(ERROR_MESSAGES.PLAYBACK.LOAD_ERROR)
        setIsPlaying(false)
        setCurrentFile(null)
      })

      audio.play().then(() => {
        setCurrentAudio(audio)
        setIsPlaying(true)
        setCurrentFile(file)
      }).catch((error) => {
        console.error(ERROR_MESSAGES.PLAYBACK.PLAY_ERROR, error)
        setIsPlaying(false)
        setCurrentFile(null)
      })
    } catch (error) {
      console.error(ERROR_MESSAGES.PLAYBACK.NOT_SUPPORTED, error)
      setIsPlaying(false)
      setCurrentFile(null)
    }
  }, [currentAudio, stopAudio, volume])

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
    if (currentAudio) {
      currentAudio.volume = clampedVolume
    }
  }, [currentAudio])

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        isPlaying,
        currentFile,
        volume,
        playAudio,
        stopAudio,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
