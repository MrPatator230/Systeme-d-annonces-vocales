'use client'

import React from 'react'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineDocument } from 'react-icons/hi2'
import { AudioFile } from '@/config/audio'
import AudioPlayer from '@/components/AudioPlayer'

interface FileListProps {
  files: AudioFile[]
  currentPath: string
  onDeleteFile: (path: string) => void
  onRenameFile: (path: string, newName: string) => void
}

const FileList: React.FC<FileListProps> = ({
  files,
  currentPath,
  onDeleteFile,
  onRenameFile,
}) => {
  const [editingFile, setEditingFile] = React.useState<string | null>(null)
  const [newFileName, setNewFileName] = React.useState('')

  const handleStartRename = (file: AudioFile) => {
    setEditingFile(file.path)
    const nameParts = file.name.split('.')
    nameParts.pop() // Remove extension
    setNewFileName(nameParts.join('.'))
  }

  const handleRename = (file: AudioFile) => {
    if (!newFileName.trim()) return
    
    const extension = file.name.split('.').pop() || ''
    const newName = `${newFileName.trim()}.${extension}`
    
    onRenameFile(file.path, newName)
    setEditingFile(null)
    setNewFileName('')
  }

  const filteredFiles = files.filter(file => {
    const filePath = file.path.substring(0, file.path.lastIndexOf('/'))
    return filePath === currentPath
  })

  return (
    <div className="space-y-2">
      {filteredFiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun fichier dans ce dossier
        </div>
      ) : (
        filteredFiles.map((file) => (
          <div
            key={file.path}
            className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3 flex-1">
              <HiOutlineDocument className="w-5 h-5 text-gray-400" />
              {editingFile === file.path ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="flex-1 p-1 border rounded"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(file)
                      if (e.key === 'Escape') setEditingFile(null)
                    }}
                  />
                  <button
                    onClick={() => handleRename(file)}
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Renommer
                  </button>
                  <button
                    onClick={() => setEditingFile(null)}
                    className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <AudioPlayer src={file.path} name={file.name} />
              )}
            </div>

            {!editingFile && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStartRename(file)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  title="Renommer"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteFile(file.path)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Supprimer"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default FileList
