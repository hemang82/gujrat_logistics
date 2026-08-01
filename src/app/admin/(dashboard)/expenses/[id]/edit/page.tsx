'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';
import { useUserStore } from '@/store/useUserStore';

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const { user } = useUserStore();
  const [branches, setBranches] = useState<any[]>([]);
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchHighlightIndex, setBranchHighlightIndex] = useState(-1);

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()));

  const [formData, setFormData] = useState({
    expenseType: 'fuel',
    amount: '',
    date: '',
    vehicle: '',
    driver: '',
    booking: '',
    description: '',
    paymentMethod: 'cash',
    status: 'paid',
    branch: ''
  });

  useEffect(() => {
    fetch('/api/admin/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(Array.isArray(data) ? data : (data.vehicles || [])))
      .catch(err => console.error('Error loading vehicles', err));
    fetch('/api/admin/drivers')
      .then(res => res.json())
      .then(data => setDrivers(Array.isArray(data) ? data : (data.drivers || [])))
      .catch(err => console.error('Error loading drivers', err));
    fetch('/api/admin/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : (data.bookings || [])))
      .catch(err => console.error('Error loading bookings', err));

    if (user?.role === 'logistic' || user?.role === 'superadmin') {
      fetch('/api/admin/branches')
        .then(res => res.json())
        .then(data => {
          if (data.branches) setBranches(data.branches);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/admin/expenses/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        setFormData({
          expenseType: data.expenseType || 'fuel',
          amount: data.amount?.toString() || '',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          vehicle: data.vehicle || '',
          driver: data.driver || '',
          booking: data.booking || '',
          description: data.description || '',
          paymentMethod: data.paymentMethod || 'cash',
          status: data.status || 'paid',
          branch: data.branch?._id || data.branch || ''
        });

        if (data.branch) {
            fetch(`/api/admin/branches/${data.branch?._id || data.branch}`)
            .then(res => res.json())
            .then(bdata => {
                if (bdata && bdata.name) setBranchSearch(bdata.name);
            }).catch(console.error);
        }
      } catch (err) {
        toast.error('Could not load expense details');
      } finally {
        setIsFetching(false);
      }
    };
    fetchExpense();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    if (name === 'amount') value = value.replace(/[^0-9.]/g, '');
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
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
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = "Please enter a valid amount";
    if (!formData.date) newErrors.date = "Please enter Date";
    if (!formData.vehicle) newErrors.vehicle = "Please select a vehicle";

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
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      driver: formData.driver || undefined,
      booking: formData.booking || undefined
    };

    try {
      const response = await fetch(`/api/admin/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Expense updated successfully!');
        router.push(`/admin/expenses`);
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update expense: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorText = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

  if (isFetching) return <div className="p-8 text-center text-gray-500">Loading expense details...</div>;

  return (
    <div className="w-full pb-10">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">Edit Expense</h1>
          <p className="text-brand-text-secondary mt-1">Update details for this expense record.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4 rounded-t-2xl">
            <CardTitle className="text-lg text-brand-text-primary">Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(user?.role === 'logistic' || user?.role === 'superadmin') && (
                <div className="space-y-2 md:col-span-2 relative">
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
                <Label className="text-gray-600 font-medium">Expense Category <span className="text-red-500">*</span></Label>
                <ThemeSelect 
                  name="expenseType" 
                  value={formData.expenseType} 
                  onChange={handleChange as any} 
                  options={[
                    { value: 'fuel', label: 'Fuel / Diesel' },
                    { value: 'toll', label: 'Toll Tax' },
                    { value: 'maintenance', label: 'Maintenance / Repair' },
                    { value: 'driver_bhatta', label: 'Driver Bhatta (Allowance)' },
                    { value: 'rto_challan', label: 'RTO Challan / Fine' },
                    { value: 'other', label: 'Other Expense' }
                  ]}
                  className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Amount (₹) <span className="text-red-500">*</span></Label>
                <Input name="amount" type="number" placeholder="e.g. 5000" value={formData.amount} onChange={handleChange} className={`h-12 bg-white rounded-xl ${errors.amount ? 'border-red-500' : 'border-gray-200'}`} />
                <ErrorText field="amount" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Date <span className="text-red-500">*</span></Label>
                <Input name="date" type="date" value={formData.date} onChange={handleChange} className={`h-12 bg-white rounded-xl ${errors.date ? 'border-red-500' : 'border-gray-200'}`} />
                <ErrorText field="date" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Payment Method <span className="text-red-500">*</span></Label>
                <ThemeSelect 
                  name="paymentMethod" 
                  value={formData.paymentMethod} 
                  onChange={handleChange as any} 
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'fastag', label: 'FASTag' },
                    { value: 'card', label: 'Card / Bank' },
                    { value: 'upi', label: 'UPI / Online' }
                  ]}
                  className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Related Vehicle <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <ThemeSelect 
                  name="vehicle" 
                  value={formData.vehicle} 
                  onChange={handleChange as any} 
                  options={vehicles.map(v => ({ value: v._id, label: v.vehicleNumber }))} 
                  placeholder="-- Select Vehicle --"
                  className={`flex w-full h-12 rounded-xl bg-white border px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary ${errors.vehicle ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50' : 'border-gray-200'}`}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Related Driver <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <ThemeSelect 
                  name="driver" 
                  value={formData.driver} 
                  onChange={handleChange as any} 
                  options={drivers.map(d => ({ value: d._id, label: d.name }))} 
                  placeholder="-- Select Driver --"
                  className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label className="text-gray-600 font-medium">Link to Booking / LR <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <ThemeSelect 
                  name="booking" 
                  value={formData.booking} 
                  onChange={handleChange as any} 
                  options={bookings.map(b => ({ value: b._id, label: `LR: ${b.lrNumber} - ${b.pickupLocation} to ${b.deliveryLocation}` }))} 
                  placeholder="-- Select Booking --"
                  className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-600 font-medium">Description / Remarks (Optional)</Label>
                <textarea name="description" rows={3} placeholder="e.g. Changed 2 front tyres, filled diesel at Surat pump" value={formData.description} onChange={handleChange} className="flex w-full rounded-xl bg-white border border-gray-200 p-3 text-sm shadow-sm resize-none transition-colors focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary" />
              </div>



            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/20 text-base font-bold">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
