import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movie Mondays',
  description: 'Intelligent movie recommendations with streaming availability in the UK',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold">Movie Mondays</h1>
            <p className="text-sm text-gray-600">Find movies you will love, available on your services.</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}


