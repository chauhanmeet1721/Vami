import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppBackground } from '@/components/atomic/atoms/app-background';
import './globals.css';
import { Providers } from './providers';

/**
 * Inter is a modern, highly legible typeface used by Linear, Vercel, and Notion.
 * Using next/font/google ensures zero layout shift and self-hosting (no external requests).
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Vami — Connect with anyone, anywhere',
    template: '%s | Vami',
  },
  description: 'Vami is a real-time chat platform built for modern teams.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
};

/**
 * Root Layout — stays a React Server Component.
 * All client providers are isolated in <Providers> ('use client' boundary).
 * This is the recommended Next.js App Router pattern.
 *
 * AppBackground provides the signature hardware-accelerated ambient
 * chat pattern wallpaper persistently across every page in the application.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <body className="relative h-full font-sans antialiased text-zinc-900 dark:text-zinc-50" suppressHydrationWarning>
        <AppBackground />
        <Providers>
          <div className="relative z-10 h-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
