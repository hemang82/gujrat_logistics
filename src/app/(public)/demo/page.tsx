import { Metadata } from 'next';
import ClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Request a Demo - Trust Logistic',
  description: 'Request a free demo of Trust Logistic today and see how our Transport Management System can transform your business.',
  alternates: {
    canonical: 'https://trustlogistic.in/demo',
  }
};

export default function Page() {
  return <ClientPage />;
}
