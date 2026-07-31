import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper';

export const metadata = {
  title: 'Admin Portal - Trust Logistic',
  description: 'Internal Management System for Trust Logistic',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminLayoutWrapper user={session?.user}>
      {children}
    </AdminLayoutWrapper>
  );
}
