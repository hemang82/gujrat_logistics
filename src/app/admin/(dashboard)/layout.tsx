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

// 60-second in-memory cache to prevent redundant remote DB round-trips on every page navigation
const userActiveCache = new Map<string, { isActive: boolean; parentActive: boolean; expiresAt: number }>();

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
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (!userId) {
      shouldRedirect = true;
      redirectUrl = '/admin/login';
    } else {
      const now = Date.now();
      const cached = userActiveCache.get(userId);

      if (cached && now < cached.expiresAt) {
        if (!cached.isActive) {
          shouldRedirect = true;
          redirectUrl = '/admin/login?error=deactivated_user';
        } else if (!cached.parentActive) {
          shouldRedirect = true;
          redirectUrl = '/admin/login?error=deactivated_company';
        }
      } else {
        await connectToDatabase();
        const dbUser = await User.findById(userId).select('isActive logisticId role').lean() as any;

        if (!dbUser || dbUser.isActive === false) {
          userActiveCache.set(userId, { isActive: false, parentActive: true, expiresAt: now + 10000 });
          shouldRedirect = true;
          redirectUrl = '/admin/login?error=deactivated_user';
        } else {
          let parentActive = true;
          if (userRole !== 'superadmin' && dbUser.logisticId) {
            const parentLogistic = await User.findById(dbUser.logisticId).select('isActive').lean() as any;
            if (parentLogistic && parentLogistic.isActive === false) {
              parentActive = false;
              shouldRedirect = true;
              redirectUrl = '/admin/login?error=deactivated_company';
            }
          }
          userActiveCache.set(userId, { isActive: true, parentActive, expiresAt: now + 60000 });
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
