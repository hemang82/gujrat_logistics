'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Check, X, Search, Package, FileText, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type MasterItem = {
  _id: string;
  name: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
};

type TabType = 'packaging' | 'description';

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('packaging');
  const [items, setItems] = useState<MasterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/masters?type=${activeTab}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setItems(data || []);
    } catch {
      toast.error('Could not load masters');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error('Please enter a name');
    setIsAdding(true);
    try {
      const res = await fetch('/api/admin/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to add');
      toast.success(`${activeTab === 'packaging' ? 'Packaging' : 'Description'} added!`);
      setNewName('');
      fetchItems();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return toast.error('Name cannot be empty');
    try {
      const res = await fetch(`/api/admin/masters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, name: editName.trim() }),
      });
      if (!res.ok) return toast.error('Failed to update');
      toast.success('Updated successfully!');
      setEditId(null);
      fetchItems();
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/masters/${deleteId}?type=${activeTab}`, { method: 'DELETE' });
      if (!res.ok) return toast.error('Failed to delete');
      toast.success('Deleted successfully!');
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { key: 'packaging' as TabType, label: 'Packaging Types', icon: Package, desc: 'e.g. Bora, Box, Bundle, Bag' },
    { key: 'description' as TabType, label: 'Item Descriptions', icon: FileText, desc: 'e.g. Cotton, Rice, Chemicals' },
  ];

  return (
    <div className="w-full pb-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Masters</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage packaging types and item descriptions for booking form</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch(''); setNewName(''); setEditId(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-brand-primary text-white border-brand-primary shadow-sm shadow-brand-primary/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary/40 hover:text-brand-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Add + Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-2 flex-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={activeTab === 'packaging' ? 'Add new packaging (e.g. Bora, Box...)' : 'Add new description (e.g. Cotton, Rice...)'}
                className="h-10 rounded-lg border-gray-200 text-sm flex-1"
              />
              <Button
                onClick={handleAdd}
                disabled={isAdding || !newName.trim()}
                className="h-10 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 h-10 rounded-lg border-gray-200 text-sm w-full"
              />
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {activeTab === 'packaging' ? <Package className="w-6 h-6 text-gray-400" /> : <FileText className="w-6 h-6 text-gray-400" />}
              </div>
              <p className="text-sm font-semibold text-gray-500">No {activeTab === 'packaging' ? 'packaging types' : 'item descriptions'} found</p>
              <p className="text-xs text-gray-400 mt-1">Add one above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Name</div>
                <div className="col-span-2 text-center">Used</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {items.map((item, idx) => (
                <div key={item._id} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-1 text-xs text-gray-400 font-medium">{idx + 1}</div>
                  <div className="col-span-7">
                    {editId === item._id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEdit(item._id);
                          if (e.key === 'Escape') setEditId(null);
                        }}
                        className="h-8 text-sm rounded-lg border-brand-primary/50 focus-visible:ring-brand-primary"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.usageCount}×
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {editId === item._id ? (
                      <>
                        <button onClick={() => handleEdit(item._id)} className="p-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditId(null)} className="p-1.5 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditId(item._id); setEditName(item.name); }}
                          className="p-1.5 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(item._id); setDeleteName(item.name); }}
                          className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Count footer */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 font-medium">{items.length} {activeTab === 'packaging' ? 'packaging types' : 'item descriptions'} total</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl shadow-xl border-none">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Delete Entry?</DialogTitle>
            <DialogDescription className="text-center text-sm mt-2">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteName}"</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6 border-t border-gray-100 pt-5">
            <Button variant="outline" className="flex-1 h-11" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" className="flex-1 h-11" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
