'use client'

import React, { useRef, useState } from 'react'
import { HiPlay, HiPause } from 'react-icons/hi2'

interface AudioPlayerProps {
  src: string
  name: string
}

export default function AudioPlayer({ src, name }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  return (
    <div className="flex items-center space-x-3 flex-1">
      <button
        onClick={togglePlay}
        className="p-2 rounded-full hover:bg-gray-200"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <HiPause className="w-5 h-5" />
        ) : (
          <HiPlay className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" title={name}>
          {name}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 accent-blue-500"
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  )
}
