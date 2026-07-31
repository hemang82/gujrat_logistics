'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, MapPin, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useUserStore } from '@/store/useUserStore';

export default function UsersPage() {
  const { user } = useUserStore();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/users?search=${search}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleDelete = async () => {
    if (!deleteUserId) return;
    
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('Branch login deleted successfully');
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete branch login');
      }
    } catch (error) {
      toast.error('An error occurred while deleting');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'branch': return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 rounded-md border border-green-200">Branch User</span>;
      case 'admin': return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-purple-100 text-purple-700 rounded-md border border-purple-200">Admin</span>;
      case 'manager': return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 rounded-md border border-blue-200">Manager</span>;
      default: return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-700 rounded-md border border-gray-200">{role}</span>;
    }
  };

  return (
    <div className="w-full pb-8">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Branch Logins</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage system access for branches</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/users/new">
            <Button className="h-10 px-4 rounded-xl shadow-sm text-sm font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Login</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="p-3.5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search branch logins by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full text-sm rounded-lg border border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary outline-none transition-all"
            />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name & Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Assigned Branch</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading branch logins...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <UserIcon className="w-8 h-8 text-gray-300" />
                        <p>No branch logins found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-brand-primary/5 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
                            {u.name}
                          </span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="px-4 py-3">
                        {u.branch ? (
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium text-xs">{u.branch.name}</span>
                            <span className="text-gray-400 text-[10px]">({u.branch.code})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No branch assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{u.phone || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/users/${u._id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            onClick={() => {
                              setDeleteUserId(u._id);
                              setIsDeleteDialogOpen(true);
                            }}
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

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteUserId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Branch Login"
        description="Are you sure you want to delete this branch login? This action cannot be undone."
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
}
