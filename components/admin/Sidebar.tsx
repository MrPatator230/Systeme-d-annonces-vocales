'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HiOutlineSpeakerWave,
  HiOutlineQueueList,
  HiOutlineMusicalNote,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi2'
import { useState } from 'react'

const menuItems = [
  {
    name: 'Banque de sons',
    href: '/admin/banque-de-sons',
    icon: HiOutlineMusicalNote,
    description: 'Gérer les fichiers audio'
  },
  {
    name: 'Conception annonce',
    href: '/admin/conception-annonce',
    icon: HiOutlineSpeakerWave,
    description: 'Créer des annonces'
  },
  {
    name: 'Liste des annonces',
    href: '/admin/liste-annonces',
    icon: HiOutlineQueueList,
    description: 'Voir toutes les annonces'
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <h1 className="text-xl font-semibold text-sncf-blue">
                SNCF Audio
              </h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Développer' : 'Réduire'}
            >
              {isCollapsed ? (
                <HiOutlineChevronRight className="w-5 h-5" />
              ) : (
                <HiOutlineChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50'
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`
                  w-6 h-6 
                  ${isActive ? 'text-blue-700' : 'text-gray-500'}
                `} />
                {!isCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Système d'annonces vocales
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
