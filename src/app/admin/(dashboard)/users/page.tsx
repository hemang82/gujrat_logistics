'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, MapPin, User as UserIcon, Eye, X } from 'lucide-react';
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
  const [viewUser, setViewUser] = useState<any | null>(null);

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
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/admin/users/new" className="w-full sm:w-auto">
            <Button className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full sm:w-auto px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add Login
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
                  <th className="px-4 py-3 font-semibold w-20 text-center">Sr. No.</th>
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
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading branch logins...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <UserIcon className="w-8 h-8 text-gray-300" />
                        <p>No branch logins found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, index) => (
                    <tr key={u._id} className="hover:bg-brand-primary/5 transition-colors group">
                      <td className="px-4 py-3 text-center text-gray-500 font-bold">{index + 1}</td>
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg"
                            onClick={() => setViewUser(u)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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

      {/* View Details Dialog */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl border-0 shadow-2xl bg-white overflow-hidden rounded-2xl">
            <div className="bg-brand-primary p-6 text-white flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{viewUser.name}</h3>
                <p className="text-xs text-brand-primary-light uppercase tracking-wider font-semibold">
                  {viewUser.role === 'manager' ? 'Branch Manager' : viewUser.role === 'admin' ? 'Administrator' : 'Branch User / Staff'}
                </p>
              </div>
              <button 
                onClick={() => setViewUser(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email / Login ID</p>
                  <p className="text-sm font-semibold text-gray-900 break-all font-mono">{viewUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Password</p>
                  <p className="text-sm font-bold text-gray-900 font-mono bg-gray-50 px-2.5 py-1 rounded border border-gray-100 w-fit">
                    {viewUser.plainPassword || '•••••••• (Unchanged)'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-semibold text-gray-900">{viewUser.phone || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assigned Branch</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {viewUser.branch ? viewUser.branch.name : '-'}
                  </p>
                </div>
                {viewUser.branch && (
                  <>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Branch Code</p>
                      <p className="text-sm font-semibold text-gray-900 font-mono">{viewUser.branch.code || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pincode</p>
                      <p className="text-sm font-semibold text-gray-900 font-mono">{viewUser.branch.pincode || '-'}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">City & State</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {viewUser.branch.city ? `${viewUser.branch.city}, ` : ''}{viewUser.branch.state || '-'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Module Permissions */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Module Permissions</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-2.5 pl-3 text-gray-500">Module Name</th>
                        <th className="p-2.5 text-center text-gray-500">View</th>
                        <th className="p-2.5 text-center text-gray-500">Add</th>
                        <th className="p-2.5 text-center text-gray-500">Edit</th>
                        <th className="p-2.5 text-center text-gray-500">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-gray-700">Bookings & LR</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.bookings?.canView ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.bookings?.canAdd ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.bookings?.canEdit ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.bookings?.canDelete ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 pl-3 font-semibold text-gray-700">Challans & Lorry Hire</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.challans?.canView ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.challans?.canAdd ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.challans?.canEdit ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                        <td className="p-2.5 text-center font-bold">{viewUser.permissions?.challans?.canDelete ? <span className="text-emerald-600">ON</span> : <span className="text-gray-300">OFF</span>}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button 
                  onClick={() => setViewUser(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 rounded-lg text-sm h-10 border border-gray-200"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
