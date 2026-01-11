import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CellCount - Medical Image Cell Counter',
  description: 'An app to help pathologists calculate cells in medical images',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
