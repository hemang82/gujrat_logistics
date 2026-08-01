import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Agent from '@/models/Agent';
import AgentList from '@/components/admin/AgentList';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const session = await getServerSession(authOptions);
  await connectToDatabase();
  Agent.init();

  let query: any = { isDeleted: false };
  if (session && (session.user as any).role === 'logistic') {
    query.logisticId = (session.user as any).id;
  } else if (session && (session.user as any).logisticId) {
    query.logisticId = (session.user as any).logisticId;
  }

  const agents = await Agent.find(query).sort({ name: 1 }).lean();

  const serializedAgents = agents.map((agent: any) => ({
    ...agent,
    _id: agent._id.toString(),
    createdBy: agent.createdBy?.toString() || null,
    createdAt: agent.createdAt?.toISOString() || null,
    updatedAt: agent.updatedAt?.toISOString() || null
  }));

  return <AgentList initialAgents={serializedAgents} />;
}
