'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Search } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { useUserStore } from '@/store/useUserStore';

export default function LorryHireForm() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userBranch = user?.branch || '';

  const [isLoading, setIsLoading] = useState(false);
  const [voucherNo, setVoucherNo] = useState('Loading...');
  
  const [branches, setBranches] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromBranch: userBranch,
    toBranch: '',
    truckNo: '',
    totalAmount: '',
    advanceAmount: '',
    balancePaidBy: '',
  });

  const [selectedChallans, setSelectedChallans] = useState<any[]>([]);
  const [scanChallanNo, setScanChallanNo] = useState('');

  // Autocomplete states
  const [fromBranchSearch, setFromBranchSearch] = useState('');
  const [showFromBranchDropdown, setShowFromBranchDropdown] = useState(false);
  const [fromBranchHighlightIndex, setFromBranchHighlightIndex] = useState(-1);
  const [fromBranchSuggestions, setFromBranchSuggestions] = useState<any[]>([]);

  const [toBranchSearch, setToBranchSearch] = useState('');
  const [showToBranchDropdown, setShowToBranchDropdown] = useState(false);
  const [toBranchHighlightIndex, setToBranchHighlightIndex] = useState(-1);
  const [toBranchSuggestions, setToBranchSuggestions] = useState<any[]>([]);

  const [truckSearch, setTruckSearch] = useState('');
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const [truckHighlightIndex, setTruckHighlightIndex] = useState(-1);
  const [truckSuggestions, setTruckSuggestions] = useState<any[]>([]);

  const [balancePaidBySearch, setBalancePaidBySearch] = useState('');
  const [showBalancePaidByDropdown, setShowBalancePaidByDropdown] = useState(false);
  const [balancePaidByHighlightIndex, setBalancePaidByHighlightIndex] = useState(-1);
  const [balancePaidBySuggestions, setBalancePaidBySuggestions] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [branchRes, vehicleRes, challanRes] = await Promise.all([
        fetch('/api/admin/branches?limit=1000'),
        fetch('/api/admin/vehicles'),
        fetch('/api/admin/challans?status=pending&limit=1000') 
      ]);
      
      const branchData = await branchRes.json();
      const vehicleData = await vehicleRes.json();
      const challanData = await challanRes.json();
      
      const loadedBranches = branchData.branches || branchData || [];
      const loadedVehicles = vehicleData.vehicles || vehicleData || [];

      setBranches(loadedBranches);
      setVehicles(loadedVehicles);
      setChallans(challanData.challans || challanData || []);

      if (userBranch && loadedBranches.length > 0) {
        const userBranchObj = loadedBranches.find((b: any) => b._id === userBranch);
        if (userBranchObj) {
          setFromBranchSearch(`${userBranchObj.name || ''} (${userBranchObj.code || ''})`);
        }
      }

      // Fetch max voucher No
      fetch('/api/admin/lorry-hire?limit=100')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            let maxNum = 1000;
            let foundValid = false;
            data.forEach((b: any) => {
              if (b.voucherNo) {
                const match = b.voucherNo.match(/LH-(\d+)/);
                if (match) {
                  const num = parseInt(match[1], 10);
                  if (!isNaN(num)) {
                    foundValid = true;
                    if (num > maxNum) maxNum = num;
                  }
                }
              }
            });
            setVoucherNo(foundValid ? `LH-${maxNum + 1}` : 'LH-1001');
          } else {
            setVoucherNo('LH-1001');
          }
        })
        .catch(() => setVoucherNo('LH-1001'));
    } catch (error) {
      toast.error('Failed to load master data');
    }
  };

  const branchOptions = branches.map(b => ({ value: b._id, label: `${b.name || ''} (${b.code || ''})` }));
  const vehicleOptions = vehicles.map(v => ({ value: v._id, label: v.vehicleNumber || 'Unknown' }));

  // ------------- FROM BRANCH AUTOCOMPLETE -------------
  useEffect(() => {
    if (!fromBranchSearch || fromBranchSearch.trim().length < 1) {
      setFromBranchSuggestions([]);
      return;
    }
    const query = fromBranchSearch.trim().toLowerCase();
    const filtered = branchOptions.filter(b => 
      (b.label.toLowerCase().includes(query) || b.value.toLowerCase().includes(query)) && 
      b.value !== formData.toBranch
    );
    setFromBranchSuggestions(filtered);
  }, [fromBranchSearch, branches, formData.toBranch]);

  useEffect(() => setFromBranchHighlightIndex(-1), [fromBranchSuggestions]);

  const handleFromBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = fromBranchSuggestions[0];
      if (firstMatch && fromBranchSearch && firstMatch.label.toLowerCase().startsWith(fromBranchSearch.toLowerCase())) {
        setFormData(prev => ({ ...prev, fromBranch: firstMatch.value }));
        setFromBranchSearch(firstMatch.label);
        setShowFromBranchDropdown(false);
        setFromBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, fromBranch: '' }));
        return;
      }
    }
    if (!showFromBranchDropdown || fromBranchSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFromBranchHighlightIndex(prev => prev < fromBranchSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFromBranchHighlightIndex(prev => prev > 0 ? prev - 1 : fromBranchSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (fromBranchHighlightIndex >= 0 && fromBranchHighlightIndex < fromBranchSuggestions.length) {
        e.preventDefault();
        const selected = fromBranchSuggestions[fromBranchHighlightIndex];
        setFormData(prev => ({ ...prev, fromBranch: selected.value }));
        setFromBranchSearch(selected.label);
        setShowFromBranchDropdown(false);
        setFromBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, fromBranch: '' }));
      }
    } else if (e.key === 'Escape') { setShowFromBranchDropdown(false); setFromBranchHighlightIndex(-1); }
  };

  // ------------- TO BRANCH AUTOCOMPLETE -------------
  useEffect(() => {
    if (!toBranchSearch || toBranchSearch.trim().length < 1) {
      setToBranchSuggestions([]);
      return;
    }
    const query = toBranchSearch.trim().toLowerCase();
    const filtered = branchOptions.filter(b => 
      (b.label.toLowerCase().includes(query) || b.value.toLowerCase().includes(query)) &&
      b.value !== formData.fromBranch
    );
    setToBranchSuggestions(filtered);
  }, [toBranchSearch, branches, formData.fromBranch]);

  useEffect(() => setToBranchHighlightIndex(-1), [toBranchSuggestions]);

  const handleToBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = toBranchSuggestions[0];
      if (firstMatch && toBranchSearch && firstMatch.label.toLowerCase().startsWith(toBranchSearch.toLowerCase())) {
        setFormData(prev => ({ ...prev, toBranch: firstMatch.value }));
        setToBranchSearch(firstMatch.label);
        setShowToBranchDropdown(false);
        setToBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, toBranch: '' }));
        return;
      }
    }
    if (!showToBranchDropdown || toBranchSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setToBranchHighlightIndex(prev => prev < toBranchSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setToBranchHighlightIndex(prev => prev > 0 ? prev - 1 : toBranchSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (toBranchHighlightIndex >= 0 && toBranchHighlightIndex < toBranchSuggestions.length) {
        e.preventDefault();
        const selected = toBranchSuggestions[toBranchHighlightIndex];
        setFormData(prev => ({ ...prev, toBranch: selected.value }));
        setToBranchSearch(selected.label);
        setShowToBranchDropdown(false);
        setToBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, toBranch: '' }));
      }
    } else if (e.key === 'Escape') { setShowToBranchDropdown(false); setToBranchHighlightIndex(-1); }
  };

  // ------------- TRUCK NO AUTOCOMPLETE -------------
  useEffect(() => {
    if (!truckSearch || truckSearch.trim().length < 1) {
      setTruckSuggestions([]);
      return;
    }
    const query = truckSearch.trim().toLowerCase();
    const filtered = vehicleOptions.filter(v => v.label.toLowerCase().includes(query) || v.value.toLowerCase().includes(query));
    setTruckSuggestions(filtered);
  }, [truckSearch, vehicles]);

  useEffect(() => setTruckHighlightIndex(-1), [truckSuggestions]);

  const handleTruckKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = truckSuggestions[0];
      if (firstMatch && truckSearch && firstMatch.label.toLowerCase().startsWith(truckSearch.toLowerCase())) {
        setFormData(prev => ({ ...prev, truckNo: firstMatch.value }));
        setTruckSearch(firstMatch.label);
        setShowTruckDropdown(false);
        setTruckHighlightIndex(-1);
        setErrors(prev => ({ ...prev, truckNo: '' }));
        return;
      }
    }
    if (!showTruckDropdown || truckSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setTruckHighlightIndex(prev => prev < truckSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setTruckHighlightIndex(prev => prev > 0 ? prev - 1 : truckSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (truckHighlightIndex >= 0 && truckHighlightIndex < truckSuggestions.length) {
        e.preventDefault();
        const selected = truckSuggestions[truckHighlightIndex];
        setFormData(prev => ({ ...prev, truckNo: selected.value }));
        setTruckSearch(selected.label);
        setShowTruckDropdown(false);
        setTruckHighlightIndex(-1);
        setErrors(prev => ({ ...prev, truckNo: '' }));
      }
    } else if (e.key === 'Escape') { setShowTruckDropdown(false); setTruckHighlightIndex(-1); }
  };

  // ------------- BALANCE PAID BY AUTOCOMPLETE -------------
  useEffect(() => {
    if (!balancePaidBySearch || balancePaidBySearch.trim().length < 1) {
      setBalancePaidBySuggestions([]);
      return;
    }
    const query = balancePaidBySearch.trim().toLowerCase();
    const filtered = branchOptions.filter(b => b.label.toLowerCase().includes(query) || b.value.toLowerCase().includes(query));
    setBalancePaidBySuggestions(filtered);
  }, [balancePaidBySearch, branches]);

  useEffect(() => setBalancePaidByHighlightIndex(-1), [balancePaidBySuggestions]);

  const handleBalancePaidByKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = balancePaidBySuggestions[0];
      if (firstMatch && balancePaidBySearch && firstMatch.label.toLowerCase().startsWith(balancePaidBySearch.toLowerCase())) {
        setFormData(prev => ({ ...prev, balancePaidBy: firstMatch.value }));
        setBalancePaidBySearch(firstMatch.label);
        setShowBalancePaidByDropdown(false);
        setBalancePaidByHighlightIndex(-1);
        return;
      }
    }
    if (!showBalancePaidByDropdown || balancePaidBySuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setBalancePaidByHighlightIndex(prev => prev < balancePaidBySuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setBalancePaidByHighlightIndex(prev => prev > 0 ? prev - 1 : balancePaidBySuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (balancePaidByHighlightIndex >= 0 && balancePaidByHighlightIndex < balancePaidBySuggestions.length) {
        e.preventDefault();
        const selected = balancePaidBySuggestions[balancePaidByHighlightIndex];
        setFormData(prev => ({ ...prev, balancePaidBy: selected.value }));
        setBalancePaidBySearch(selected.label);
        setShowBalancePaidByDropdown(false);
        setBalancePaidByHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') { setShowBalancePaidByDropdown(false); setBalancePaidByHighlightIndex(-1); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScanChallan = () => {
    if (!scanChallanNo.trim()) return;
    
    const searchVal = scanChallanNo.trim().toLowerCase().replace(/^ch-/i, '');
    const challan = challans.find(c => {
      const num = String(c.challanNumber).toLowerCase().replace(/^ch-/i, '');
      return num === searchVal || String(c.challanNumber).toLowerCase() === scanChallanNo.trim().toLowerCase();
    });
    
    if (!challan) {
      toast.error('Challan not found or already assigned');
      return;
    }
    
    if (selectedChallans.some(c => c._id === challan._id)) {
      toast.error('Challan already added to list');
      setScanChallanNo('');
      return;
    }
    
    setSelectedChallans(prev => [...prev, challan]);
    setScanChallanNo('');
    toast.success('Challan added');
  };

  const removeChallan = (id: string) => {
    setSelectedChallans(prev => prev.filter(c => c._id !== id));
  };

  const calculateBalance = () => {
    const total = Number(formData.totalAmount) || 0;
    const advance = Number(formData.advanceAmount) || 0;
    return total - advance;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fromBranch) newErrors.fromBranch = 'Please select From Branch from the dropdown list';
    if (!formData.toBranch) newErrors.toBranch = 'Please select To Branch from the dropdown list';
    if (!formData.truckNo) newErrors.truckNo = 'Please select Truck No from the dropdown list';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix validation errors');
      return;
    }

    if (selectedChallans.length === 0) {
      toast.error('Please add at least one Challan');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        date: formData.date,
        fromBranch: formData.fromBranch,
        toBranch: formData.toBranch,
        truckNo: formData.truckNo,
        challans: selectedChallans.map(c => c._id),
        totalAmount: Number(formData.totalAmount) || 0,
        advanceAmount: Number(formData.advanceAmount) || 0,
        balanceAmount: calculateBalance(),
        balancePaidBy: formData.balancePaidBy || null
      };

      const res = await fetch('/api/admin/lorry-hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Lorry Hire created successfully');
      router.push('/admin/lorry-hire');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-xs font-semibold absolute bottom-0">{errors[field]}</p>;
    }
    return null;
  };

  return (
    <div className="w-full pb-8 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Add New Lorry Hire</h1>
          <p className="text-xs text-gray-500 mt-0.5">Create a new voucher and assign challans</p>
        </div>
        <Link href="/admin/lorry-hire">
          <Button variant="outline" className="h-9 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1 */}
        <Card className="border border-gray-100 shadow-sm rounded-xl relative z-20 !overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              1. Lorry Hire Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Voucher No</Label>
                <Input value={voucherNo} disabled className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 font-bold text-sm" />
              </div>
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Date <span className="text-red-500">*</span></Label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  className="h-10 rounded-lg border-gray-200 text-sm"
                />
              </div>

              {/* Truck Dropdown */}
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Truck No <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {truckSearch && truckSuggestions.length > 0 && truckSuggestions[0].label.toLowerCase().startsWith(truckSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{truckSuggestions[0].label.slice(0, truckSearch.length)}</span>
                      <span>{truckSuggestions[0].label.slice(truckSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={truckSearch}
                    onChange={(e) => {
                      setTruckSearch(e.target.value);
                      setFormData(prev => ({ ...prev, truckNo: '' }));
                    }}
                    onFocus={() => setShowTruckDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTruckDropdown(false), 250)}
                    onKeyDown={handleTruckKeyDown}
                    placeholder="Search or type Truck..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.truckNo ? 'border-red-500' : 'border-gray-200'}`}
                  />
                </div>
                {renderError('truckNo')}

                {showTruckDropdown && truckSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {truckSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, truckNo: suggestion.value }));
                          setTruckSearch(suggestion.label);
                          setShowTruckDropdown(false);
                          setTruckHighlightIndex(-1);
                          setErrors(prev => ({ ...prev, truckNo: '' }));
                        }}
                        onMouseEnter={() => setTruckHighlightIndex(index)}
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${truckHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* From Branch Dropdown */}
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">From Branch <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {fromBranchSearch && fromBranchSuggestions.length > 0 && fromBranchSuggestions[0].label.toLowerCase().startsWith(fromBranchSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{fromBranchSuggestions[0].label.slice(0, fromBranchSearch.length)}</span>
                      <span>{fromBranchSuggestions[0].label.slice(fromBranchSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={fromBranchSearch}
                    onChange={(e) => {
                      setFromBranchSearch(e.target.value);
                      setFormData(prev => ({ ...prev, fromBranch: '' }));
                    }}
                    onFocus={() => setShowFromBranchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowFromBranchDropdown(false), 250)}
                    onKeyDown={handleFromBranchKeyDown}
                    placeholder="Search or type Branch..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.fromBranch ? 'border-red-500' : 'border-gray-200'}`}
                  />
                </div>
                {renderError('fromBranch')}

                {showFromBranchDropdown && fromBranchSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {fromBranchSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, fromBranch: suggestion.value }));
                          setFromBranchSearch(suggestion.label);
                          setShowFromBranchDropdown(false);
                          setFromBranchHighlightIndex(-1);
                          setErrors(prev => ({ ...prev, fromBranch: '' }));
                        }}
                        onMouseEnter={() => setFromBranchHighlightIndex(index)}
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${fromBranchHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* To Branch Dropdown */}
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">To Branch <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {toBranchSearch && toBranchSuggestions.length > 0 && toBranchSuggestions[0].label.toLowerCase().startsWith(toBranchSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{toBranchSuggestions[0].label.slice(0, toBranchSearch.length)}</span>
                      <span>{toBranchSuggestions[0].label.slice(toBranchSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={toBranchSearch}
                    onChange={(e) => {
                      setToBranchSearch(e.target.value);
                      setFormData(prev => ({ ...prev, toBranch: '' }));
                    }}
                    onFocus={() => setShowToBranchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowToBranchDropdown(false), 250)}
                    onKeyDown={handleToBranchKeyDown}
                    placeholder="Search or type Branch..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.toBranch ? 'border-red-500' : 'border-gray-200'}`}
                  />
                </div>
                {renderError('toBranch')}

                {showToBranchDropdown && toBranchSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {toBranchSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, toBranch: suggestion.value }));
                          setToBranchSearch(suggestion.label);
                          setShowToBranchDropdown(false);
                          setToBranchHighlightIndex(-1);
                          setErrors(prev => ({ ...prev, toBranch: '' }));
                        }}
                        onMouseEnter={() => setToBranchHighlightIndex(index)}
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${toBranchHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Challan Search */}
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Search Challan <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={(!formData.fromBranch || !formData.toBranch) ? "Select Branches First..." : "Enter Challan No..."}
                      value={scanChallanNo}
                      onChange={(e) => setScanChallanNo(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleScanChallan(); } }}
                      disabled={!formData.fromBranch || !formData.toBranch}
                      className={`h-10 pl-9 rounded-lg text-sm focus-visible:ring-brand-primary/50 ${(!formData.fromBranch || !formData.toBranch) ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' : 'bg-transparent border-gray-200'}`}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleScanChallan} 
                    disabled={!formData.fromBranch || !formData.toBranch}
                    className="bg-brand-primary hover:bg-brand-primary-dark"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="border border-gray-100 shadow-sm rounded-xl relative z-10 !overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl flex justify-between items-center flex-row">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              2. Challans Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {selectedChallans.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3">Challan No</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Total LRs</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedChallans.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-brand-primary">{c.challanNumber}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(c.challanDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{c.bookings?.length || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                            onClick={() => removeChallan(c._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                {(!formData.fromBranch || !formData.toBranch) 
                  ? "Select From Branch and To Branch to search for challans." 
                  : "No Challans added yet. Search and add challans."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="border border-gray-100 shadow-sm rounded-xl relative z-10 !overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              3. Amount Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Total Amount</Label>
                <Input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-10 rounded-lg border-gray-200 text-sm text-right pr-4 font-semibold"
                />
              </div>
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Advance Amount</Label>
                <Input
                  type="number"
                  name="advanceAmount"
                  value={formData.advanceAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-10 rounded-lg border-gray-200 text-sm text-right pr-4 font-semibold"
                />
              </div>
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Balance Amount</Label>
                <Input
                  type="text"
                  value={calculateBalance()}
                  disabled
                  className="h-10 rounded-lg border-gray-200 bg-gray-50 font-bold text-sm text-right pr-4 text-orange-600"
                />
              </div>

              {/* Balance Paid By Dropdown */}
              <div className="space-y-1 relative pb-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Balance Paid By</Label>
                <div className="relative">
                  {balancePaidBySearch && balancePaidBySuggestions.length > 0 && balancePaidBySuggestions[0].label.toLowerCase().startsWith(balancePaidBySearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{balancePaidBySuggestions[0].label.slice(0, balancePaidBySearch.length)}</span>
                      <span>{balancePaidBySuggestions[0].label.slice(balancePaidBySearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={balancePaidBySearch}
                    onChange={(e) => {
                      setBalancePaidBySearch(e.target.value);
                      if (!e.target.value) setFormData(prev => ({ ...prev, balancePaidBy: '' }));
                    }}
                    onFocus={() => setShowBalancePaidByDropdown(true)}
                    onBlur={() => setTimeout(() => setShowBalancePaidByDropdown(false), 250)}
                    onKeyDown={handleBalancePaidByKeyDown}
                    placeholder="Search or type Branch..."
                    className="h-10 text-sm rounded-lg relative z-10 bg-transparent border-gray-200"
                  />
                </div>

                {showBalancePaidByDropdown && balancePaidBySuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {balancePaidBySuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, balancePaidBy: suggestion.value }));
                          setBalancePaidBySearch(suggestion.label);
                          setShowBalancePaidByDropdown(false);
                          setBalancePaidByHighlightIndex(-1);
                        }}
                        onMouseEnter={() => setBalancePaidByHighlightIndex(index)}
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${balancePaidByHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/lorry-hire">
            <Button variant="outline" type="button" className="h-10 px-6 rounded-lg font-semibold">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-dark font-semibold gap-2 shadow-sm">
            {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Lorry Hire
          </Button>
        </div>
      </form>
    </div>
  );
}
