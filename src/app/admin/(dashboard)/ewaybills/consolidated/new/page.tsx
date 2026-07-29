'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, Plus, Trash2, FileOutput, CheckCircle2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

export default function ConsolidatedEwayBillPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Form states
  const [vehicleNo, setVehicleNo] = useState('');
  const [fromPlace, setFromPlace] = useState('');
  const [fromState, setFromState] = useState('');
  const [transMode, setTransMode] = useState('1'); // 1 = Road
  const [transDocNo, setTransDocNo] = useState('');
  const [transDocDate, setTransDocDate] = useState('');
  
  // EWB list
  const [ewbList, setEwbList] = useState([{ ewbNo: '' }]);

  const handleAddEwb = () => {
    setEwbList([...ewbList, { ewbNo: '' }]);
  };

  const handleRemoveEwb = (index: number) => {
    const newList = [...ewbList];
    newList.splice(index, 1);
    setEwbList(newList);
  };

  const handleEwbChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newList = [...ewbList];
    newList[index].ewbNo = value;
    setEwbList(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (!vehicleNo) return toast.error("Vehicle Number is required");
    
    // Filter empty EWBs
    const validEwbs = ewbList.filter(item => item.ewbNo && item.ewbNo.length === 12);
    if (validEwbs.length < 2) {
      return toast.error("Please add at least 2 valid 12-digit E-Way Bill numbers to consolidate.");
    }

    const payload = {
      userGstin: "05AAABB0639G1Z8", // Use from env or master in real app
      vehicleNo,
      fromPlace,
      fromState, // e.g. 24 for Gujarat, need State Code
      transDocNo,
      transDocDate: transDocDate ? transDocDate.split('-').reverse().join('/') : '', // Format DD/MM/YYYY
      transMode,
      ewbNoDetails: validEwbs.map(item => ({ ewbNo: parseInt(item.ewbNo) }))
    };

    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/ewaybills/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate Consolidated EWB");
      }
      
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
            <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full">
              <Button className="w-full" variant="outline" onClick={() => setSuccessData(null)}>Generate Another</Button>
              <Button className="w-full" onClick={() => window.print()}>Print CEWB</Button>
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Consolidated E-Way Bill (CEWB)</h1>
          <p className="text-sm text-gray-500 mt-1">Group multiple e-way bills for a single transport journey.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Transporter & Vehicle Info */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-gray-200">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-primary" />
                Transport Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label>Transporter Doc / LR Number</Label>
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
        </div>

        {/* Right Column - EWB List */}
        <div className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold">E-Way Bills</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-xs text-gray-500 mb-2">Enter 12-digit E-Way bill numbers to group into the CEWB.</p>
              
              {ewbList.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm w-6 text-center">{index + 1}.</span>
                  <Input 
                    placeholder="123456789012" 
                    value={item.ewbNo}
                    onChange={(e) => handleEwbChange(index, e.target.value)}
                    maxLength={12}
                    className="font-mono tracking-widest text-sm"
                  />
                  {ewbList.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveEwb(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-dashed flex items-center justify-center gap-2 mt-2 text-brand-primary"
                onClick={handleAddEwb}
              >
                <Plus className="w-4 h-4" />
                Add Another E-Way Bill
              </Button>
            </CardContent>
          </Card>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-base py-6 shadow-md"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Generating CEWB...
              </span>
            ) : (
              <>
                <FileOutput className="w-5 h-5" />
                Generate Master EWB
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
