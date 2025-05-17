'use client'

import React from 'react'
import { HiFolder, HiFolderOpen, HiChevronRight, HiChevronDown } from 'react-icons/hi2'
import { Folder } from '@/config/audio'

interface FolderTreeProps {
  folders: Folder[]
  currentPath: string
  onSelectFolder: (path: string) => void
  onMoveFolder: (sourcePath: string, targetPath: string) => Promise<void>
}

interface FolderNode {
  name: string
  path: string
  children: FolderNode[]
}

const FolderTree: React.FC<FolderTreeProps> = ({ folders, currentPath, onSelectFolder, onMoveFolder }) => {
  const [draggedFolder, setDraggedFolder] = React.useState<string | null>(null)
  const [dropTarget, setDropTarget] = React.useState<string | null>(null)

  // Build tree structure from flat folder list
  const buildTree = (folders: Folder[]): FolderNode[] => {
    const tree: FolderNode[] = []
    const map: { [key: string]: FolderNode } = {}

    // Create all nodes
    folders.forEach(folder => {
      map[folder.path] = {
        name: folder.name,
        path: folder.path,
        children: []
      }
    })

    // Build tree structure
    folders.forEach(folder => {
      const node = map[folder.path]
      const parentPath = folder.path.substring(0, folder.path.lastIndexOf('/'))
      
      if (parentPath && map[parentPath]) {
        map[parentPath].children.push(node)
      } else {
        tree.push(node)
      }
    })

    return tree
  }

  const handleDragStart = (e: React.DragEvent, path: string) => {
    e.stopPropagation()
    setDraggedFolder(path)
    e.dataTransfer.setData('text/plain', path)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, path: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedFolder && draggedFolder !== path) {
      // Prevent dropping a folder into its own subdirectory
      if (!path.startsWith(draggedFolder)) {
        setDropTarget(path)
        e.dataTransfer.dropEffect = 'move'
      }
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
  }

  const handleDrop = async (e: React.DragEvent, targetPath: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const sourcePath = draggedFolder
    setDraggedFolder(null)
    setDropTarget(null)

    if (sourcePath && targetPath !== sourcePath && !targetPath.startsWith(sourcePath)) {
      await onMoveFolder(sourcePath, targetPath)
    }
  }

  const handleFolderClick = (path: string) => {
    // If the clicked folder is already selected, deselect it by setting path to '/audio'
    if (currentPath === path) {
      onSelectFolder('/audio')
    } else {
      onSelectFolder(path)
    }
  }

  const renderFolder = (node: FolderNode, level: number = 0) => {
    const isSelected = currentPath === node.path
    const isExpanded = currentPath.startsWith(node.path)
    const isDropTarget = dropTarget === node.path
    const isDragged = draggedFolder === node.path

    return (
      <div 
        key={node.path} 
        style={{ marginLeft: `${level * 16}px` }}
        className={`
          ${isDropTarget ? 'bg-blue-50 rounded' : ''}
          ${isDragged ? 'opacity-50' : ''}
        `}
        draggable
        onDragStart={(e) => handleDragStart(e, node.path)}
        onDragOver={(e) => handleDragOver(e, node.path)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, node.path)}
      >
        <button
          onClick={() => handleFolderClick(node.path)}
          className={`
            flex items-center space-x-1 p-1 rounded hover:bg-gray-100 w-full text-left
            ${isSelected ? 'bg-blue-50 text-blue-600' : ''}
          `}
        >
          <span className="w-4">
            {node.children.length > 0 && (
              isExpanded ? <HiChevronDown className="w-4 h-4" /> : <HiChevronRight className="w-4 h-4" />
            )}
          </span>
          {isExpanded ? (
            <HiFolderOpen className="w-5 h-5 text-blue-500" />
          ) : (
            <HiFolder className="w-5 h-5 text-gray-400" />
          )}
          <span>{node.name}</span>
        </button>
        
        {isExpanded && node.children.length > 0 && (
          <div className="mt-1">
            {node.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(child => renderFolder(child, level + 1))
            }
          </div>
        )}
      </div>
    )
  }

  const tree = buildTree(folders)

  return (
    <div className="p-2 bg-white rounded-lg border">
      <div className="font-medium mb-2">Dossiers</div>
      <div className="space-y-1">
        {tree
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(node => renderFolder(node))
        }
      </div>
    </div>
  )
}

export default FolderTree
