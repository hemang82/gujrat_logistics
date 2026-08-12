'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Calendar, Trash2, Edit2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if (res.ok) setAnnouncements(data.data);
    } catch (e) {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openModal = (announcement: any = null) => {
    if (announcement) {
      setEditingId(announcement._id);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        isActive: announcement.isActive,
        startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
        endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', message: '', type: 'info', isActive: true, startDate: '', endDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : '/api/admin/announcements';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(editingId ? 'Announcement updated' : 'Announcement created');
        setIsModalOpen(false);
        fetchAnnouncements();
      } else {
        toast.error('Failed to save announcement');
      }
    } catch (e) {
      toast.error('Error saving announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Announcement deleted');
        fetchAnnouncements();
      }
    } catch (e) {
      toast.error('Failed to delete announcement');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        toast.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchAnnouncements();
      }
    } catch (e) {
      toast.error('Failed to toggle status');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Broadcast Announcements</h1>
            <p className="text-gray-500 text-sm">Send global alerts to all logistics and branch panels</p>
          </div>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full sm:w-auto px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <p className="text-center text-gray-500 p-8">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center">
            <Megaphone className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Announcements</h3>
            <p className="text-gray-500 mb-6">Create your first broadcast message to alert your users.</p>
            <Button onClick={() => openModal()} variant="outline">Create Announcement</Button>
          </div>
        ) : (
          announcements.map(ann => (
            <Card key={ann._id} className={`border ${getTypeColors(ann.type)} shadow-sm rounded-xl overflow-hidden`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row justify-between p-5 gap-4">
                  <div className="flex-1 flex gap-4">
                    <div className="mt-1">{getTypeIcon(ann.type)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{ann.title}</h3>
                        {!ann.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{ann.message}</p>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        {ann.startDate || ann.endDate ? (
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border shadow-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            {ann.startDate ? new Date(ann.startDate).toLocaleDateString() : 'Always'} 
                            {' - '} 
                            {ann.endDate ? new Date(ann.endDate).toLocaleDateString() : 'Forever'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border shadow-sm">
                            <Calendar className="w-3.5 h-3.5" /> No expiry (Manual)
                          </span>
                        )}
                        <span>Created: {new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-200/50 pt-4 md:pt-0 md:pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">{ann.isActive ? 'Active' : 'Hidden'}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={ann.isActive} onChange={() => toggleStatus(ann._id, ann.isActive)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                      </label>
                    </div>
                    <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                    <Button variant="ghost" size="icon" onClick={() => openModal(ann)} className="text-gray-500 hover:text-brand-primary">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ann._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Title</label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Scheduled Maintenance" className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
              <Textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Announcement details..." className="h-28 rounded-xl resize-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Alert Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Orange)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                <div className="h-11 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Date (Optional)</label>
                <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">End Date (Optional)</label>
                <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-12 px-6 rounded-xl font-semibold">Cancel</Button>
              <Button type="submit" className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 px-8 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
                {editingId ? 'Update' : 'Publish'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
