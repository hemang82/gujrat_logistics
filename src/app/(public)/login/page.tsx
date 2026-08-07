import { Metadata } from 'next';
import ClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Login - Trust Logistic Workspace',
  description: 'Securely login to your Trust Logistic workspace to manage your transport operations.',
  alternates: {
    canonical: 'https://trustlogistic.in/login',
  }
};

export default function Page() {
  return <ClientPage />;
}
