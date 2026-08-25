import { Metadata } from 'next';
import ClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Trust Logistic - India\'s Transport Management System & Online Bilty Maker',
  description: 'Trust Logistic is a cloud-based logistics software designed for transporters, fleet owners, and brokers in India. Generate Online Bilty, LR, E-way Bills, and manage Branch Accounting seamlessly.',
  keywords: [
    'Online Bilty Maker',
    'Lorry Receipt Software India',
    'Transport Management System',
    'Best Logistics Software in Gujarat',
    'Transport Accounting Software',
    'FTL PTL Transport Software',
    'Fleet Management System India',
    'Automated E-way Bill Generation',
    'GST Billing Software for Transporters'
  ],
  alternates: {
    canonical: 'https://trustlogistic.in',
  }
};

export default function Page() {
  return <ClientPage />;
}
