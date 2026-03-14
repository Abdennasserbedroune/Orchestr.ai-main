import type { Metadata, Viewport } from 'next'
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display-var',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-var',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-var',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Orchestrai — AI Agent Operating System',
  description: 'Run your entire business on a team of AI agents.',
  openGraph: {
    title: 'Orchestrai — AI Agent Operating System',
    description: 'Run your entire business on a team of AI agents.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orchestrai',
    description: 'Run your entire business on a team of AI agents.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
