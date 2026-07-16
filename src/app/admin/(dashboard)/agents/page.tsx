import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Agent from '@/models/Agent';
import AgentList from '@/components/admin/AgentList';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  await getServerSession(authOptions);
  await connectToDatabase();
  Agent.init();

  const agents = await Agent.find({ isDeleted: false }).sort({ name: 1 }).lean();

  const serializedAgents = agents.map((agent: any) => ({
    ...agent,
    _id: agent._id.toString(),
    createdBy: agent.createdBy?.toString() || null,
    createdAt: agent.createdAt?.toISOString() || null,
    updatedAt: agent.updatedAt?.toISOString() || null
  }));

  return <AgentList initialAgents={serializedAgents} />;
}
