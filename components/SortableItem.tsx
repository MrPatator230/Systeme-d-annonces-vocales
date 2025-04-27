'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HiOutlineEllipsisVertical } from 'react-icons/hi2'
import AudioPlayer from './AudioPlayer'
import type { AudioFile } from '@/config/audio'

interface SortableItemProps {
  id: string
  file: AudioFile
  onRemove: (id: string) => void
}

export default function SortableItem({ id, file, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border
        ${isDragging ? 'border-blue-400' : 'border-gray-200'}
      `}
    >
      <button
        className="p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <HiOutlineEllipsisVertical className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <AudioPlayer
          src={file.path}
          name={file.name}
        />
      </div>

      <button
        onClick={() => onRemove(id)}
        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        title="Retirer de la séquence"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}
