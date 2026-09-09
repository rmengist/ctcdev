import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Feeding Brennen',
  description: 'Track restaurants, visits, and spending.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-blue-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <span className="font-display text-xl font-bold text-blue-950">
              Feeding Brennen
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Food diary
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
          {children}
        </main>

        <footer className="mt-12 border-t border-blue-100 bg-white/70">
          <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-500">
            Restaurants, visits, and Brennen&apos;s favorites.
          </div>
        </footer>
      </body>
    </html>
  );
}