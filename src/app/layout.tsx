import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vettd — Defence Talent Platform',
  description: 'The specialist platform connecting security-cleared defence professionals with leading employers.',
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
