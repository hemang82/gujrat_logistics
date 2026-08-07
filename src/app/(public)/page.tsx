import { Metadata } from 'next';
import ClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Trust Logistic - India\'s #1 Transport Management System',
  description: 'Trust Logistic is a cloud-based logistics software designed for transporters, fleet owners, and freight forwarders across India to manage bookings, accounts, and e-way bills.',
  alternates: {
    canonical: 'https://trustlogistic.in',
  }
};

export default function Page() {
  return <ClientPage />;
}
