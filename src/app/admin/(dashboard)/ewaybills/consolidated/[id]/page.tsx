'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Edit2, Save, X, Truck, List, CalendarClock, History, Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function CEWBDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [bill, setBill] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [newValidUpto, setNewValidUpto] = useState('');
  const [extendReason, setExtendReason] = useState('');
  const [isExtending, setIsExtending] = useState(false);

  // Editable Form States
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromPlace, setFromPlace] = useState('');
  const [fromState, setFromState] = useState('');
  const [transMode, setTransMode] = useState('');
  const [transDocNo, setTransDocNo] = useState('');
  const [transDocDate, setTransDocDate] = useState('');

  const fetchBill = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/ewaybills/consolidate/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setBill(data.data);
      // Initialize edit states
      setVehicleNo(data.data.vehicleNo || '');
      setFromPlace(data.data.fromPlace || '');
      setFromState(data.data.fromState || '');
      setTransMode(data.data.transMode || '1');
      setTransDocNo(data.data.transDocNo || '');
      setTransDocDate(data.data.transDocDate || '');
      
      if (searchParams.get('print') === 'true') {
        setTimeout(() => window.print(), 500);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch CEWB details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBill();
  }, [id]);

  const handleUpdate = async () => {
    if (!vehicleNo) return toast.error("Vehicle Number is required");
    
    try {
      setIsSaving(true);
      const payload = { vehicleNo, fromPlace, fromState, transMode, transDocNo, transDocDate };
      const res = await fetch(`/api/admin/ewaybills/consolidate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("CEWB updated successfully!");
      setBill(data.data);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update CEWB');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtend = async () => {
    if (!newValidUpto) return toast.error('Please select a new validity date');
    try {
      setIsExtending(true);
      const res = await fetch(`/api/admin/ewaybills/consolidate/${id}/extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newValidUpto, reason: extendReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('CEWB validity extended successfully');
      setExtendModalOpen(false);
      fetchBill();
    } catch (err: any) {
      toast.error(err.message || 'Failed to extend CEWB');
    } finally {
      setIsExtending(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500 animate-pulse">Loading Details...</div>;
  }

  if (!bill) {
    return <div className="p-12 text-center text-red-500">Master EWB Not Found!</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/ewaybills/consolidated">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master CEWB Details</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">CEWB No: {bill.cEwbNo}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline" className="flex items-center gap-2 font-medium" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          {!isEditing ? (
            <>
              <Button 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => {
                  setNewValidUpto('');
                  setExtendReason('');
                  setExtendModalOpen(true);
                }}
              >
                <CalendarClock className="w-4 h-4" /> Extend CEWB
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSaving} className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Top Section - Transport Details */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm print:shadow-none print:border-black">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 print:bg-white print:border-black">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-primary print:text-black" />
                Transport Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-8">
                
                <div className="space-y-1">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Challan Ref</Label>
                  <p className="font-semibold text-lg font-mono text-brand-primary">{bill.challanNo || 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Vehicle Number</Label>
                  {isEditing ? (
                    <Input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} className="h-10" />
                  ) : (
                    <p className="font-semibold text-lg">{bill.vehicleNo}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Mode of Transport</Label>
                  {isEditing ? (
                    <select value={transMode} onChange={(e) => setTransMode(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                      <option value="Road">Road</option>
                      <option value="Rail">Rail</option>
                      <option value="Air">Air</option>
                      <option value="Ship">Ship</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-lg">{bill.transMode || 'Road'}</p>
                  )}
                </div>



                <div className="space-y-1">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">From Place</Label>
                  {isEditing ? (
                    <Input value={fromPlace} onChange={(e) => setFromPlace(e.target.value)} className="h-10" />
                  ) : (
                    <p className="font-semibold text-lg">{bill.fromPlace || 'N/A'}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">From State</Label>
                  {isEditing ? (
                    <Input value={fromState} onChange={(e) => setFromState(e.target.value)} className="h-10" />
                  ) : (
                    <p className="font-medium">{bill.fromState || 'N/A'}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Valid Upto</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-700">{bill.validUpto ? new Date(bill.validUpto).toLocaleDateString() : 'N/A'}</p>
                    {bill.validUpto && (() => {
                      const validUpto = new Date(bill.validUpto);
                      validUpto.setHours(0,0,0,0);
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const diffDays = Math.ceil((validUpto.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      
                      if (diffDays < 0) {
                        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Expired</span>;
                      } else if (diffDays === 0) {
                        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">Expires Today</span>;
                      } else {
                        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">{diffDays} Days Left</span>;
                      }
                    })()}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - EWB List */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm print:shadow-none print:border-black">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 print:bg-white print:border-black">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <List className="w-5 h-5 text-brand-primary print:text-black" />
                Included E-Way Bills & LRs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 print:bg-white print:border-black">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">LR NUMBER</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">CONSIGNOR</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">DESTINATION</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">ITEM</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">EWB NUMBER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 print:divide-black">
                    {bill.bookings && bill.bookings.length > 0 ? (
                      bill.bookings.map((booking: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-brand-primary">{booking.lrNumber}</td>
                          <td className="px-4 py-3">{booking.consignor?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{booking.destinationBranch?.name || 'N/A'}</td>
                          <td className="px-4 py-3">{booking.material?.itemName || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono font-medium tracking-widest bg-gray-50/50">{booking.ewayBillNo}</td>
                        </tr>
                      ))
                    ) : (
                      bill.ewbNoDetails?.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td colSpan={4} className="px-4 py-3 text-gray-400 italic">Legacy record (LR details not fetched)</td>
                          <td className="px-4 py-3 font-mono font-medium tracking-widest bg-gray-50/50">{item.ewbNo}</td>
                        </tr>
                      ))
                    )}
                    {(!bill.ewbNoDetails || bill.ewbNoDetails.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No details found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 print:bg-white print:border-black flex justify-between items-center">
                <span className="font-semibold text-gray-600">Total LRs included:</span>
                <span className="font-bold text-xl text-brand-primary">{bill.ewbNoDetails?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extension History Section */}
        {bill.extensionHistory && bill.extensionHistory.length > 0 && (
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm print:shadow-none print:border-black">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 print:bg-white print:border-black">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-brand-primary print:text-black" />
                  Extension History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                      <tr>
                        <th className="px-6 py-3">Extended On</th>
                        <th className="px-6 py-3">Previous Date</th>
                        <th className="px-6 py-3">New Date</th>
                        <th className="px-6 py-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bill.extensionHistory.map((ext: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-3">{new Date(ext.extendedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3">{ext.oldValidUpto ? new Date(ext.oldValidUpto).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-6 py-3 font-semibold text-brand-primary">{new Date(ext.newValidUpto).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-gray-600">{ext.reason || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Extend Modal */}
        <Dialog open={extendModalOpen} onOpenChange={setExtendModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Extend CEWB Validity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">CEWB NO</Label>
                <p className="font-mono font-medium text-lg text-brand-primary">{bill.cEwbNo}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Current Validity</Label>
                <p className="font-medium text-gray-700">{bill.validUpto ? new Date(bill.validUpto).toLocaleDateString() : 'N/A'}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">New Validity Date</Label>
                <DatePicker 
                  className="h-10 w-full" 
                  value={newValidUpto}
                  onChange={(date: string) => setNewValidUpto(date)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reason for Extension</Label>
                <Input 
                  placeholder="e.g. Vehicle Breakdown" 
                  className="h-10"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendModalOpen(false)}>Cancel</Button>
              <Button onClick={handleExtend} disabled={isExtending || !newValidUpto}>
                {isExtending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Extend CEWB
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
