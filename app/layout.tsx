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
  title: {
    default: 'Movie Mondays - Discover Your Next Favourite Film',
    template: '%s | Movie Mondays',
  },
  description: 'AI-powered movie recommendations tailored to your taste. Discover arthouse films, hidden gems, and cinematic masterpieces available on your UK streaming services. Filter by ratings, runtime, directors, and more.',
  keywords: ['movie recommendations', 'film suggestions', 'streaming movies UK', 'arthouse cinema', 'film discovery', 'movie finder', 'Netflix', 'Prime Video', 'Disney Plus', 'Mubi', 'BFI Player'],
  authors: [{ name: 'Movie Mondays' }],
  creator: 'Movie Mondays',
  publisher: 'Movie Mondays',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://movie-mondays.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: '/',
    siteName: 'Movie Mondays',
    title: 'Movie Mondays - Discover Your Next Favourite Film',
    description: 'AI-powered movie recommendations tailored to your taste. Discover arthouse films, hidden gems, and cinematic masterpieces available on your UK streaming services.',
    images: [
      {
        url: '/movie-mondays-logo-landscape.svg',
        width: 1200,
        height: 630,
        alt: 'Movie Mondays - Intelligent Movie Recommendations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Movie Mondays - Discover Your Next Favourite Film',
    description: 'AI-powered movie recommendations tailored to your taste. Discover arthouse films, hidden gems, and cinematic masterpieces.',
    images: ['/movie-mondays-logo-landscape.svg'],
    creator: '@moviemondays',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans min-h-screen bg-gradient-dark`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-4 flex flex-col items-center gap-4 pb-3">
            <Logo />
            <nav className="flex gap-6 text-sm">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Search</a>
              <a href="/favourites" className="text-gray-300 hover:text-white transition-colors">My Favourites</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}


