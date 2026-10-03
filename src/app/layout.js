import './globals.css';
import Script from 'next/script';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import GourmetSplashLoader from '@/components/GourmetSplashLoader';

export const metadata = {
  title: 'Saffron & Spice Bistro | Dine-In QR Ordering',
  description: 'Scan table QR code, browse mouthwatering dishes, customize, and order instantly from your seat.',
  keywords: ['restaurant', 'QR menu', 'dine-in ordering', 'food delivery', 'contactless menu', 'Razorpay food ordering', 'PWA restaurant app'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Saffron & Spice',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ea580c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Saffron & Spice" />
        <meta name="apple-mobile-web-app-title" content="Saffron & Spice" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <GourmetSplashLoader />
        {children}
        <PWAInstallPrompt />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        {/* Register Service Worker for PWA */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('✅ PWA ServiceWorker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('PWA ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
