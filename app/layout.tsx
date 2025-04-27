import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Système d\'annonces vocales SNCF',
  description: 'Système de génération d\'annonces sonores SNCF avec la voix de E-Mone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
