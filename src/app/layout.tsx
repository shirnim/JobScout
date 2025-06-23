import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/firebase/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'JobScout',
  description: 'Find your next opportunity',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adSensePublisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  return (
    <html lang="en" className="light" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {adSensePublisherId && adSensePublisherId !== 'ca-pub-XXXXXXXXXXXXXXXX' && (
            <Script
                id="adsense-script"
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSensePublisherId}`}
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />
        )}
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
