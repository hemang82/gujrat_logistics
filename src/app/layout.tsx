import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trustlogistic.in'),
  title: {
    default: 'Trust Logistic | Transport Management Software in India',
    template: '%s | Trust Logistic',
  },
  description:
    'Transport management software for Indian transporters, fleet owners and brokers. Manage digital LR / Bilty, Lorry Challans, Crossing Memos, GSP E-Way Bills, fleets and branch accounting.',
  keywords: [
    'Trust Logistic',
    'Transport Management Software India',
    'Transport Management System',
    'LR Bilty Software',
    'Lorry Challan Software',
    'GSP E-Way Bill Software',
    'Fleet Management Software',
    'Transport Accounting Software',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://trustlogistic.in/',
    title: 'Trust Logistic | Transport Management Software in India',
    description:
      'Unify LR / Bilty booking, Lorry Challans, Crossing Memos, GSP E-Way Bills, fleet tracking and branch accounting for Indian transporters.',
    siteName: 'Trust Logistic',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust Logistic | Transport Management Software in India',
    description:
      'Transport management software built for Indian transporters, fleet owners and transport brokers.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        {/* Google Analytics (Firebase Measurement ID) */}
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=G-H8TZXFDCWC`} />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-H8TZXFDCWC', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={`min-h-full flex flex-col font-sans ${plusJakartaSans.variable} ${plusJakartaSans.className}`}>
        <NextTopLoader
          color="#0F766E"
          initialPosition={0.15}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0F766E, 0 0 5px #0F766E"
        />
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
