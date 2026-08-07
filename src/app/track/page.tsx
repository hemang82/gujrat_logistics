'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Truck, Search, MapPin, Package, CheckCircle, Clock, AlertCircle, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/dateUtils';

function TrackBookingContent() {
  const searchParams = useSearchParams();
  const initialLr = searchParams.get('lr') || '';
  
  const [lrNumber, setLrNumber] = useState(initialLr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!lrNumber.trim()) {
      setError('Please enter a valid LR Number');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const res = await fetch(`/api/public/track?lrNumber=${encodeURIComponent(lrNumber)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch tracking details');
      }

      setTrackingData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLr) {
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLr]);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Booked', icon: Package, color: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary' };
      case 'in_transit': return { label: 'In Transit', icon: Truck, color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-500' };
      case 'out_for_delivery': return { label: 'Out for Delivery', icon: MapPin, color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-500' };
      case 'delivered': return { label: 'Delivered', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-500' };
      case 'cancelled': return { label: 'Cancelled', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-500' };
      default: return { label: status, icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-500' };
    }
  };

  const currentStatusObj = trackingData ? getStatusDetails(trackingData.status) : null;
  const StatusIcon = currentStatusObj?.icon || Clock;

  const timelineSteps = [
    { key: 'pending', label: 'Consignment Booked' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const getCurrentStepIndex = () => {
    if (!trackingData) return -1;
    if (trackingData.status === 'cancelled') return 0;
    return timelineSteps.findIndex(step => step.key === trackingData.status);
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 pb-24 px-4 sm:px-6">
      
      {/* Hero Search Section */}
      <div className="w-full max-w-3xl text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-brand-primary/10 rounded-full mb-4">
          <Truck className="w-8 h-8 text-brand-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
          Track Your Shipment
        </h1>
        <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Enter your LR (Lorry Receipt) Number to get real-time status updates on your consignment{trackingData ? ` with ` : '.'}
          {trackingData && <strong className="text-gray-700">{trackingData.logisticName}</strong>}
        </p>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              value={lrNumber}
              onChange={(e) => setLrNumber(e.target.value)}
              placeholder="Enter LR Number (e.g. 1001)"
              className="pl-12 h-14 rounded-xl text-lg font-semibold border-gray-300 shadow-sm focus-visible:ring-brand-primary uppercase"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="h-14 px-8 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-lg shadow-md transition-all sm:w-auto w-full"
          >
            {loading ? 'Tracking...' : 'Track Now'}
          </Button>
        </form>
        {error && (
          <div className="mt-4 text-red-500 font-medium bg-red-50 p-3 rounded-lg max-w-lg mx-auto border border-red-100 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {trackingData && (
        <div className="w-full max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Status Card */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold text-gray-600 border border-gray-200">
              <Truck className="w-4 h-4 text-brand-primary" /> Handled by {trackingData.logisticName}
            </span>
          </div>
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${currentStatusObj?.bg}`}>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Current Status</p>
                <div className={`flex items-center gap-2 ${currentStatusObj?.color}`}>
                  <StatusIcon className="w-6 h-6" />
                  <h2 className="text-2xl font-extrabold">{currentStatusObj?.label}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">LR Number</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm font-bold text-gray-400 bg-gray-100/50 px-2 py-1 rounded-md">LR</span>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">{trackingData.lrNumber}</h3>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6 sm:p-8">
              {/* Route Summary */}
              <div className="flex items-center justify-between mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 border-t-2 border-dashed border-gray-200 -z-10 -translate-y-1/2"></div>
                
                <div className="bg-white p-2">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2 mx-auto border-4 border-white shadow-sm transition-transform hover:scale-110">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Origin</p>
                    <p className="font-bold text-gray-900">{trackingData.origin}</p>
                  </div>
                </div>

                <div className="bg-white px-4 py-1 border border-gray-200 rounded-full shadow-sm text-xs font-bold text-gray-500">
                  <Truck className="w-4 h-4 inline-block mr-1" /> Route
                </div>

                <div className="bg-white p-2">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2 mx-auto border-4 border-white shadow-sm transition-transform hover:scale-110">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Destination</p>
                    <p className="font-bold text-gray-900">{trackingData.destination}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Display */}
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" /> Tracking History
                </h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = currentStepIdx >= idx || (trackingData.status === 'delivered');
                    const isCurrent = currentStepIdx === idx && trackingData.status !== 'cancelled';
                    const stepHistory = trackingData.trackingHistory?.find((h: any) => h.status === step.key);
                    const StepIcon = getStatusDetails(step.key).icon;

                    // Do not show future steps if cancelled
                    if (trackingData.status === 'cancelled' && idx > 0) return null;

                    return (
                      <div key={step.key} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
                          ${isCompleted ? 'text-brand-primary border-brand-primary/20' : 'text-gray-300'}
                          ${isCurrent ? 'ring-2 ring-brand-primary ring-offset-2' : ''}
                        `}>
                          <StepIcon className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm group-hover:border-brand-primary/30 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h4>
                          </div>
                          {isCompleted ? (
                            <>
                              <p className="text-sm text-gray-500 font-medium">
                                {stepHistory ? formatDate(stepHistory.timestamp) : (idx === 0 ? formatDate(trackingData.bookingDate) : 'Status Updated')}
                              </p>
                              {stepHistory?.location && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {stepHistory.location}
                                </p>
                              )}
                              {stepHistory?.remarks && (
                                <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                  "{stepHistory.remarks}"
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 italic">Pending update...</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                </div>
              </div>

              {/* Full Details Section */}
              <div className="mt-10 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-brand-primary" /> Bilty Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Consignor */}
                  <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 hover:border-brand-primary/20 transition-colors">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">Consignor (Sender)</p>
                    <p className="font-bold text-gray-900 text-lg">{trackingData.consignor?.name || trackingData.consignorName}</p>
                    {trackingData.consignor?.phone && trackingData.consignor.phone !== '0000000000' && <p className="text-sm text-gray-600 mt-1 flex items-center gap-2"><span>📞</span> {trackingData.consignor.phone}</p>}
                    {trackingData.consignor?.gstNumber && <p className="text-sm text-gray-600 mt-1 flex items-center gap-2 font-mono text-xs"><span>GST:</span> {trackingData.consignor.gstNumber}</p>}
                    {trackingData.consignor?.address && !String(trackingData.consignor.address).match(/^[0-9a-fA-F]{24}$/) && <p className="text-sm text-gray-600 mt-2 text-wrap">{trackingData.consignor.address}</p>}
                  </div>
                  
                  {/* Consignee */}
                  <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 hover:border-brand-primary/20 transition-colors">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2">Consignee (Receiver)</p>
                    <p className="font-bold text-gray-900 text-lg">{trackingData.consignee?.name || trackingData.consigneeName}</p>
                    {trackingData.consignee?.phone && trackingData.consignee.phone !== '0000000000' && <p className="text-sm text-gray-600 mt-1 flex items-center gap-2"><span>📞</span> {trackingData.consignee.phone}</p>}
                    {trackingData.consignee?.gstNumber && <p className="text-sm text-gray-600 mt-1 flex items-center gap-2 font-mono text-xs"><span>GST:</span> {trackingData.consignee.gstNumber}</p>}
                    {trackingData.consignee?.address && !String(trackingData.consignee.address).match(/^[0-9a-fA-F]{24}$/) && <p className="text-sm text-gray-600 mt-2 text-wrap">{trackingData.consignee.address}</p>}
                  </div>
                </div>

                {/* Items List Table */}
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-3 text-xs font-bold text-brand-primary uppercase tracking-wider">Pkgs</th>
                          <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Packaging</th>
                          <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Weight</th>
                          <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">N/W</th>
                          <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Rate</th>
                          <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {trackingData.items?.length > 0 ? (
                          trackingData.items.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-3 text-sm font-bold text-gray-900">{item.packages || 0}</td>
                              <td className="p-3 text-sm text-gray-600 uppercase">{item.packaging || '-'}</td>
                              <td className="p-3 text-sm text-gray-900 font-medium uppercase">{item.description || trackingData.description || '-'}</td>
                              <td className="p-3 text-sm text-gray-600 text-right">{item.weight || 0} kg</td>
                              <td className="p-3 text-sm text-gray-600 text-center font-bold">{item.nw || 'N'}</td>
                              <td className="p-3 text-sm text-gray-600 text-right">₹{item.rate || 0}</td>
                              <td className="p-3 text-sm font-bold text-gray-900 text-right">₹{item.amount || 0}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 text-sm font-bold text-gray-900">{trackingData.packages || 0}</td>
                            <td className="p-3 text-sm text-gray-600 uppercase">-</td>
                            <td className="p-3 text-sm text-gray-900 font-medium uppercase">{trackingData.description || '-'}</td>
                            <td className="p-3 text-sm text-gray-600 text-right">{trackingData.weight || 0} kg</td>
                            <td className="p-3 text-sm text-gray-600 text-center font-bold">-</td>
                            <td className="p-3 text-sm text-gray-600 text-right">₹0</td>
                            <td className="p-3 text-sm font-bold text-gray-900 text-right">₹{trackingData.charges?.freightAmount || 0}</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-brand-primary/5 font-bold text-gray-900 border-t-2 border-brand-primary/20">
                        <tr>
                          <td className="p-3 text-sm">{trackingData.packages || 0}</td>
                          <td className="p-3 text-sm" colSpan={2}>Total</td>
                          <td className="p-3 text-sm text-right">{trackingData.weight || 0} kg</td>
                          <td className="p-3 text-sm" colSpan={2}></td>
                          <td className="p-3 text-sm text-right text-brand-primary">
                            ₹{trackingData.items?.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0) || trackingData.charges?.freightAmount || 0}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Freight Details */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Charges Summary</p>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Freight Charge:</span> <span className="font-medium">₹{trackingData.charges?.freightAmount || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Bilty Charge:</span> <span className="font-medium">₹{trackingData.charges?.biltyCharge || 0}</span></div>
                      {(trackingData.charges?.hamali > 0 || trackingData.charges?.surCharge > 0) && (
                        <div className="flex justify-between"><span className="text-gray-600">Hamali & Others:</span> <span className="font-medium">₹{(trackingData.charges?.hamali || 0) + (trackingData.charges?.surCharge || 0) + (trackingData.charges?.ddCharge || 0) + (trackingData.charges?.pf || 0)}</span></div>
                      )}
                      {trackingData.charges?.gstAmount > 0 && (
                        <div className="flex justify-between"><span className="text-gray-600">GST ({trackingData.charges?.gstRate || 5}%):</span> <span className="font-medium">₹{trackingData.charges?.gstAmount}</span></div>
                      )}
                      <div className="flex justify-between pt-3 mt-2 border-t border-gray-200 font-black text-brand-primary text-base">
                        <span>Total Amount:</span> 
                        <span>₹{trackingData.charges?.totalAmount || 0}</span>
                      </div>
                      <div className="mt-3 text-center bg-brand-primary/10 text-brand-primary p-2 rounded-lg text-sm font-bold uppercase tracking-wide">
                        Payment Mode: {trackingData.paymentCondition?.replace('_', ' ') || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Extra Details */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Reference Info</p>
                    <div className="space-y-4 text-sm">
                      <div><span className="text-gray-500 block text-xs mb-0.5">Invoice No:</span> <span className="font-semibold text-gray-900">{trackingData.invoiceNo || '-'}</span></div>
                      <div><span className="text-gray-500 block text-xs mb-0.5">E-Way Bill No:</span> <span className="font-semibold text-gray-900">{trackingData.ewayBillNo || '-'}</span></div>
                      <div><span className="text-gray-500 block text-xs mb-0.5">Private Marka:</span> <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{trackingData.pvtMarka || '-'}</span></div>
                      <div><span className="text-gray-500 block text-xs mb-0.5">Delivery Type:</span> <span className="font-semibold text-gray-900">{trackingData.deliveryType || 'Godown Delivery'}</span></div>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}

export default function PublicTrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div>}>
      <TrackBookingContent />
    </Suspense>
  );
}
