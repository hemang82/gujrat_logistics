'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';
import { SearchSelect } from '@/components/ui/search-select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function AddCrossingPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userBranch = user?.branch || '';

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getBranchLabel = (branchVal: any) => {
    if (!branchVal) return '';
    const valStr = (branchVal?._id || branchVal).toString();
    const match = branchesList.find(b => b.value === valStr);
    return match ? match.label : valStr;
  };
  
  // Lists loaded from APIs
  const [branchesList, setBranchesList] = useState<{ value: string; label: string }[]>([]);
  const [vehiclesList, setVehiclesList] = useState<{ value: string; label: string; status?: string }[]>([]);
  const [driversList, setDriversList] = useState<{ value: string; label: string; status?: string }[]>([]);
  const [agentsList, setAgentsList] = useState<{ value: string; label: string }[]>([]);

  // Challan Form State
  const [formData, setFormData] = useState({
    branch: userBranch,
    challanNumber: '',
    challanDate: new Date().toISOString().slice(0, 10),
    allBranchwise: '',
    bookingCrossing: 'Crossing',
    selectiveDefault: 'Selective',
    lrToBranch: '',
    truckNo: '',
    agent: '',
    memoDestinationBranch: '',
    driverName: '',
    truckFreight: '0',
    advanceAmount: '0',
    commission: '0',
    remark: ''
  });

  // LR Scanning Row State
  const [scanGrNo, setScanGrNo] = useState('');
  const [scannedLr, setScannedLr] = useState<any>(null);
  const [pendingLrs, setPendingLrs] = useState<any[]>([]);
  const [selectedLrIds, setSelectedLrIds] = useState<Record<string, boolean>>({});

  // Autocomplete suggestion states
  const [allPendingBookings, setAllPendingBookings] = useState<any[]>([]);
  const [lrSuggestions, setLrSuggestions] = useState<any[]>([]);
  const [showLrDropdown, setShowLrDropdown] = useState(false);
  const [lrHighlightIndex, setLrHighlightIndex] = useState(-1);

  // Derived state for checked LRs
  const loadedLrs = pendingLrs.filter(item => selectedLrIds[item._id]);

  // Sync user branch
  useEffect(() => {
    if (userBranch) {
      setFormData(prev => ({ ...prev, branch: userBranch }));
    }
  }, [userBranch]);

  // Load Dropdowns
  useEffect(() => {
    // 1. Load next sequential challan number estimation
    fetch('/api/admin/challans?limit=1')
      .then(res => res.json())
      .then(data => {
        if (data && data.challans && data.challans.length > 0) {
          const lastNum = Number(data.challans[0].challanNumber);
          if (!isNaN(lastNum)) {
            setFormData(prev => ({ ...prev, challanNumber: (lastNum + 1).toString() }));
          }
        } else {
          setFormData(prev => ({ ...prev, challanNumber: '910' }));
        }
      })
      .catch(() => setFormData(prev => ({ ...prev, challanNumber: '910' })));

    // 2. Load Branches
    fetch('/api/admin/branches?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && data.branches) {
          const list = data.branches.map((b: any) => ({
            value: b._id,
            label: `${b.name} (${b.code})`
          }));
          setBranchesList(list);
        }
      });

    // 3. Load Vehicles
    fetch('/api/admin/vehicles?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const list = data.map((v: any) => ({
            value: v._id,
            label: v.vehicleNumber,
            status: v.status
          }));
          setVehiclesList(list);
        }
      });

    // 4. Load Drivers
    fetch('/api/admin/drivers?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const list = data.map((d: any) => ({
            value: d._id,
            label: d.name,
            status: d.status
          }));
          setDriversList(list);
        }
      });

    // 5. Fetch unique agents from existing challans to act as agent list
    fetch('/api/admin/challans?limit=200')
      .then(res => res.json())
      .then(data => {
        if (data && data.challans) {
          const uniqueAgents = Array.from(
            new Set(data.challans.map((c: any) => c.agent).filter(Boolean))
          ) as string[];
          
          const defaultAgents = ['Self', 'Gujarat Cargo', 'Shreeji Transport', 'Mahalaxmi Transport'];
          const combined = Array.from(new Set([...defaultAgents, ...uniqueAgents]));
          
          setAgentsList(combined.map(a => ({ value: a, label: a })));
        }
      })
      .catch(() => {
        const defaultAgents = ['Self', 'Gujarat Cargo', 'Shreeji Transport', 'Mahalaxmi Transport'];
        setAgentsList(defaultAgents.map(a => ({ value: a, label: a })));
      });

    // 6. Load All Pending Bookings for LR Autocomplete
    fetch('/api/admin/bookings?status=pending&limit=1000')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.bookings || []);
        setAllPendingBookings(list);
      })
      .catch(err => console.error('Error fetching pending bookings', err));
  }, []);

  // Auto-load LRs when lrToBranch, allBranchwise, or allPendingBookings changes
  useEffect(() => {
    async function autoLoadBranchBookings() {
      if (!formData.allBranchwise) {
        setPendingLrs([]);
        return;
      }
      if (formData.allBranchwise === 'Branchwise' && !formData.lrToBranch) {
        setPendingLrs([]);
        return;
      }
      if (allPendingBookings.length > 0) {
        // Filter bookings matching destinationBranch with lrToBranch (ObjectId comparison)
        const matchedBookings = allPendingBookings.filter((b: any) => {
          if (formData.allBranchwise === 'Branchwise') {
            const destId = b.destinationBranch?._id || b.destinationBranch;
            const targetId = formData.lrToBranch;
            return (
              destId && targetId && destId.toString() === targetId.toString() &&
              b.status === 'pending'
            );
          }
          return b.status === 'pending';
        });

        if (matchedBookings.length === 0) {
          const branchLabel = branchesList.find(b => b.value === formData.lrToBranch)?.label || formData.lrToBranch;
          const emptyMsg = formData.allBranchwise === 'Branchwise'
            ? `No pending bookings found for branch: ${branchLabel}`
            : `No pending bookings found in database.`;
          toast.info(emptyMsg);
          return;
        }

        const mapped = matchedBookings.map((b: any) => {
          const packages = b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
          const weight = b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
          const freight = b.charges?.freightAmount || 0;
          const totalAmount = b.charges?.totalAmount || freight;
          return {
            _id: b._id,
            lrNumber: b.lrNumber,
            bookingDate: b.bookingDate,
            consignorName: b.consignor?.name || 'N/A',
            consigneeName: b.consignee?.name || 'N/A',
            pkg: packages,
            weight: weight,
            freight: freight,
            totalAmount: totalAmount,
            charges: b.charges || {},
            destinationBranch: b.destinationBranch || 'N/A'
          };
        });

        setPendingLrs(mapped);
        setSelectedLrIds(prev => {
          const newSelections = { ...prev };
          mapped.forEach((item: any) => {
            newSelections[item._id] = true;
          });
          return newSelections;
        });

        const msg = formData.allBranchwise === 'Branchwise' 
          ? `Automatically loaded ${matchedBookings.length} LRs for branch: ${formData.lrToBranch}`
          : `Automatically loaded all ${matchedBookings.length} pending LRs`;
        toast.success(msg);
      }
    }

    autoLoadBranchBookings();
  }, [formData.lrToBranch, formData.allBranchwise, allPendingBookings]);

  // Clear lrToBranch when All is selected
  useEffect(() => {
    if (formData.allBranchwise === 'All') {
      setFormData(prev => ({ ...prev, lrToBranch: '' }));
    }
  }, [formData.allBranchwise]);

  // Sync selected LRs with Default/Selective mode
  useEffect(() => {
    if (formData.selectiveDefault === 'Default' && pendingLrs.length > 0) {
      setSelectedLrIds(prev => {
        const copy = { ...prev };
        pendingLrs.forEach(item => {
          copy[item._id] = true;
        });
        return copy;
      });
    }
  }, [formData.selectiveDefault, pendingLrs]);

  // Clear loadedLrs error when items are loaded
  useEffect(() => {
    if (loadedLrs.length > 0 && errors.loadedLrs) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.loadedLrs;
        return newErrors;
      });
    }
  }, [loadedLrs, errors.loadedLrs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (['truckFreight', 'advanceAmount', 'commission'].includes(name)) {
      value = value.replace(/[^0-9.]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // LR Scanner fetch logic (Add button)
  const handleScanLr = async () => {
    if (!scanGrNo.trim()) return;

    // If scannedLr is already populated from dropdown selection, add directly
    if (scannedLr) {
      if (pendingLrs.some(item => item._id === scannedLr._id) && selectedLrIds[scannedLr._id]) {
        toast.warning(`LR No: ${scannedLr.lrNumber} is already added to this Challan.`);
        setScanGrNo('');
        setScannedLr(null);
        return;
      }

      setPendingLrs(prev => [...prev, scannedLr]);
      setSelectedLrIds(prev => ({ ...prev, [scannedLr._id]: true }));
      toast.success(`LR No: ${scannedLr.lrNumber} added to loading list.`);
      setScanGrNo('');
      setScannedLr(null);
      return;
    }

    // Fallback: fetch from API if typed manually without selecting from dropdown
    try {
      const res = await fetch(`/api/admin/bookings?search=${encodeURIComponent(scanGrNo.trim())}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const bookingsList = Array.isArray(data) ? data : (data.bookings || []);

      const searchVal = scanGrNo.trim().replace(/^lr-/i, '').toLowerCase();
      const booking = bookingsList.find((b: any) => String(b.lrNumber || '').toLowerCase() === searchVal);

      if (!booking) {
        toast.error(`LR Number: ${scanGrNo} not found in database.`);
        setScannedLr(null);
        return;
      }

      if (booking.status === 'in_transit' || booking.status === 'delivered') {
        toast.error(`LR No: ${scanGrNo} is already in transit or delivered.`);
        setScannedLr(null);
        return;
      }

      if (pendingLrs.some(item => item._id === booking._id)) {
        if (!selectedLrIds[booking._id]) {
          setSelectedLrIds(prev => ({ ...prev, [booking._id]: true }));
          toast.success(`LR No: ${booking.lrNumber} selected in loading list.`);
          setScanGrNo('');
          setScannedLr(null);
          return;
        }
        toast.warning(`LR No: ${scanGrNo} is already added.`);
        setScannedLr(null);
        return;
      }

      const packages = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
      const weight = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
      const freight = booking.charges?.freightAmount || 0;
      const totalAmount = booking.charges?.totalAmount || freight;

      const newScanned = {
        _id: booking._id,
        lrNumber: booking.lrNumber,
        bookingDate: booking.bookingDate,
        consignorName: booking.consignor?.name || 'N/A',
        consigneeName: booking.consignee?.name || 'N/A',
        pkg: packages,
        weight: weight,
        freight: freight,
        totalAmount: totalAmount,
        charges: booking.charges || {},
        destinationBranch: booking.destinationBranch || 'N/A'
      };

      setPendingLrs(prev => [...prev, newScanned]);
      setSelectedLrIds(prev => ({ ...prev, [booking._id]: true }));
      setScanGrNo('');
      setScannedLr(null);
      toast.success(`LR No: ${booking.lrNumber} added to loading list.`);
    } catch (err) {
      toast.error('Error scanning LR number.');
    }
  };

  const handleSelectLrSuggestion = (booking: any) => {
    if (booking.status === 'in_transit' || booking.status === 'delivered') {
      toast.error(`LR No: ${booking.lrNumber} is already in transit or delivered.`);
      setScanGrNo('');
      setShowLrDropdown(false);
      return;
    }

    if (pendingLrs.some(item => item._id === booking._id) && selectedLrIds[booking._id]) {
      toast.warning(`LR No: ${booking.lrNumber} is already added.`);
      setScanGrNo('');
      setScannedLr(null);
      setShowLrDropdown(false);
      return;
    }

    const packages = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
    const weight = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
    const freight = booking.charges?.freightAmount || 0;
    const totalAmount = booking.charges?.totalAmount || freight;

    const newScanned = {
      _id: booking._id,
      lrNumber: booking.lrNumber,
      bookingDate: booking.bookingDate,
      consignorName: booking.consignor?.name || 'N/A',
      consigneeName: booking.consignee?.name || 'N/A',
      pkg: packages,
      weight: weight,
      freight: freight,
      totalAmount: totalAmount,
      charges: booking.charges || {},
      destinationBranch: booking.destinationBranch || 'N/A'
    };

    // Only fill the preview fields, don't add to list yet
    setScanGrNo(booking.lrNumber);
    setScannedLr(newScanned);
    setShowLrDropdown(false);
  };

  const handleRemoveLr = (id: string) => {
    setPendingLrs(prev => prev.filter(item => item._id !== id));
    setSelectedLrIds(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    toast.info('LR removed from loading list.');
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-xs font-semibold mt-1">{errors[field]}</p>;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.challanNumber) newErrors.challanNumber = 'Please enter Challan Number';
    if (!formData.challanDate) newErrors.challanDate = 'Please enter Challan Date';
    if (!formData.agent) newErrors.agent = 'Please enter Agent / Transporter';
    if (loadedLrs.length === 0) newErrors.loadedLrs = 'Please load at least one LR No';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields.');
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
      bookings: loadedLrs.map(b => b._id),
      truckFreight: parseFloat(formData.truckFreight) || 0,
      advanceAmount: parseFloat(formData.advanceAmount) || 0,
      commission: parseFloat(formData.commission) || 0
    };

    try {
      const response = await fetch('/api/admin/challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Crossing Challan created successfully!');
        router.push('/admin/challans/crossing');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create Crossing Challan: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      allBranchwise: '',
      bookingCrossing: 'Crossing',
      selectiveDefault: 'Selective',
      lrToBranch: '',
      truckNo: '',
      agent: '',
      memoDestinationBranch: '',
      driverName: '',
      truckFreight: '0',
      advanceAmount: '0',
      commission: '0',
      remark: ''
    }));
    setPendingLrs([]);
    setSelectedLrIds({});
    setScanGrNo('');
    setScannedLr(null);
    toast.info('Form reset completed.');
  };

  return (
    <div className="w-full pb-8">
      {/* Header Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="h-9 w-9 p-0 rounded-lg shrink-0 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Add Crossing Challan</h1>
            <p className="text-xs text-gray-500 mt-0.5">Load lorry receipts onto crossing agent sheet</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form Container */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <div className="bg-gray-50 border-b border-gray-100 py-3 px-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Fillup Information</h2>
          </div>
          <CardContent className="p-4 space-y-4">
            
            {/* Row 1: Configurations */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Branch</Label>
                <Input readOnly value={formData.branch} className="h-10 text-sm bg-gray-100 text-gray-500 font-bold rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Ch No</Label>
                <Input readOnly value={formData.challanNumber} className="h-10 text-sm bg-gray-100 text-gray-500 font-bold rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Challan Date <span className="text-red-500">*</span></Label>
                <DatePicker 
                  value={formData.challanDate} 
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, challanDate: date }));
                    if (errors.challanDate) {
                      const newErrors = { ...errors };
                      delete newErrors.challanDate;
                      setErrors(newErrors);
                    }
                  }}
                  className={errors.challanDate ? 'border-red-500 !h-10' : 'border-gray-200 !h-10'}
                />
                {renderError('challanDate')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">All / Branchwise</Label>
                <ThemeSelect
                  name="allBranchwise"
                  value={formData.allBranchwise}
                  onChange={handleChange as any}
                  options={[
                    { value: '', label: 'Select Loading Type' },
                    { value: 'All', label: 'All' },
                    { value: 'Branchwise', label: 'Branchwise' }
                  ]}
                  className="flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Crossing / Booking</Label>
                <ThemeSelect
                  name="bookingCrossing"
                  value={formData.bookingCrossing}
                  onChange={handleChange as any}
                  disabled={true}
                  options={[
                    { value: 'Booking', label: 'Booking' },
                    { value: 'Crossing', label: 'Crossing' }
                  ]}
                  className="flex h-10 w-full rounded-lg border px-3 text-sm bg-gray-100 text-gray-500 focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Selective / Default</Label>
                <ThemeSelect
                  name="selectiveDefault"
                  value={formData.selectiveDefault}
                  onChange={handleChange as any}
                  options={[
                    { value: 'Selective', label: 'Selective' },
                    { value: 'Default', label: 'Default' }
                  ]}
                  className="flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">LR To Branch</Label>
                <ThemeSelect
                  name="lrToBranch"
                  value={formData.lrToBranch}
                  onChange={handleChange as any}
                  options={[{ value: '', label: 'Select Branch' }, ...branchesList]}
                  disabled={formData.allBranchwise === 'All'}
                  className={`flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none ${
                    formData.allBranchwise === 'All'
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                      : ''
                  }`}
                />
              </div>
            </div>

            {/* Row 2: LR Scanning */}
            <div className="border-t border-b border-gray-100 py-3.5 bg-gray-50/50 -mx-4 px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-brand-primary uppercase">LR No:</Label>
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <Input 
                        value={scanGrNo} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setScanGrNo(val);
                          if (val.trim().length > 0) {
                            const filtered = allPendingBookings.filter((b: any) =>
                              String(b.lrNumber || '').toLowerCase().includes(val.trim().toLowerCase()) &&
                              b.status === 'pending'
                            ).slice(0, 10);
                            setLrSuggestions(filtered);
                            setShowLrDropdown(filtered.length > 0);
                            setLrHighlightIndex(-1);
                          } else {
                            setLrSuggestions([]);
                            setShowLrDropdown(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (showLrDropdown && lrSuggestions.length > 0) {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setLrHighlightIndex(prev => prev < lrSuggestions.length - 1 ? prev + 1 : 0);
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setLrHighlightIndex(prev => prev > 0 ? prev - 1 : lrSuggestions.length - 1);
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              if (lrHighlightIndex >= 0 && lrHighlightIndex < lrSuggestions.length) {
                                handleSelectLrSuggestion(lrSuggestions[lrHighlightIndex]);
                              } else if (lrSuggestions.length > 0) {
                                handleSelectLrSuggestion(lrSuggestions[0]);
                              } else {
                                handleScanLr();
                              }
                            } else if (e.key === 'Tab') {
                              if (lrSuggestions.length > 0) {
                                e.preventDefault();
                                const idx = lrHighlightIndex >= 0 ? lrHighlightIndex : 0;
                                handleSelectLrSuggestion(lrSuggestions[idx]);
                              }
                            } else if (e.key === 'Escape') {
                              setShowLrDropdown(false);
                            }
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            handleScanLr();
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowLrDropdown(false), 200)}
                        onFocus={() => {
                          if (scanGrNo.trim().length > 0 && lrSuggestions.length > 0) {
                            setShowLrDropdown(true);
                          }
                        }}
                        placeholder="e.g. LR-1001" 
                        className="h-10 text-sm border-brand-primary/40 focus-visible:ring-brand-primary/50 rounded-lg font-bold"
                        autoComplete="off"
                      />
                      <Button 
                        type="button"
                        onClick={handleScanLr}
                        className="h-10 px-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-bold text-xs"
                      >
                        Add
                      </Button>
                    </div>
                    {/* LR Autocomplete Dropdown */}
                    {showLrDropdown && lrSuggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {lrSuggestions.map((suggestion: any, index: number) => (
                          <div
                            key={suggestion._id}
                            onMouseDown={() => handleSelectLrSuggestion(suggestion)}
                            className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 ${
                              index === lrHighlightIndex ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-bold">{suggestion.lrNumber}</span>
                            <span className="text-gray-400 ml-2 text-xs">
                              {suggestion.consignor?.name || 'N/A'} → {suggestion.consignee?.name || 'N/A'}
                            </span>
                            <span className="text-gray-400 ml-2 text-xs">
                              ({suggestion.destinationBranch || 'N/A'})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {renderError('loadedLrs')}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-gray-600 uppercase">Consignor Name:</Label>
                  <Input readOnly value={scannedLr?.consignorName || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Consignee Name:</Label>
                  <Input readOnly value={scannedLr?.consigneeName || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Pkg:</Label>
                  <Input readOnly value={scannedLr?.pkg || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Weight:</Label>
                  <Input readOnly value={scannedLr?.weight || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Freight:</Label>
                  <Input readOnly value={scannedLr?.freight || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Destination Branch:</Label>
                  <Input readOnly value={getBranchLabel(scannedLr?.destinationBranch)} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Loaded LRs Table List */}
            {pendingLrs.length > 0 && (
              <>
              <div className="border border-gray-100 rounded-lg overflow-hidden mt-2 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input 
                          type="checkbox"
                          checked={pendingLrs.length > 0 && pendingLrs.every(item => selectedLrIds[item._id])}
                          disabled={formData.selectiveDefault === 'Default'}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedLrIds(prev => {
                              const copy = { ...prev };
                              pendingLrs.forEach(item => {
                                copy[item._id] = checked;
                              });
                              return copy;
                            });
                          }}
                          className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer disabled:cursor-not-allowed"
                        />
                      </th>
                      <th className="p-3 w-12 text-center">Sr.</th>
                      <th className="p-3">LR Number</th>
                      <th className="p-3">Consignor</th>
                      <th className="p-3">Consignee</th>
                      <th className="p-3 text-center">Packages</th>
                      <th className="p-3 text-center">Weight (KG)</th>
                      <th className="p-3 text-center">Freight</th>
                      <th className="p-3 text-center">Total Amt</th>
                      <th className="p-3">Destination</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                    {pendingLrs.map((item, index) => {
                      const isChecked = !!selectedLrIds[item._id];
                      return (
                        <tr 
                          key={item._id} 
                          className={`hover:bg-gray-50/50 transition-colors ${!isChecked ? 'opacity-50 line-through text-gray-400 bg-gray-50/30' : ''}`}
                        >
                          <td className="p-3 w-10 text-center">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              disabled={formData.selectiveDefault === 'Default'}
                              onChange={(e) => {
                                setSelectedLrIds(prev => ({
                                  ...prev,
                                  [item._id]: e.target.checked
                                }));
                              }}
                              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="p-3 text-center text-gray-400">{index + 1}</td>
                          <td className={`p-3 font-bold ${isChecked ? 'text-brand-primary' : 'text-gray-400'}`}>#{item.lrNumber}</td>
                          <td className="p-3">{item.consignorName}</td>
                          <td className="p-3">{item.consigneeName}</td>
                          <td className="p-3 text-center">{item.pkg}</td>
                          <td className="p-3 text-center">{item.weight} KG</td>
                          <td className="p-3 text-center">₹{item.freight}</td>
                          <td className="p-3 text-center font-bold relative group">
                            <span className="cursor-help border-b border-dotted border-gray-400">₹{item.totalAmount}</span>
                            <div className="absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-gray-900 text-white text-xs rounded shadow-lg p-2.5 right-1/2 translate-x-1/2 bottom-full mb-2 w-48 transition-all pointer-events-none text-left font-normal">
                              <div className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1">Amount Breakdown</div>
                              {(Number(item.charges?.freightAmount) > 0 || Number(item.freight) > 0) && <div className="flex justify-between py-0.5"><span>Freight:</span> <span>₹{item.charges?.freightAmount || item.freight}</span></div>}
                              {Number(item.charges?.pf) > 0 && <div className="flex justify-between py-0.5"><span>PF:</span> <span>₹{item.charges.pf}</span></div>}
                              {Number(item.charges?.hamali) > 0 && <div className="flex justify-between py-0.5"><span>Labour:</span> <span>₹{item.charges.hamali}</span></div>}
                              {Number(item.charges?.biltyCharge) > 0 && <div className="flex justify-between py-0.5"><span>Bilty:</span> <span>₹{item.charges.biltyCharge}</span></div>}
                              {Number(item.charges?.ddCharge) > 0 && <div className="flex justify-between py-0.5"><span>DD Charge:</span> <span>₹{item.charges.ddCharge}</span></div>}
                              {Number(item.charges?.gstAmount) > 0 && <div className="flex justify-between py-0.5 text-brand-secondary"><span>GST:</span> <span>₹{item.charges.gstAmount}</span></div>}
                              <div className="flex justify-between py-0.5 mt-1 border-t border-gray-700 pt-1 font-bold"><span>Total:</span> <span>₹{item.totalAmount}</span></div>
                              
                              {/* Tooltip arrow */}
                              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-solid border-t-gray-900 border-t-[6px] border-x-transparent border-x-[6px] border-b-0"></div>
                            </div>
                          </td>
                          <td className="p-3 uppercase text-brand-primary">{getBranchLabel(item.destinationBranch)}</td>
                          <td className="p-3 text-center">
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveLr(item._id)}
                              className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-brand-primary/5 text-gray-700 font-bold border-t-2 border-brand-primary/20">
                    <tr>
                      <td colSpan={5} className="p-3 text-right uppercase text-xs">Total LRs: <span className="text-brand-primary text-sm">{loadedLrs.length}</span></td>
                      <td className="p-3 text-center text-brand-primary text-sm">{loadedLrs.reduce((acc, curr) => acc + (Number(curr.pkg) || 0), 0)}</td>
                      <td className="p-3 text-center text-brand-primary text-sm">{loadedLrs.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)} KG</td>
                      <td className="p-3 text-center text-brand-primary text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (Number(curr.freight) || 0), 0)}</td>
                      <td className="p-3 text-center text-brand-primary text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </>
            )}

            {/* Row 3: Truck, Agent, Branches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Truck No. (Optional)</Label>
                <SearchSelect
                  name="truckNo"
                  value={formData.truckNo}
                  onChange={handleChange as any}
                  options={vehiclesList}
                  placeholder="Select Truck No"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Agent / Crossing Transporter <span className="text-red-500">*</span></Label>
                <SearchSelect
                  name="agent"
                  value={formData.agent}
                  onChange={(e: any) => {
                    handleChange(e);
                    if (errors.agent) {
                      const newErrors = { ...errors };
                      delete newErrors.agent;
                      setErrors(newErrors);
                    }
                  }}
                  options={agentsList}
                  placeholder="Select Agent"
                  allowCustom={true}
                />
                {renderError('agent')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Memo Destination Branch</Label>
                <ThemeSelect
                  name="memoDestinationBranch"
                  value={formData.memoDestinationBranch}
                  onChange={handleChange as any}
                  options={[{ value: '', label: 'Select Destination' }, ...branchesList]}
                  className="flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Driver Name (Optional)</Label>
                <SearchSelect
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange as any}
                  options={driversList}
                  placeholder="Select Driver"
                />
              </div>
            </div>

            {/* Row 4: Financials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase font-bold">Truck Freight</Label>
                <Input 
                  name="truckFreight"
                  placeholder="0"
                  value={formData.truckFreight}
                  onChange={handleChange}
                  className="h-10 text-sm rounded-lg font-bold text-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase font-bold">Advance Amount</Label>
                <Input 
                  name="advanceAmount"
                  placeholder="0"
                  value={formData.advanceAmount}
                  onChange={handleChange}
                  className="h-10 text-sm rounded-lg font-bold text-brand-secondary"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase font-bold">Commission</Label>
                <Input 
                  name="commission"
                  placeholder="0"
                  value={formData.commission}
                  onChange={handleChange}
                  className="h-10 text-sm rounded-lg font-bold text-gray-700"
                />
              </div>
            </div>

            {/* Row 5: Remark */}
            <div className="space-y-1 pt-2 col-span-full">
              <Label className="text-xs font-bold text-gray-600 uppercase">Remark</Label>
              <Input 
                name="remark"
                placeholder="Enter memo remarks..."
                value={formData.remark}
                onChange={handleChange}
                className="h-10 text-sm rounded-lg"
              />
            </div>
            
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-11 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg px-6 font-bold shadow-sm"
          >
            {isLoading ? 'Saving...' : 'Submit'}
          </Button>
          <Button 
            type="button" 
            onClick={handleReset}
            className="h-11 bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 font-bold shadow-sm"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
