'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, MapPin, User as UserIcon, Eye, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useUserStore } from '@/store/useUserStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function UsersPage() {
  const { user } = useUserStore();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);

  const handleCopyCredentials = () => {
    if (!viewUser) return;
    const text = `Login Email: ${viewUser.email}\nPassword: ${viewUser.plainPassword || '••••••••'}`;
    navigator.clipboard.writeText(text);
    toast.success('Email and Password copied to clipboard!');
  };

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
        
        // Soft delete: filter locally
        setUsers(prev => prev.filter(user => user._id !== deleteUserId));
        
        // Silent refresh in background
        const silentRes = await fetch(`/api/admin/users?search=${search}&limit=50`);
        if (silentRes.ok) {
          const silentData = await silentRes.json();
          setUsers(silentData.users || []);
        }
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

      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-brand-primary" />
              Branch Login Details
            </DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 border border-brand-primary/20 overflow-hidden">
                  <UserIcon className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewUser.name}</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                    {viewUser.role === 'manager' ? 'Branch Manager' : viewUser.role === 'admin' ? 'Administrator' : 'Branch User / Staff'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 break-all font-mono">{viewUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Password</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 font-mono bg-gray-50 px-2.5 py-0.5 rounded border border-gray-100 w-fit">
                      {viewUser.plainPassword || '•••••••• (Unchanged)'}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg shrink-0"
                      title="Copy Email & Password"
                      onClick={handleCopyCredentials}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900">{viewUser.phone || '-'}</p>
                    {viewUser.phone && (
                      <a 
                        href={`https://wa.me/91${viewUser.phone}?text=${encodeURIComponent(
                          `*Trust Logistics - Credentials*\n\nPortal Link: https://trustlogistic.in/admin/login\nLogin Email: ${viewUser.email}\nPassword: ${viewUser.plainPassword || '••••••••'}\nAssigned Branch: ${viewUser.branch ? viewUser.branch.name : 'N/A'}`
                        )}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-6 w-6 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-full transition-all shrink-0 ml-1 shadow-sm"
                        title="Send via WhatsApp"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.638 1.97 14.162.945 11.53.945c-5.442 0-9.87 4.372-9.874 9.802-.001 1.777.467 3.51 1.358 5.021l-.993 3.624 3.746-.983zm13.757-11.232c-.322-.162-1.9-.938-2.193-1.046-.294-.107-.507-.162-.72.162-.213.324-.827 1.046-1.013 1.262-.187.218-.374.245-.697.082-.323-.162-1.362-.502-2.595-1.602-.96-.856-1.607-1.912-1.794-2.236-.187-.324-.02-.501.141-.661.145-.143.323-.378.485-.568.162-.189.215-.324.322-.541.108-.217.053-.406-.027-.568-.08-.162-.72-1.737-.987-2.383-.26-.627-.525-.541-.72-.551-.19-.01-.406-.01-.623-.01-.217 0-.569.082-.867.406-.298.324-1.137 1.11-1.137 2.707 0 1.597 1.157 3.137 1.319 3.353.162.217 2.277 3.477 5.518 4.877.771.332 1.373.53 1.84.678.775.246 1.48.212 2.037.129.62-.093 1.9-.778 2.167-1.493.267-.715.267-1.326.187-1.493-.08-.162-.293-.267-.615-.429z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Assigned Branch</p>
                  <p className="text-sm font-medium text-gray-900">
                    {viewUser.branch ? viewUser.branch.name : '-'}
                  </p>
                </div>
                {viewUser.branch && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">Branch Code</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">{viewUser.branch.code || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">Pincode</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">{viewUser.branch.pincode || '-'}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-gray-500 font-medium">City & State</p>
                      <p className="text-sm font-medium text-gray-900">
                        {viewUser.branch.city ? `${viewUser.branch.city}, ` : ''}{viewUser.branch.state || '-'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Module Permissions */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <p className="text-xs text-gray-500 font-medium">Module Permissions</p>
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
                  className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold px-5 rounded-lg text-sm h-10 shadow-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
