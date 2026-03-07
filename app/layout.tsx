import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'HealthDecode AI - Understand Your Medical Reports in Seconds',
  description: 'AI-powered medical report analysis with clear explanations and personalized health insights. Upload your medical reports and get instant, easy-to-understand analysis.',
  keywords: ['medical AI', 'health analytics', 'medical report analysis', 'healthcare', 'AI diagnosis'],
  authors: [{ name: 'HealthDecode AI' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0066FF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
