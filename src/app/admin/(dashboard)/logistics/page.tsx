'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Plus, Loader2, Edit, Trash2, Mail, Phone, Eye, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useUserStore } from '@/store/useUserStore';
import { redirect, useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

export default function LogisticsManagementPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [logistics, setLogistics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyCredentials = (logItem?: any) => {
    const item = logItem || viewLogistic;
    if (!item) return;
    const pass = item.plainPassword || '••••••••';
    const text = `*Trust Logistics - Account Credentials*\n\nCompany Name: ${item.name}\nLogin Email: ${item.email}\nPassword: ${pass}\nPhone Number: ${item.phone || 'N/A'}\nTransporter ID: ${item.transporterId || 'N/A'}\nGST Number: ${item.gstNumber || 'N/A'}\n\nPortal Link: https://trustlogistic.in/admin/login`;
    navigator.clipboard.writeText(text);
    toast.success('Email, Password & Details copied to clipboard!');
  };

  const getWhatsAppShareUrl = (item: any) => {
    if (!item) return '';
    const cleanPhone = (item.phone || '').replace(/\D/g, '');
    const pass = item.plainPassword || '•••••••• (Unchanged)';
    const message = `*Trust Logistics - Account Credentials*\n\nDear Partner,\n\nYour logistics company account details are as follows:\n\n*Company Name:* ${item.name}\n*Login Email:* ${item.email}\n*Password:* ${pass}\n*Phone Number:* ${item.phone || 'N/A'}\n*Transporter ID:* ${item.transporterId || 'N/A'}\n*GST Number:* ${item.gstNumber || 'N/A'}\n\n*Portal Link:* https://trustlogistic.in/admin/login\n\nPlease keep these credentials secure and do not share them.`;
    return cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };
  
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

  // Status Toggle State
  const [statusToggleData, setStatusToggleData] = useState<{ id: string, name: string, currentStatus: boolean } | null>(null);

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

  const handleToggleStatusConfirm = async () => {
    if (!statusToggleData) return;
    const { id, currentStatus } = statusToggleData;

    // Soft update: Toggle state locally immediately
    setLogistics(prev => prev.map(item => {
      if (item._id === id) {
        return { ...item, isActive: !currentStatus };
      }
      return item;
    }));

    try {
      const res = await fetch(`/api/admin/logistics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Company status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
      
      // Silent refresh: Fetch in background without setting full loading spinner
      const silentRes = await fetch('/api/admin/logistics');
      const silentData = await silentRes.json();
      if (silentRes.ok && silentData.data) {
        setLogistics(silentData.data);
      }
    } catch (err: any) {
      // Rollback on error
      setLogistics(prev => prev.map(item => {
        if (item._id === id) {
          return { ...item, isActive: currentStatus };
        }
        return item;
      }));
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusToggleData(null);
    }
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
      
      // Soft delete: filter locally
      setLogistics(prev => prev.filter(item => item._id !== deleteId));
      setDeleteId(null);

      // Silent refresh in background
      const silentRes = await fetch('/api/admin/logistics');
      const silentData = await silentRes.json();
      if (silentRes.ok && silentData.data) {
        setLogistics(silentData.data);
      }
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
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button onClick={openCreateModal} className="bg-brand-primary hover:bg-brand-primary-dark text-white h-12 w-full sm:w-auto px-6 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Add Logistic Company
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4 w-20 text-center">Sr.</th>
                <th className="px-6 py-4">COMPANY DETAILS</th>
                <th className="px-6 py-4">STATUTORY INFO</th>
                <th className="px-6 py-4">CONTACT</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
                    Loading companies...
                  </td>
                </tr>
              ) : logistics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                logistics.map((logistic, index) => (
                  <tr key={logistic._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 text-center font-semibold text-slate-700">{index + 1}</td>
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
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setStatusToggleData({ id: logistic._id, name: logistic.name, currentStatus: logistic.isActive !== false })}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          logistic.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {logistic.isActive !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" title="View Details" onClick={() => setViewLogistic(logistic)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* {logistic.phone && (
                          <a
                            href={getWhatsAppShareUrl(logistic)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Share Credentials via WhatsApp"
                          >
                            <svg className="w-4 h-4 fill-current text-emerald-600" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.638 1.97 14.162.945 11.53.945c-5.442 0-9.87 4.372-9.874 9.802-.001 1.777.467 3.51 1.358 5.021l-.993 3.624 3.746-.983zm13.757-11.232c-.322-.162-1.9-.938-2.193-1.046-.294-.107-.507-.162-.72.162-.213.324-.827 1.046-1.013 1.262-.187.218-.374.245-.697.082-.323-.162-1.362-.502-2.595-1.602-.96-.856-1.607-1.912-1.794-2.236-.187-.324-.02-.501.141-.661.145-.143.323-.378.485-.568.162-.189.215-.324.322-.541.108-.217.053-.406-.027-.568-.08-.162-.72-1.737-.987-2.383-.26-.627-.525-.541-.72-.551-.19-.01-.406-.01-.623-.01-.217 0-.569.082-.867.406-.298.324-1.137 1.11-1.137 2.707 0 1.597 1.157 3.137 1.319 3.353.162.217 2.277 3.477 5.518 4.877.771.332 1.373.53 1.84.678.775.246 1.48.212 2.037.129.62-.093 1.9-.778 2.167-1.493.267-.715.267-1.326.187-1.493-.08-.162-.293-.267-.615-.429z" />
                            </svg>
                          </a>
                        )} */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10" title="Edit Company" onClick={() => openEditModal(logistic)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50" title="Delete Company" onClick={() => setDeleteId(logistic._id)}>
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
                  <p className="text-sm text-slate-700 font-semibold uppercase tracking-wider font-medium">{viewLogistic.transporterId || 'NO TRANSIN'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 break-all font-mono">{viewLogistic.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Password</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 font-mono bg-gray-50 px-2.5 py-0.5 rounded border border-gray-100 w-fit">
                      {viewLogistic.plainPassword || '•••••••• (Unchanged)'}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg shrink-0 cursor-pointer"
                      title="Copy Email & Password"
                      onClick={() => handleCopyCredentials()}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900">{viewLogistic.phone || '-'}</p>
                    {viewLogistic.phone && (
                      <a 
                        href={getWhatsAppShareUrl(viewLogistic)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-6 w-6 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-full transition-all shrink-0 ml-1 shadow-sm cursor-pointer"
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
          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="gap-2 text-xs font-semibold text-slate-700 hover:text-brand-primary border-gray-200 cursor-pointer"
                onClick={() => handleCopyCredentials()}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Credentials
              </Button>
              {viewLogistic?.phone && (
                <a
                  href={getWhatsAppShareUrl(viewLogistic)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.638 1.97 14.162.945 11.53.945c-5.442 0-9.87 4.372-9.874 9.802-.001 1.777.467 3.51 1.358 5.021l-.993 3.624 3.746-.983zm13.757-11.232c-.322-.162-1.9-.938-2.193-1.046-.294-.107-.507-.162-.72.162-.213.324-.827 1.046-1.013 1.262-.187.218-.374.245-.697.082-.323-.162-1.362-.502-2.595-1.602-.96-.856-1.607-1.912-1.794-2.236-.187-.324-.02-.501.141-.661.145-.143.323-.378.485-.568.162-.189.215-.324.322-.541.108-.217.053-.406-.027-.568-.08-.162-.72-1.737-.987-2.383-.26-.627-.525-.541-.72-.551-.19-.01-.406-.01-.623-.01-.217 0-.569.082-.867.406-.298.324-1.137 1.11-1.137 2.707 0 1.597 1.157 3.137 1.319 3.353.162.217 2.277 3.477 5.518 4.877.771.332 1.373.53 1.84.678.775.246 1.48.212 2.037.129.62-.093 1.9-.778 2.167-1.493.267-.715.267-1.326.187-1.493-.08-.162-.293-.267-.615-.429z" />
                  </svg>
                  Share on WhatsApp
                </a>
              )}
            </div>
            <Button type="button" variant="secondary" onClick={() => setViewLogistic(null)}>Close</Button>
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

      {/* Status Toggle Confirmation Modal */}
      <ConfirmDialog
        isOpen={statusToggleData !== null}
        onClose={() => setStatusToggleData(null)}
        onConfirm={handleToggleStatusConfirm}
        title={`${statusToggleData?.currentStatus ? 'Deactivate' : 'Activate'} Company Account`}
        description={`Are you sure you want to ${statusToggleData?.currentStatus ? 'deactivate' : 'activate'} "${statusToggleData?.name}"? ${statusToggleData?.currentStatus ? 'Deactivating this company will instantly log out and block all branches and branch users belonging to it.' : 'This will allow the company and all its branches to log in again.'}`}
        confirmText={statusToggleData?.currentStatus ? 'Deactivate Company' : 'Activate Company'}
        variant={statusToggleData?.currentStatus ? 'danger' : 'primary'}
      />
    </div>
  );
}



