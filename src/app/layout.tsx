import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Trust Logistic - Transport Management Software in India",
    template: "%s | Trust Logistic"
  },
  description: "Trust Logistic is India's most powerful, user-friendly Transport Management System (TMS) and Logistics Software. Manage bookings, fleet, e-way bills, and branch accounting easily.",
  keywords: ["Logistics Software India", "Transport Management System", "TMS", "Fleet Tracking", "GST E-way Bill", "Branch Accounting"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://trustlogistic.in",
    title: "Trust Logistic - Transport Management Software in India",
    description: "Trust Logistic is India's most powerful, user-friendly Transport Management System (TMS).",
    siteName: "Trust Logistic"
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust Logistic - Transport Management Software in India",
    description: "Trust Logistic is India's most powerful, user-friendly Transport Management System (TMS).",
  },
  icons: {
    icon: '/logo_icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
      <body className={`min-h-full flex flex-col ${plusJakartaSans.className}`}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
