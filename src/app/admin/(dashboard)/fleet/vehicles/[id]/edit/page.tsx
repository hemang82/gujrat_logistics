'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { ThemeSelect } from '@/components/ui/theme-select';
import { Truck, FileText, UserCircle, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/store/useUserStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    vehicleNumber: '', type: '', capacity: '', make: '', model: '', status: 'available',
    rcNumber: '', rcExpiry: '', insuranceExpiry: '', fitnessExpiry: '', nationalPermitExpiry: '',
    ownerName: '', ownerPhone: '', assignedDriver: '', branch: ''
  });

  const [drivers, setDrivers] = useState<any[]>([]);

  const { user } = useUserStore();
  const [branches, setBranches] = useState<any[]>([]);
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchHighlightIndex, setBranchHighlightIndex] = useState(-1);

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()));

  useEffect(() => {
    fetch('/api/admin/drivers').then(res => res.json()).then(data => {
      setDrivers(data || []);
    }).catch(err => console.error(err));

    if (user?.role === 'logistic' || user?.role === 'superadmin') {
      fetch('/api/admin/branches')
        .then(res => res.json())
        .then(data => {
          if (data.branches) setBranches(data.branches);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/admin/vehicles/${id}`);
        if (!res.ok) throw new Error('Failed to fetch vehicle');
        const data = await res.json();
        
        setFormData({
          vehicleNumber: data.vehicleNumber || '',
          type: data.type || '',
          capacity: data.capacity || '',
          make: data.make || '',
          model: data.model || '',
          status: data.status || 'available',
          rcNumber: data.rcNumber || '',
          rcExpiry: formatDate(data.rcExpiry),
          insuranceExpiry: formatDate(data.insuranceExpiry),
          fitnessExpiry: formatDate(data.fitnessExpiry),
          nationalPermitExpiry: formatDate(data.nationalPermitExpiry),
          ownerName: data.ownerName || '',
          ownerPhone: data.ownerPhone || '',
          assignedDriver: data.assignedDriver?._id || data.assignedDriver || '',
          branch: data.branch?._id || data.branch || ''
        });
        
        // Also fetch branch name for search box if applicable
        if (data.branch) {
            fetch(`/api/admin/branches/${data.branch?._id || data.branch}`)
            .then(res => res.json())
            .then(bdata => {
                if (bdata && bdata.name) setBranchSearch(bdata.name);
            }).catch(console.error);
        }

      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchVehicle();
  }, [id]);

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

  const handleBranchSearchChange = (value: string) => {
    setBranchSearch(value);
    setShowBranchDropdown(true);
    setBranchHighlightIndex(-1);
    if (!value) {
      setFormData(prev => ({ ...prev, branch: '' }));
    }
    if (errors.branch) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.branch;
        return copy;
      });
    }
  };

  const handleBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = filteredBranches[0];
      if (firstMatch && branchSearch) {
        if (firstMatch.name.toLowerCase().startsWith(branchSearch.toLowerCase())) {
          setFormData(prev => ({ ...prev, branch: firstMatch._id }));
          setBranchSearch(firstMatch.name);
          setShowBranchDropdown(false);
          setBranchHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showBranchDropdown || filteredBranches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev < filteredBranches.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev > 0 ? prev - 1 : filteredBranches.length - 1);
    } else if (e.key === 'Enter') {
      if (branchHighlightIndex >= 0 && branchHighlightIndex < filteredBranches.length) {
        e.preventDefault();
        const selected = filteredBranches[branchHighlightIndex];
        setFormData(prev => ({ ...prev, branch: selected._id }));
        setBranchSearch(selected.name);
        setShowBranchDropdown(false);
        setBranchHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowBranchDropdown(false);
      setBranchHighlightIndex(-1);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Please enter Vehicle Number';
    if (!formData.type) newErrors.type = 'Please enter Vehicle Type';
    if (!formData.capacity) newErrors.capacity = 'Please enter Capacity';
    if (!formData.status) newErrors.status = 'Please enter Status';

    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.ownerPhone && !phoneRegex.test(formData.ownerPhone)) {
      newErrors.ownerPhone = 'Invalid 10-digit number';
    }

    if ((user?.role === 'logistic' || user?.role === 'superadmin') && !formData.branch) {
      newErrors.branch = 'Please assign a branch';
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
      const response = await fetch(`/api/admin/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Vehicle updated successfully!');
        router.push('/admin/fleet/vehicles');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update vehicle: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating the vehicle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete vehicle');
      
      toast.success('Vehicle deleted successfully');
      setDeleteConfirmOpen(false);
      router.push('/admin/fleet/vehicles');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const ErrorText = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading vehicle data...</div>;

  return (
    <div className="w-full pb-10">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">Edit Vehicle: {formData.vehicleNumber}</h1>
          <p className="text-brand-text-secondary mt-1">Update vehicle details and documents.</p>
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
        
        {/* Core Details */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 rounded-t-2xl">
            <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">1</span>
              Vehicle Core Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(user?.role === 'logistic' || user?.role === 'superadmin') && (
                <div className="space-y-2 relative">
                  <Label className="text-gray-600 font-medium">Assign Branch <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    {branchSearch && filteredBranches.length > 0 && filteredBranches[0].name.toLowerCase().startsWith(branchSearch.toLowerCase()) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                        <span className="opacity-0">{filteredBranches[0].name.slice(0, branchSearch.length)}</span>
                        <span>{filteredBranches[0].name.slice(branchSearch.length)}</span>
                      </div>
                    )}
                    <Input
                      value={branchSearch}
                      onChange={(e) => handleBranchSearchChange(e.target.value)}
                      onFocus={() => setShowBranchDropdown(true)}
                      onBlur={() => setTimeout(() => setShowBranchDropdown(false), 250)}
                      onKeyDown={handleBranchKeyDown}
                      placeholder="Search Branch..."
                      className="h-12 text-sm rounded-xl relative z-10 bg-transparent border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm"
                    />
                    {showBranchDropdown && filteredBranches.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-xl border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                        {filteredBranches.map((suggestion, index) => (
                          <div
                            key={suggestion._id}
                            onMouseDown={() => {
                              setFormData(prev => ({ ...prev, branch: suggestion._id }));
                              setBranchSearch(suggestion.name);
                              setShowBranchDropdown(false);
                              setBranchHighlightIndex(-1);
                            }}
                            className={`flex flex-col px-3 py-2.5 text-sm font-bold rounded-lg cursor-pointer transition-colors ${index === branchHighlightIndex
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'hover:bg-gray-50 text-gray-800'
                              }`}
                          >
                            <span className="font-bold">{suggestion.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <ErrorText field="branch" />
                </div>
              )}


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
              </div>


            </div>
          </CardContent>
        </Card>

        {/* Documentation Details */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 rounded-t-2xl">
            <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">2</span>
              Compliance & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">RC Number</Label>
                <Input name="rcNumber" placeholder="Please enter RC number" value={formData.rcNumber} onChange={handleChange} className="h-12 bg-white rounded-xl focus-visible:ring-1 border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm" />
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
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 rounded-t-2xl">
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
            {isLoading ? 'Updating...' : 'Update Vehicle'}
          </Button>
        </div>

      </form>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-white overflow-hidden p-6 rounded-2xl shadow-xl border-none">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Delete Vehicle?</DialogTitle>
            <DialogDescription className="text-center text-base mt-2 text-gray-500">
              Are you sure you want to delete this vehicle? This action cannot be undone and will permanently remove this vehicle details and logs from the system.
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
