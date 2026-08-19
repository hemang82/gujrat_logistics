import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

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

  let shouldRedirect = false;
  let redirectUrl = '';

  try {
    await connectToDatabase();
    const userId = (session.user as any).id;
    if (!userId) {
      shouldRedirect = true;
      redirectUrl = '/admin/login';
    } else {
      const dbUser = await User.findById(userId).select('isActive logisticId role').lean() as any;
      if (!dbUser || dbUser.isActive === false) {
        shouldRedirect = true;
        redirectUrl = '/admin/login?error=deactivated_user';
      } else if ((session.user as any).role !== 'superadmin' && dbUser.logisticId) {
        const parentLogistic = await User.findById(dbUser.logisticId).select('isActive').lean() as any;
        if (parentLogistic && parentLogistic.isActive === false) {
          shouldRedirect = true;
          redirectUrl = '/admin/login?error=deactivated_company';
        }
      }
    }
  } catch (err: any) {
    console.error("Layout auth validation check error:", err);
    // Don't redirect on Next.js internal redirect error
    if (err?.message !== 'NEXT_REDIRECT') {
      shouldRedirect = true;
      redirectUrl = '/admin/login?error=system_error';
    }
  }

  if (shouldRedirect) {
    redirect(redirectUrl);
  }

  return (
    <AdminLayoutWrapper user={session?.user}>
      {children}
    </AdminLayoutWrapper>
  );
}
