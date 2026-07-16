'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, User, Phone, MapPin, Mail, Sparkles, AlertCircle, Pencil, Trash2, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AgentList({ initialAgents }: { initialAgents: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [agents, setAgents] = useState(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.phone && a.phone.includes(search)) ||
    (a.agentType && a.agentType.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const res = await fetch(`/api/admin/agents/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Agent deleted successfully');
        setAgents(prev => prev.filter(a => a._id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete agent');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">Agent Master</h1>
          <p className="text-brand-text-secondary mt-1">Manage transport agents, local brokers, and custom commission partners.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl bg-white">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search agents by name, type, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-transparent focus:bg-white transition-colors rounded-xl text-sm"
            />
          </div>
          <Link href="/admin/agents/new" className="w-full sm:w-auto">
            <Button
              className="h-11 rounded-xl bg-brand-primary text-white font-bold w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-brand-primary/95 transition-colors"
            >
              <Plus className="w-5 h-5" /> Add New Agent
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                  <th className="font-semibold p-4">Agent Name</th>
                  <th className="font-semibold p-4">Agent Type</th>
                  <th className="font-semibold p-4">Contact Detail</th>
                  <th className="font-semibold p-4">Address</th>
                  <th className="font-semibold p-4 text-right">Opening Balance</th>
                  <th className="font-semibold p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center py-4">
                        <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm">No agents found. Click "Add New Agent" to create one.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent: any) => (
                    <tr key={agent._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="p-4 font-semibold text-brand-text-primary">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span>{agent.name}</span>
                            {agent.gstNumber && <span className="text-[10px] text-gray-400 font-normal tracking-wide mt-0.5">GST: {agent.gstNumber}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          agent.agentType === 'Transporter'
                            ? 'bg-blue-50 text-blue-700'
                            : agent.agentType === 'Dalal'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {agent.agentType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                          {agent.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" /> {agent.phone}
                            </span>
                          )}
                          {agent.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-gray-400" /> {agent.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-gray-600">
                        {agent.address || '-'}
                      </td>
                      <td className="p-4 text-right font-semibold text-brand-text-primary">
                        ₹{(agent.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedAgent(agent)}
                            className="h-8 w-8 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600" 
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Link href={`/admin/agents/${agent._id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(agent._id)}
                            className="h-8 w-8 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedAgent.name}</h2>
                  <p className="text-xs font-semibold text-gray-500">{selectedAgent.agentType}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Number</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedAgent.phone || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedAgent.email || '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Opening Balance</span>
                  <div className="text-sm font-semibold text-gray-700">
                    ₹{(selectedAgent.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GST Number</span>
                  <div className="text-sm font-semibold text-gray-700">
                    {selectedAgent.gstNumber || '-'}
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Address</span>
                <div className="flex items-start gap-2 text-sm font-semibold text-gray-700 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">{selectedAgent.address || 'No address provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <Link href={`/admin/agents/${selectedAgent._id}/edit`}>
                <Button variant="outline" className="h-9 px-4 text-sm font-medium">Edit Agent</Button>
              </Link>
              <Button onClick={() => setSelectedAgent(null)} className="h-9 px-4 text-sm font-medium bg-brand-primary hover:bg-brand-secondary text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
