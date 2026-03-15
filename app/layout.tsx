import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'UTbot',
  description: 'Course selection, professor analysis and academic chatbot for University of Toronto (St. George) students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0e14] text-[#e8ecf1] min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
