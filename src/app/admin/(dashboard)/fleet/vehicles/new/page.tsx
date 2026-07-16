'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { Truck, FileText, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/drivers').then(res => res.json()).then(data => {
      // Filter out drivers that are already on-trip or inactive, or just show all available
      setDrivers(data || []);
    }).catch(err => console.error(err));
  }, []);

  const [formData, setFormData] = useState({
    vehicleNumber: '', type: '', capacity: '', make: '', model: '', status: 'available',
    rcNumber: '', rcExpiry: '', insuranceExpiry: '', fitnessExpiry: '', nationalPermitExpiry: '',
    ownerName: '', ownerPhone: '', assignedDriver: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string, value: string } }) => {
    let { name, value } = e.target;

    if (name === 'vehicleNumber' || name === 'rcNumber') {
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (name === 'ownerPhone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'ownerName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
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
    
    if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle Number is required';
    if (!formData.type) newErrors.type = 'Vehicle Type is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    if (!formData.status) newErrors.status = 'Status is required';

    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.ownerPhone && !phoneRegex.test(formData.ownerPhone)) {
      newErrors.ownerPhone = 'Invalid 10-digit number';
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
      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Vehicle added successfully!');
        router.push('/admin/fleet/vehicles');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add vehicle: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while adding the vehicle.');
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorText = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

  return (
    <div className="w-full pb-10">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">Add New Vehicle</h1>
          <p className="text-brand-text-secondary mt-1">Register a new vehicle in the fleet.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 font-medium">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* Core Details */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
            <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">1</span>
              Vehicle Core Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Vehicle Number <span className="text-red-500">*</span></Label>
                <Input name="vehicleNumber" placeholder="GJ01XX1234" value={formData.vehicleNumber} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm uppercase ${errors.vehicleNumber ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="vehicleNumber" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Vehicle Type <span className="text-red-500">*</span></Label>
                <ThemeSelect 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange as any} 
                  options={[
                    { value: 'Open', label: 'Open' },
                    { value: 'Container', label: 'Container' },
                    { value: 'Trailer', label: 'Trailer' },
                    { value: 'LCV', label: 'LCV' }
                  ]}
                  placeholder="Select Type"
                  className={`flex w-full h-12 rounded-xl bg-white border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 transition-all shadow-sm ${errors.type ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`}
                />
                <ErrorText field="type" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Capacity <span className="text-red-500">*</span></Label>
                <Input name="capacity" placeholder="e.g. 10 Ton" value={formData.capacity} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.capacity ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="capacity" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Make (Brand)</Label>
                <Input name="make" placeholder="e.g. Tata, Ashok Leyland" value={formData.make} onChange={handleChange} className="h-12 bg-white rounded-xl focus-visible:ring-1 border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Model</Label>
                <Input name="model" placeholder="e.g. Signa 5530" value={formData.model} onChange={handleChange} className="h-12 bg-white rounded-xl focus-visible:ring-1 border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm" />
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
                    { value: 'maintenance', label: 'Under Maintenance' }
                  ]}
                  className={`flex w-full h-12 rounded-xl bg-white border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 transition-all shadow-sm ${errors.status ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`}
                />
                <ErrorText field="status" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Details */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
            <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">2</span>
              Compliance & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">RC Number</Label>
                <Input name="rcNumber" placeholder="Enter RC number" value={formData.rcNumber} onChange={handleChange} className="h-12 bg-white rounded-xl focus-visible:ring-1 border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">RC Expiry Date</Label>
                <DatePicker value={formData.rcExpiry} onChange={(date) => handleDateChange('rcExpiry', date)} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Insurance Expiry Date</Label>
                <DatePicker value={formData.insuranceExpiry} onChange={(date) => handleDateChange('insuranceExpiry', date)} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Fitness Expiry Date</Label>
                <DatePicker value={formData.fitnessExpiry} onChange={(date) => handleDateChange('fitnessExpiry', date)} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">National Permit Expiry</Label>
                <DatePicker value={formData.nationalPermitExpiry} onChange={(date) => handleDateChange('nationalPermitExpiry', date)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ownership Details */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
            <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">3</span>
              Ownership Details (Optional)
            </CardTitle>
            <CardDescription className="px-10">If the vehicle is attached or hired, enter owner details.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Owner Name</Label>
                <Input name="ownerName" placeholder="Owner's full name" value={formData.ownerName} onChange={handleChange} className="h-12 bg-white rounded-xl focus-visible:ring-1 border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Owner Phone</Label>
                <Input name="ownerPhone" placeholder="10-digit mobile number" value={formData.ownerPhone} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.ownerPhone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="ownerPhone" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={() => router.back()} className="h-14 px-8 rounded-xl border-gray-200 hover:bg-gray-50 text-base font-medium">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/20 text-base font-bold transition-all">
            {isLoading ? 'Saving...' : 'Save Vehicle'}
          </Button>
        </div>

      </form>
    </div>
  );
}
