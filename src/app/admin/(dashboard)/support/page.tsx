'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageSquarePlus, LifeBuoy, Send, Clock, User, ShieldCheck } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const { user } = useUserStore();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tickets');
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
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Ticket created successfully!');
        setIsNewTicketOpen(false);
        setFormData({ subject: '', description: '', priority: 'medium' });
        fetchTickets();
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (e) {
      toast.error('Error creating ticket');
    }
  };

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

  const handleCloseTicket = async () => {
    if (!confirm('Are you sure you want to mark this ticket as resolved?')) return;
    try {
      const res = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        toast.success('Ticket resolved');
        const data = await res.json();
        setSelectedTicket(data.data);
        fetchTickets();
      }
    } catch (e) {
      toast.error('Failed to resolve ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <LifeBuoy className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Help & Support</h1>
            <p className="text-gray-500 text-sm">Raise issues and get help from our support team</p>
          </div>
        </div>
        <Button onClick={() => setIsNewTicketOpen(true)} className="gap-2 bg-brand-primary text-white rounded-xl h-11 px-6">
          <MessageSquarePlus className="w-4 h-4" />
          Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <p className="text-center text-gray-500 p-8">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
            <LifeBuoy className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Tickets Yet</h3>
            <p className="text-gray-500 mb-6">If you are facing any issues, feel free to create a ticket.</p>
            <Button onClick={() => setIsNewTicketOpen(true)} variant="outline">Create your first ticket</Button>
          </div>
        ) : (
          tickets.map(ticket => (
            <Card key={ticket._id} onClick={() => setSelectedTicket(ticket)} className="cursor-pointer hover:border-brand-primary/50 transition-colors border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-800 text-lg truncate">{ticket.subject}</span>
                      <Badge className={`${getStatusColor(ticket.status)} border-none shadow-none uppercase text-[10px] font-bold px-2 py-0.5`}>
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className="uppercase text-[10px] text-gray-500">{ticket.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{ticket.ticketId} • Created on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0 text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4" />
                    {ticket.replies?.length || 0} Replies
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Ticket Modal */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Describe your issue in detail. Our team will respond shortly.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="flex flex-col gap-5 pt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
              <Input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g., Unable to generate E-Way Bill" className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Priority</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Urgent)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
              <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Please describe the issue..." className="h-32 rounded-xl resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
              <Button type="button" variant="outline" onClick={() => setIsNewTicketOpen(false)} className="h-12 px-6 rounded-xl font-semibold">Cancel</Button>
              <Button type="submit" className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 px-8 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">Submit Ticket</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details/Chat Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          {selectedTicket && (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-brand-primary">{selectedTicket.ticketId}</span>
                    <Badge className={`${getStatusColor(selectedTicket.status)} border-none shadow-none uppercase text-[10px] font-bold px-2 py-0.5`}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h2>
                </div>
                {selectedTicket.status !== 'resolved' && (
                  <Button variant="outline" size="sm" onClick={handleCloseTicket} className="text-green-600 border-green-200 hover:bg-green-50">
                    Mark as Resolved
                  </Button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {selectedTicket.replies?.map((reply: any, idx: number) => {
                  const isMine = reply.sender === user?.role || (reply.sender === 'branch' && user?.role === 'branch_user');
                  return (
                    <div key={idx} className={`flex flex-col max-w-[85%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1 mx-1">
                        {isMine ? (
                          <>
                            <span className="text-[10px] text-gray-400 font-medium">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="text-xs font-bold text-gray-600">You</span>
                            <User className="w-3.5 h-3.5 text-gray-400" />
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                            <span className="text-xs font-bold text-brand-primary">Support Team</span>
                            <span className="text-[10px] text-gray-400 font-medium">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </>
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${isMine ? 'bg-brand-primary text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                        {reply.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedTicket.status !== 'resolved' ? (
                <div className="p-4 border-t border-gray-100 bg-white flex gap-3 items-center">
                  <Input 
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-brand-primary h-11 px-4"
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  />
                  <Button onClick={handleSendReply} className="rounded-full w-11 h-11 p-0 shrink-0 bg-brand-primary text-white hover:bg-brand-primary-dark">
                    <Send className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                  <p className="text-sm font-medium text-gray-500">This ticket has been resolved and closed.</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
