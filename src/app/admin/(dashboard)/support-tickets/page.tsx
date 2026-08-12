'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Send, User, ShieldCheck, Headphones, Filter, Building2, Search } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function SuperAdminSupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useUserStore();

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === 'all' ? '/api/tickets' : `/api/tickets?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setTickets(data.data);
    } catch (e) {
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.data);
        setReplyMessage('');
        fetchTickets();
      }
    } catch (e) {
      toast.error('Failed to send reply');
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Ticket marked as ${newStatus}`);
        const data = await res.json();
        setSelectedTicket(data.data);
        fetchTickets();
      }
    } catch (e) {
      toast.error('Failed to update ticket status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
            <Headphones className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Support Helpdesk</h1>
            <p className="text-gray-500 text-sm">Manage and resolve client issues across the platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
          <Button variant={statusFilter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}>
            All
          </Button>
          <Button variant={statusFilter === 'open' ? 'default' : 'ghost'} size="sm" onClick={() => setStatusFilter('open')} className={statusFilter === 'open' ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100' : 'text-gray-500'}>
            Open
          </Button>
          <Button variant={statusFilter === 'in-progress' ? 'default' : 'ghost'} size="sm" onClick={() => setStatusFilter('in-progress')} className={statusFilter === 'in-progress' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-500'}>
            In Progress
          </Button>
          <Button variant={statusFilter === 'resolved' ? 'default' : 'ghost'} size="sm" onClick={() => setStatusFilter('resolved')} className={statusFilter === 'resolved' ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' : 'text-gray-500'}>
            Resolved
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <p className="text-center text-gray-500 p-8">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Tickets Found</h3>
            <p className="text-gray-500">There are no {statusFilter !== 'all' ? statusFilter : ''} support tickets at the moment.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <Card key={ticket._id} onClick={() => setSelectedTicket(ticket)} className="cursor-pointer hover:border-amber-500/50 transition-colors border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-bold text-gray-800 text-lg truncate">{ticket.subject}</span>
                      <Badge variant="outline" className={`${getStatusColor(ticket.status)} uppercase text-[10px] font-bold px-2 py-0.5`}>
                        {ticket.status}
                      </Badge>
                      {ticket.priority === 'high' && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 uppercase text-[10px] shadow-none">Urgent</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="font-medium text-amber-600">{ticket.ticketId}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {ticket.logisticId?.companyName || ticket.logisticId?.name}</span>
                      {ticket.branchId && <span>Branch: {ticket.branchId.name}</span>}
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                      {ticket.replies?.length || 0} Messages
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Details/Chat Modal for Super Admin */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-gray-50">
          {selectedTicket && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-amber-600">{selectedTicket.ticketId}</span>
                      <Badge variant="outline" className={`${getStatusColor(selectedTicket.status)} uppercase text-[10px] font-bold px-2 py-0.5`}>
                        {selectedTicket.status}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">from <strong>{selectedTicket.logisticId?.companyName || selectedTicket.logisticId?.name}</strong></span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedTicket.subject}</h2>
                  </div>
                </div>
                
                {/* Admin Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 mr-2">Admin Actions:</span>
                  {selectedTicket.status !== 'open' && (
                    <Button variant="outline" size="sm" onClick={() => handleChangeStatus('open')} className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50">
                      Re-open
                    </Button>
                  )}
                  {selectedTicket.status !== 'in-progress' && (
                    <Button variant="outline" size="sm" onClick={() => handleChangeStatus('in-progress')} className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                      Mark In-Progress
                    </Button>
                  )}
                  {selectedTicket.status !== 'resolved' && (
                    <Button variant="outline" size="sm" onClick={() => handleChangeStatus('resolved')} className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50">
                      Resolve & Close
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.replies?.map((reply: any, idx: number) => {
                  const isMine = reply.sender === 'superadmin';
                  return (
                    <div key={idx} className={`flex flex-col max-w-[85%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1 mx-1">
                        {isMine ? (
                          <>
                            <span className="text-[10px] text-gray-400 font-medium">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="text-xs font-bold text-gray-600">Super Admin</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-600 capitalize">{reply.sender}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </>
                        )}
                      </div>
                      <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-amber-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                        {reply.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== 'resolved' ? (
                <div className="p-4 border-t border-gray-200 bg-white flex gap-3 items-center">
                  <Input 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Type your official reply..."
                    className="flex-1 rounded-full bg-gray-50 border-gray-300 focus-visible:ring-amber-500 h-12 px-5 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  />
                  <Button onClick={handleSendReply} className="rounded-full w-12 h-12 p-0 shrink-0 bg-amber-600 text-white hover:bg-amber-700 shadow-md">
                    <Send className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-200 bg-green-50 text-center">
                  <p className="text-sm font-semibold text-green-700">This ticket is resolved. You can re-open it from the actions above.</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
