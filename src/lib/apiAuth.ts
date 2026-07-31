import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Returns a MongoDB query object to filter records by the current user's logistic company.
 * If the user is a superadmin, returns an empty object (no filter).
 */
export async function getLogisticQuery(request?: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const user = session.user as any;

  if (user.role === 'superadmin') {
    if (request) {
      const url = new URL(request.url);
      const logisticId = url.searchParams.get('logisticId');
      if (logisticId) {
        return { logisticId };
      }
    }
    return {}; // Can see everything
  }

  if (user.role === 'logistic') {
    return { logisticId: user.id };
  }

  if (user.logisticId) {
    return { logisticId: user.logisticId };
  }

  return null; // Unauthorized or unknown role
}

/**
 * Returns the logisticId to be assigned to a new record.
 * Throws an error if the user is not associated with a logistic.
 */
export async function getLogisticIdForCreate(bodyLogisticId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error('Unauthorized');

  const user = session.user as any;

  if (user.role === 'superadmin') {
    if (!bodyLogisticId) {
      // Superadmin creating something globally? Usually they don't, but let's allow or return null
      return null;
    }
    return bodyLogisticId;
  }

  if (user.role === 'logistic') {
    return user.id;
  }

  if (user.logisticId) {
    return user.logisticId;
  }

  throw new Error('No logistic context found for user');
}
