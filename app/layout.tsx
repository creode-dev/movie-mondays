import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Logo from '@/components/Logo';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Movie Mondays',
  description: 'Intelligent movie recommendations with streaming availability in the UK',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen bg-gradient-dark`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-4 flex justify-center pb-3">
            <Logo />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}


