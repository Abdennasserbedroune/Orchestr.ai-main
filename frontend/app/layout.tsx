import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',   // headings
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',      // body
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',      // code/data
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Orchestrai — AI Agent Operating System',
  description: 'Run your entire business on a team of AI agents.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
