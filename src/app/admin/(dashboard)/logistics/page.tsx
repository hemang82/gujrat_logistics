'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Plus, Loader2, Edit, Trash2, Mail, Phone, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useUserStore } from '@/store/useUserStore';
import { redirect, useRouter } from 'next/navigation';

export default function LogisticsManagementPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [logistics, setLogistics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [transporterId, setTransporterId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // View State
  const [viewLogistic, setViewLogistic] = useState<any | null>(null);

  useEffect(() => {
    const allowedRoles = ['superadmin', 'admin', 'manager'];
    if (user && !allowedRoles.includes(user.role)) {
      redirect('/admin/dashboard');
    }
    if (user && allowedRoles.includes(user.role)) {
      fetchLogistics();
    }
  }, [user]);

  const fetchLogistics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/logistics');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLogistics(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch logistics companies');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    router.push('/admin/logistics/new');
  };

  const openEditModal = (logistic: any) => {
    router.push(`/admin/logistics/new?id=${logistic._id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/logistics/${deleteId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Logistic Company deleted successfully!");
      setDeleteId(null);
      fetchLogistics();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allowedRoles = ['superadmin', 'admin', 'manager'];
  if (!user || !allowedRoles.includes(user.role)) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-primary" />
            Logistic Companies
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage transport companies and their owner accounts.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add Logistic Company
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">COMPANY DETAILS</th>
                <th className="px-6 py-4">STATUTORY INFO</th>
                <th className="px-6 py-4">CONTACT</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
                    Loading companies...
                  </td>
                </tr>
              ) : logistics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No logistic companies found</p>
                      <p className="text-sm mt-1 mb-4 text-gray-500">Get started by creating a new transport company account.</p>
                      <Button onClick={openCreateModal} variant="outline" size="sm">Create First Company</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                logistics.map((logistic) => (
                  <tr key={logistic._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 border border-brand-primary/20 overflow-hidden">
                          {logistic.companyLogo ? (
                            <img src={logistic.companyLogo} alt={logistic.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-brand-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{logistic.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 font-medium uppercase tracking-wider">{logistic.transporterId || 'NO TRANSIN'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 w-8">GST:</span>
                          <span className="font-medium text-gray-900 uppercase">{logistic.gstNumber || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 w-8">PAN:</span>
                          <span className="font-medium text-gray-900 uppercase">{logistic.panNumber || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{logistic.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{logistic.phone || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => setViewLogistic(logistic)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10" onClick={() => openEditModal(logistic)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(logistic._id)}>
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
      </Card>

      {/* View Details Modal */}
      <Dialog open={!!viewLogistic} onOpenChange={(open) => !open && setViewLogistic(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-primary" />
              Logistic Company Details
            </DialogTitle>
          </DialogHeader>
          {viewLogistic && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 border border-brand-primary/20 overflow-hidden">
                  {viewLogistic.companyLogo ? (
                    <img src={viewLogistic.companyLogo} alt={viewLogistic.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-brand-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewLogistic.name}</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">{viewLogistic.transporterId || 'NO TRANSIN'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{viewLogistic.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{viewLogistic.phone || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">GST Number</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">{viewLogistic.gstNumber || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">PAN Number</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">{viewLogistic.panNumber || '-'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">E-Way Bill API Access</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${viewLogistic.ewbApiAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {viewLogistic.ewbApiAccess ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">API Quota</p>
                  <p className="text-sm font-medium text-gray-900">{viewLogistic.ewbApiQuota || 0} Requests</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setViewLogistic(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this logistic company? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Yes, Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
