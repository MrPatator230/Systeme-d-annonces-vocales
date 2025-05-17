'use client'

import React, { useState } from 'react'
import { HiPlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2'

interface FolderActionsProps {
  currentPath: string
  onCreateFolder: (name: string) => void
  onRenameFolder: (oldPath: string, newName: string) => void
  onDeleteFolder: (path: string) => void
}

const FolderActions: React.FC<FolderActionsProps> = ({
  currentPath,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}) => {
  const [isCreating, setIsCreating] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setIsCreating(false)
    }
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newFolderName.trim()) {
      onRenameFolder(currentPath, newFolderName.trim())
      setNewFolderName('')
      setIsRenaming(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier et tout son contenu ?')) {
      onDeleteFolder(currentPath)
    }
  }

  const startRename = () => {
    const currentName = currentPath.split('/').pop() || ''
    setNewFolderName(currentName)
    setIsRenaming(true)
  }

  return (
    <div className="space-y-4">
      {/* Create Folder */}
      {isCreating ? (
        <form onSubmit={handleCreateSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nom du dossier"
            className="flex-1 p-2 border rounded"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewFolderName('')
              }
            }}
          />
          <button
            type="submit"
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Créer
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false)
              setNewFolderName('')
            }}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Annuler
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <HiPlus className="w-5 h-5" />
          <span>Nouveau dossier</span>
        </button>
      )}

      {/* Rename Folder */}
      {currentPath !== '/audio' && (
        isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nouveau nom"
              className="flex-1 p-2 border rounded"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsRenaming(false)
                  setNewFolderName('')
                }
              }}
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Renommer
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRenaming(false)
                setNewFolderName('')
              }}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          </form>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={startRename}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600"
              title="Renommer le dossier"
            >
              <HiOutlinePencil className="w-5 h-5" />
              <span>Renommer</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600"
              title="Supprimer le dossier"
            >
              <HiOutlineTrash className="w-5 h-5" />
              <span>Supprimer</span>
            </button>
          </div>
        )
      )}
    </div>
  )
}

export default FolderActions
