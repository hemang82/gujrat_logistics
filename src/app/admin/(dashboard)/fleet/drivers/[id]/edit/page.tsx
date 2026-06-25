'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { UserCircle, FileText, Phone, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EditDriverPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '', bloodGroup: '', status: 'available', address: '',
    phone: '', alternatePhone: '',
    licenseNumber: '', licenseExpiry: '', aadharNumber: '', assignedVehicle: ''
  });

  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/vehicles').then(res => res.json()).then(data => {
      setVehicles(data || []);
    }).catch(err => console.error(err));
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!id) return;
    const fetchDriver = async () => {
      try {
        const res = await fetch(`/api/admin/drivers/${id}`);
        if (!res.ok) throw new Error('Failed to fetch driver');
        const data = await res.json();
        
        setFormData({
          name: data.name || '',
          bloodGroup: data.bloodGroup || '',
          status: data.status || 'available',
          address: data.address || '',
          phone: data.phone || '',
          alternatePhone: data.alternatePhone || '',
          licenseNumber: data.licenseNumber || '',
          licenseExpiry: formatDate(data.licenseExpiry),
          aadharNumber: data.aadharNumber || '',
          assignedVehicle: data.assignedVehicle?._id || data.assignedVehicle || ''
        });
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchDriver();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: string } }) => {
    let { name, value } = e.target;

    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phone' || name === 'alternatePhone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'licenseNumber') {
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (name === 'aadharNumber') {
      value = value.replace(/\D/g, '').slice(0, 12);
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Driver Name is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.licenseNumber) newErrors.licenseNumber = 'License Number is required';

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Primary Phone is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid 10-digit number';
    }

    if (formData.alternatePhone && !phoneRegex.test(formData.alternatePhone)) {
      newErrors.alternatePhone = 'Invalid 10-digit number';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix validation errors');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Driver updated successfully!');
        router.push('/admin/fleet/drivers');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update driver: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating the driver.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete driver');
      
      toast.success('Driver deleted successfully');
      setDeleteConfirmOpen(false);
      router.push('/admin/fleet/drivers');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const ErrorText = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading driver data...</div>;

  return (
    <div className="w-full pb-10">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">Edit Driver: {formData.name}</h1>
          <p className="text-brand-text-secondary mt-1">Update driver profile and documents.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setDeleteConfirmOpen(true)} variant="outline" className="h-12 px-4 rounded-xl text-red-500 border-red-200 hover:bg-red-50 font-medium">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 font-medium">
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
              <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-secondary/10 text-brand-secondary text-sm">1</span>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-600 font-medium">Full Name <span className="text-red-500">*</span></Label>
                  <Input name="name" placeholder="Driver's Full Name" value={formData.name} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.name ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary'}`} />
                  <ErrorText field="name" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 font-medium">Blood Group</Label>
                  <ThemeSelect 
                    name="bloodGroup" 
                    value={formData.bloodGroup} 
                    onChange={handleChange as any} 
                    options={[
                      { value: 'A+', label: 'A+' },
                      { value: 'A-', label: 'A-' },
                      { value: 'B+', label: 'B+' },
                      { value: 'B-', label: 'B-' },
                      { value: 'AB+', label: 'AB+' },
                      { value: 'AB-', label: 'AB-' },
                      { value: 'O+', label: 'O+' },
                      { value: 'O-', label: 'O-' }
                    ]}
                    placeholder="Select Blood Group"
                    className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 font-medium">Status <span className="text-red-500">*</span></Label>
                  <ThemeSelect 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange as any} 
                    options={[
                      { value: 'available', label: 'Available' },
                      { value: 'on-trip', label: 'On Trip' },
                      { value: 'on-leave', label: 'On Leave' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    className={`flex w-full h-12 rounded-xl bg-white border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 transition-all shadow-sm ${errors.status ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary'}`}
                  />
                  <ErrorText field="status" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 font-medium">Assign Vehicle</Label>
                  <ThemeSelect 
                    name="assignedVehicle" 
                    value={formData.assignedVehicle} 
                    onChange={handleChange as any} 
                    options={vehicles.map(v => ({ value: v._id, label: `${v.vehicleNumber} (${v.type})` }))}
                    placeholder="-- No Vehicle Assigned --"
                    className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary transition-all shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Assigning a new vehicle will automatically detach the driver from any previously assigned vehicle.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-600 font-medium">Residential Address</Label>
                  <textarea name="address" rows={2} placeholder="Full address" value={formData.address} onChange={handleChange} className="flex w-full rounded-xl bg-white border border-gray-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary transition-all shadow-sm resize-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-secondary/10 text-brand-secondary text-sm">2</span>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-600 font-medium">Primary Phone <span className="text-red-500">*</span></Label>
                    <Input name="phone" placeholder="10-digit mobile number" value={formData.phone} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.phone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary'}`} />
                    <ErrorText field="phone" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 font-medium">Emergency Phone</Label>
                    <Input name="alternatePhone" placeholder="Emergency contact number" value={formData.alternatePhone} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.alternatePhone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary'}`} />
                    <ErrorText field="alternatePhone" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KYC & License */}
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-secondary/10 text-brand-secondary text-sm">3</span>
                  License & KYC
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-600 font-medium">Driving License Number <span className="text-red-500">*</span></Label>
                    <Input name="licenseNumber" placeholder="DL Number" value={formData.licenseNumber} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm uppercase ${errors.licenseNumber ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary'}`} />
                    <ErrorText field="licenseNumber" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 font-medium">License Expiry Date</Label>
                    <DatePicker value={formData.licenseExpiry} onChange={(date) => handleDateChange('licenseExpiry', date)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 font-medium">Aadhar Card Number</Label>
                    <Input name="aadharNumber" placeholder="12-digit Aadhar" value={formData.aadharNumber} onChange={handleChange} className="h-12 bg-white rounded-xl focus-visible:ring-1 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary transition-all shadow-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={() => router.back()} className="h-14 px-8 rounded-xl border-gray-200 hover:bg-gray-50 text-base font-medium">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-xl bg-brand-secondary hover:bg-brand-secondary/90 text-white shadow-lg shadow-brand-secondary/20 text-base font-bold transition-all">
            {isLoading ? 'Updating...' : 'Update Driver'}
          </Button>
        </div>

      </form>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-white overflow-hidden p-6 rounded-2xl shadow-xl border-none">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Delete Driver?</DialogTitle>
            <DialogDescription className="text-center text-base mt-2 text-gray-500">
              Are you sure you want to delete this driver? This action cannot be undone and will permanently remove this driver profile and logs from the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row justify-center gap-4 mt-8 w-full border-t border-gray-100 pt-5">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-xl font-semibold"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 h-11 bg-red-600 text-white hover:bg-red-700 shadow-sm rounded-xl font-semibold animate-none"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
