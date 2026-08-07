import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Trust Logistic - #1 Transport Management Software in India",
    template: "%s | Trust Logistic"
  },
  description: "Trust Logistic is India's most powerful, user-friendly Transport Management System (TMS) and Logistics Software. Manage bookings, fleet, e-way bills, and branch accounting easily.",
  keywords: ["Logistics Software India", "Transport Management System", "TMS", "Fleet Tracking", "GST E-way Bill", "Branch Accounting"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://trustlogistic.in",
    title: "Trust Logistic - #1 Transport Management Software in India",
    description: "Trust Logistic is India's most powerful, user-friendly Transport Management System (TMS).",
    siteName: "Trust Logistic"
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust Logistic - #1 Transport Management Software in India",
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
      <body className={`min-h-full flex flex-col ${plusJakartaSans.className}`}>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
