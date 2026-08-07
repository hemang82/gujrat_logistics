'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, FileOutput, CheckCircle2, ListFilter, Loader2, AlertCircle } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ThemeSelect } from '@/components/ui/theme-select';

const TRANSPORT_MODE_OPTIONS = [
  { value: "1", label: "Road" },
  { value: "2", label: "Rail" },
  { value: "3", label: "Air" },
  { value: "4", label: "Ship" }
];

export default function ConsolidatedEwayBillPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Filters
  const [challanNo, setChallanNo] = useState<string>('');
  const [challanSuggestions, setChallanSuggestions] = useState<any[]>([]);
  const [showChallanDropdown, setShowChallanDropdown] = useState(false);
  const [challanHighlightIndex, setChallanHighlightIndex] = useState(-1);
  
  // Existing CEWB Modal
  const [existingCewbModal, setExistingCewbModal] = useState<{isOpen: boolean, message: string, cewbNo: string}>({isOpen: false, message: '', cewbNo: ''});

  // LRs
  const [bookings, setBookings] = useState<any[]>([]);
  const [isFetchingLRs, setIsFetchingLRs] = useState(false);
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());

  // Form states
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromPlace, setFromPlace] = useState('');
  const [fromState, setFromState] = useState('');
  const [transMode, setTransMode] = useState('1'); 
  const [vehicleError, setVehicleError] = useState('');

  // Fetch Suggestions - auto-load on focus, filter on type
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (showChallanDropdown) {
        const searchParam = challanNo ? `&search=${challanNo}` : '';
        fetch(`/api/admin/challans?status=pending&limit=20${searchParam}`)
          .then(res => res.json())
          .then(data => {
            if (data.challans) {
              setChallanSuggestions(data.challans);
            }
          })
          .catch(err => console.error(err));
      } else {
        setChallanSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [challanNo, showChallanDropdown]);



  useEffect(() => {
    setChallanHighlightIndex(-1);
  }, [challanSuggestions]);

  const handleChallanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = challanSuggestions[0];
      if (firstMatch && challanNo) {
        setChallanNo(firstMatch.challanNumber);
        setShowChallanDropdown(false);
        setChallanHighlightIndex(-1);
        e.preventDefault();
        return;
      }
    }

    if (!showChallanDropdown || challanSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setChallanHighlightIndex(prev => prev < challanSuggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setChallanHighlightIndex(prev => prev > 0 ? prev - 1 : challanSuggestions.length - 1);
    } else if (e.key === 'Enter') {
      if (challanHighlightIndex >= 0 && challanHighlightIndex < challanSuggestions.length) {
        e.preventDefault();
        const selected = challanSuggestions[challanHighlightIndex];
        setChallanNo(selected.challanNumber);
        setShowChallanDropdown(false);
        setChallanHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowChallanDropdown(false);
      setChallanHighlightIndex(-1);
    }
  };

  const fetchChallanLRs = async () => {
    if (!challanNo) return toast.error("Please enter a Challan Number");
    try {
      setIsFetchingLRs(true);
      
      const res = await fetch(`/api/admin/bookings/for-cewb?challanNo=${challanNo}`);
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'ALREADY_EXISTS') {
          setExistingCewbModal({ isOpen: true, message: data.message, cewbNo: data.cewbNo });
          return;
        }
        throw new Error(data.error);
      }

      setBookings(data.data || []);
      
      // Auto-select all LRs
      if (data.data && data.data.length > 0) {
        setSelectedBookingIds(new Set(data.data.map((b: any) => b._id)));
      } else {
        setSelectedBookingIds(new Set());
      }

      // Auto-fill details
      if (data.challanDetails) {
        if (data.challanDetails.vehicleNo) setVehicleNo(data.challanDetails.vehicleNo);
        if (data.challanDetails.branchCity) setFromPlace(data.challanDetails.branchCity);
        if (data.challanDetails.branchState) setFromState(data.challanDetails.branchState);
      }
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch challan details');
    } finally {
      setIsFetchingLRs(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedBookingIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedBookingIds(newSet);
  };

  const toggleAll = () => {
    if (selectedBookingIds.size === bookings.length) {
      setSelectedBookingIds(new Set());
    } else {
      setSelectedBookingIds(new Set(bookings.map(b => b._id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleError('');
    
    if (!vehicleNo) return toast.error("Please enter Vehicle Number");
    
    // Premium Vehicle Validation
    const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
    if (!vehicleRegex.test(vehicleNo)) {
      setVehicleError('Invalid Vehicle Format. Ex: GJ01AB1234');
      toast.error("Invalid Vehicle Number Format");
      return;
    }
    
    if (selectedBookingIds.size < 1) {
      return toast.error("Please select at least 1 pending LR to consolidate.");
    }

    // Get selected EWBs
    const selectedEwbs = bookings
      .filter(b => selectedBookingIds.has(b._id) && b.ewayBillNo)
      .map(b => ({ eway_bill_number: b.ewayBillNo }));

    const payload = {
      transporter_document_number: challanNo,
      vehicle_number: vehicleNo,
      mode_of_transport: transMode,
      place_of_consignor: fromPlace,
      state_of_consignor: fromState,
      list_of_eway_bills: selectedEwbs
    };

    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/ewaybills/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Consolidated E-Way Bill generated successfully!");
      setSuccessData(data.data);
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Consolidated E-Way Bill Generated</h1>
        <Card className="max-w-2xl border-emerald-100 bg-emerald-50/30">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Successfully Generated!</h2>
            <div className="bg-white p-4 rounded-xl border border-gray-100 w-full max-w-sm shadow-sm space-y-2">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Master CEWB Number</p>
              <p className="text-3xl font-bold text-brand-primary font-mono tracking-widest">{successData.cEwbNo}</p>
            </div>
            <p className="text-sm text-gray-600">Generated on: {successData.cEwbDate}</p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full px-4">
              <Button className="flex-1" variant="outline" onClick={() => setSuccessData(null)}>Generate Another</Button>
              <Button className="flex-1" onClick={() => {
                if (successData.printUrl) {
                  window.open(`/api/proxy-pdf?url=https://${successData.printUrl}`, '_blank');
                } else {
                  window.print();
                }
              }}>Print CEWB</Button>
            </div>
            <Link href="/admin/ewaybills/consolidated" className="text-sm text-brand-primary hover:underline mt-2">
              &larr; Back to CEWB List
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Generate CEWB</h1>
          <p className="text-sm text-gray-500 mt-1">Select Pending LRs to group into a Consolidated E-Way Bill (CEWB).</p>
        </div>
      </div>

      {/* Challan Selection Row */}
      <Card className="border-brand-primary/20 bg-brand-primary/5 shadow-sm overflow-visible">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4 overflow-visible">
          <Label className="text-xs uppercase tracking-wider text-brand-primary font-bold whitespace-nowrap">Load from Challan</Label>
          <div className="relative max-w-xs w-full">
            <Input 
              placeholder="Please enter Challan No (e.g. CH-1001)" 
              value={challanNo}
              onChange={(e) => {
                setChallanNo(e.target.value.toUpperCase());
                setShowChallanDropdown(true);
              }}
              onFocus={() => setShowChallanDropdown(true)}
              onBlur={() => setTimeout(() => setShowChallanDropdown(false), 200)}
              className="w-full bg-white border-brand-primary/30 focus-visible:ring-brand-primary h-10"
              onKeyDown={(e) => {
                handleChallanKeyDown(e);
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!showChallanDropdown || challanHighlightIndex < 0) {
                    fetchChallanLRs();
                  }
                }
              }}
            />
            {showChallanDropdown && challanSuggestions.length > 0 && (
              <ul className="absolute z-50 w-full sm:w-[420px] mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-72 overflow-y-auto">
                <li className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100 bg-gray-50/50">
                  Pending Challans ({challanSuggestions.length})
                </li>
                {challanSuggestions.map((suggestion, index) => (
                  <li 
                    key={suggestion._id}
                    className={`px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                      index === challanHighlightIndex ? 'bg-brand-primary/10' : 'hover:bg-gray-50'
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setChallanNo(suggestion.challanNumber);
                      setShowChallanDropdown(false);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${index === challanHighlightIndex ? 'text-brand-primary' : 'text-gray-900'}`}>
                            {suggestion.branch?.code || 'GL'}-{suggestion.challanNumber}
                          </span>
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase">
                            Pending
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{suggestion.challanDate ? new Date(suggestion.challanDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-medium text-gray-600">{suggestion.truckNo?.vehicleNumber || 'No Truck'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">{suggestion.branch?.name || 'N/A'}</span>
                          <span className="mx-1 text-brand-primary">→</span>
                          <span className="font-medium">{suggestion.memoDestinationBranch?.name || 'N/A'}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {suggestion.bookings?.length || 0} LRs loaded
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button 
            type="button" 
            onClick={fetchChallanLRs} 
            disabled={isFetchingLRs}
            className="shadow-sm h-10 px-6"
          >
            {isFetchingLRs ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Fetch Details & LRs
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Top Row - Transport Details */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-primary" />
              Transport Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Vehicle Number <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="e.g. GJ01AB1234" 
                  value={vehicleNo}
                  onChange={(e) => {
                    setVehicleNo(e.target.value.toUpperCase());
                    setVehicleError('');
                  }}
                  className={`h-10 ${vehicleError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
                {vehicleError && <p className="text-xs text-red-500 font-medium mt-1">{vehicleError}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Mode of Transport</Label>
                <ThemeSelect 
                  name="transMode"
                  value={transMode}
                  onChange={(e) => setTransMode(e.target.value)}
                  options={TRANSPORT_MODE_OPTIONS}
                  className="h-10 w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">From Place</Label>
                <Input 
                  placeholder="e.g. Dehradun" 
                  value={fromPlace}
                  onChange={(e) => setFromPlace(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">From State (Name/Code)</Label>
                <Input 
                  placeholder="e.g. UTTARAKHAND" 
                  value={fromState}
                  onChange={(e) => setFromState(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row - LRs Table */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-brand-primary" />
                Pending LRs with EWB
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                        checked={bookings.length > 0 && selectedBookingIds.size === bookings.length}
                        onChange={toggleAll}
                        disabled={bookings.length === 0}
                      />
                    </th>
                    <th className="px-4 py-3">LR NUMBER</th>
                    <th className="px-4 py-3">CONSIGNOR</th>
                    <th className="px-4 py-3">DESTINATION</th>
                    <th className="px-4 py-3">ITEM / WEIGHT</th>
                    <th className="px-4 py-3">E-WAY BILL NO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isFetchingLRs ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
                        Fetching LRs...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        No pending LRs with E-Way Bill found for this filter.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr 
                        key={booking._id} 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedBookingIds.has(booking._id) ? 'bg-blue-50/30' : ''}`}
                        onClick={() => toggleSelection(booking._id)}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            checked={selectedBookingIds.has(booking._id)}
                            onChange={() => toggleSelection(booking._id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand-primary">
                          {booking.lrNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {booking.consignor?.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {booking.destinationBranch?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {booking.items?.[0]?.description || booking.material?.itemName || 'N/A'} <br/>
                          <span className="text-gray-400">({booking.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || booking.material?.chargedWeight || 0} kg)</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium tracking-widest text-emerald-700">
                          {booking.ewayBillNo}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Table Footer with Submit Button */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-600">
                {selectedBookingIds.size} of {bookings.length} LRs selected
              </span>
              <Button 
                type="submit" 
                disabled={isLoading || selectedBookingIds.size === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-5 text-base shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileOutput className="w-5 h-5" />
                )}
                Generate CEWB
              </Button>
            </div>
          </CardContent>
        </Card>

      </form>

      {/* Existing CEWB Modal */}
      <Dialog open={existingCewbModal.isOpen} onOpenChange={(open) => setExistingCewbModal(prev => ({...prev, isOpen: open}))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              CEWB Already Exists
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-700">
              {existingCewbModal.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Link href={`/admin/ewaybills/consolidated`} className="w-full">
              <Button type="button" className="w-full">
                Go to CEWB List
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
