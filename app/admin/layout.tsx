import { AudioProvider } from '@/contexts/AudioContext'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AudioProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AudioProvider>
  )
}
