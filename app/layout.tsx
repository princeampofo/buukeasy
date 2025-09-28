import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext'
import type { Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'BuukEasy - Simplifying Your Booking Experience',
  description: 'The most intuitive and powerful scheduling platform for beauty & wellness professionals. Lightning-fast setup, smart automation, and always free. Transform your booking experience today.',
  keywords: 'beauty booking, appointment scheduling, salon software, beauty professionals, wellness booking, free scheduling app',
  openGraph: {
    title: 'BuukEasy - Simplifying Your Booking Experience',
    description: 'Lightning-fast setup, smart automation, and always free. Transform your booking experience today.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuukEasy - Simplifying Your Booking Experience',
    description: 'Lightning-fast setup, smart automation, and always free. Transform your booking experience today.',
  },
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}