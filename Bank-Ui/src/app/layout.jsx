import { Inter } from 'next/font/google'
import { BANK_NAME, BANK_TAGLINE } from '@/lib/constants'
import './globals.css'

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const display = Inter({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  title: `${BANK_NAME} — Mobile Banking`,
  description: BANK_TAGLINE,
  applicationName: BANK_NAME,
  icons: { icon: '/favicon.svg' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#3D3AC7',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
