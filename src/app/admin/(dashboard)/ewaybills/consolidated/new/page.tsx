'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, FileOutput, CheckCircle2, ListFilter, Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { SearchSelect } from '@/components/ui/search-select';

export default function ConsolidatedEwayBillPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Filters
  const [challanNo, setChallanNo] = useState<string>('');

  // LRs
  const [bookings, setBookings] = useState<any[]>([]);
  const [isFetchingLRs, setIsFetchingLRs] = useState(false);
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());

  // Form states
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromPlace, setFromPlace] = useState('');
  const [fromState, setFromState] = useState('');
  const [transMode, setTransMode] = useState('1'); // 1 = Road
  const [transDocNo, setTransDocNo] = useState('');
  const [transDocDate, setTransDocDate] = useState('');

  const fetchChallanLRs = async () => {
    if (!challanNo) return toast.error("Please enter a Challan Number");
    try {
      setIsFetchingLRs(true);
      
      const res = await fetch(`/api/admin/bookings/for-cewb?challanNo=${challanNo}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

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
        if (data.challanDetails.branchName) setFromPlace(data.challanDetails.branchName);
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
    
    if (!vehicleNo) return toast.error("Vehicle Number is required");
    
    if (selectedBookingIds.size < 2) {
      return toast.error("Please select at least 2 pending LRs to consolidate.");
    }

    // Get selected EWBs
    const selectedEwbs = bookings
      .filter(b => selectedBookingIds.has(b._id) && b.ewayBillNo)
      .map(b => ({ ewbNo: parseInt(b.ewayBillNo) }));

    const payload = {
      challanNo, // Added challan reference
      userGstin: "05AAABB0639G1Z8", // Example format
      vehicleNo,
      fromPlace,
      fromState,
      transDocNo,
      transDocDate: transDocDate ? transDocDate.split('-').reverse().join('/') : '', 
      transMode,
      ewbNoDetails: selectedEwbs
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
              <Button className="flex-1" onClick={() => window.print()}>Print CEWB</Button>
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
          <p className="text-sm text-gray-500 mt-1">Select Pending LRs to group into a master e-way bill.</p>
        </div>
      </div>

      {/* Challan Selection Row */}
      <Card className="border-brand-primary/20 bg-brand-primary/5 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <Label className="font-semibold text-brand-primary whitespace-nowrap text-base">Load from Challan:</Label>
          <Input 
            placeholder="Enter Challan No (e.g. CH-1001)" 
            value={challanNo}
            onChange={(e) => setChallanNo(e.target.value.toUpperCase())}
            className="max-w-xs bg-white border-brand-primary/30 focus-visible:ring-brand-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                fetchChallanLRs();
              }
            }}
          />
          <Button 
            type="button" 
            onClick={fetchChallanLRs} 
            disabled={isFetchingLRs}
            className="shadow-sm"
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
                <Label>Vehicle Number <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="e.g. GJ01AB1234" 
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mode of Transport</Label>
                <select 
                  value={transMode}
                  onChange={(e) => setTransMode(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="1">Road</option>
                  <option value="2">Rail</option>
                  <option value="3">Air</option>
                  <option value="4">Ship</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>From Place</Label>
                <Input 
                  placeholder="e.g. Ahmedabad" 
                  value={fromPlace}
                  onChange={(e) => setFromPlace(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>From State (Code)</Label>
                <Input 
                  placeholder="e.g. 24" 
                  value={fromState}
                  onChange={(e) => setFromState(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Transporter Doc / LR No</Label>
                <Input 
                  placeholder="e.g. LR-1002" 
                  value={transDocNo}
                  onChange={(e) => setTransDocNo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Transporter Doc Date</Label>
                <DatePicker 
                  value={transDocDate}
                  onChange={(d) => setTransDocDate(d)}
                  placeholder="Select date"
                  className="w-full"
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
                          {booking.material?.itemName || 'N/A'} <br/>
                          <span className="text-gray-400">({booking.material?.chargedWeight || 0} kg)</span>
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
                Generate Master EWB
              </Button>
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  );
}
