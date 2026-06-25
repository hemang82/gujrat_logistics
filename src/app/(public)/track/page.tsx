'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, CheckCircle2, Truck, PackageCheck, Clock, FileText } from 'lucide-react';

export default function TrackPage() {
  const [lrNumber, setLrNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lrNumber.trim()) return;
    
    setIsTracking(true);
    setError('');
    setTrackingData(null);
    
    try {
      const res = await fetch(`/api/public/track?lrNumber=${encodeURIComponent(lrNumber)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to track shipment');
      } else {
        setTrackingData(data);
      }
    } catch (err) {
      setError('An error occurred while tracking.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-brand-bg min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary mb-4">Track Your Shipment</h1>
          <p className="text-brand-text-secondary text-lg">
            Enter your LR number to get real-time status updates on your cargo.
          </p>
        </div>

        <Card className="shadow-lg border-none mb-12">
          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  value={lrNumber}
                  onChange={(e) => setLrNumber(e.target.value)}
                  placeholder="Enter LR Number (e.g. LR-123456)" 
                  className="pl-10 h-14 text-lg bg-gray-50 rounded-xl"
                  required
                />
              </div>
              <Button type="submit" disabled={isTracking} className="h-14 px-10 text-lg bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl">
                {isTracking ? 'Searching...' : 'Track Now'}
              </Button>
            </form>
            {error && <p className="mt-4 text-center text-red-500 font-medium">{error}</p>}
          </CardContent>
        </Card>

        {trackingData && (
          <Card className="shadow-md border border-gray-100">
            <CardHeader className="bg-gray-50 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Tracking Result for: <span className="text-brand-primary">{trackingData.lrNumber}</span></CardTitle>
                <div className="bg-brand-info/10 text-brand-info px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 capitalize">
                  <Clock className="w-4 h-4" /> {trackingData.status.replace('_', ' ')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-6 md:left-[50%] top-0 bottom-0 w-0.5 bg-gray-200 md:-ml-[1px]"></div>
                
                <div className="flex flex-col gap-8">
                  {trackingData.trackingHistory.map((step: any, index: number) => {
                    const isLast = index === trackingData.trackingHistory.length - 1;
                    
                    return (
                      <div key={index} className="relative flex items-center md:justify-center">
                        <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block">
                          <h4 className={`font-bold text-lg text-brand-text-primary capitalize`}>{step.status.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-500">{new Date(step.timestamp).toLocaleString('en-IN')}</p>
                          {step.location && <p className="text-xs text-gray-400 mt-1">{step.location}</p>}
                        </div>
                        
                        <div className={`z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white ${isLast ? 'bg-brand-info text-white ring-4 ring-brand-info/20' : 'bg-brand-success text-white'}`}>
                          {step.status === 'pending' && <FileText className="w-5 h-5" />}
                          {step.status === 'picked_up' && <PackageCheck className="w-5 h-5" />}
                          {step.status === 'in_transit' && <Truck className="w-5 h-5" />}
                          {step.status === 'out_for_delivery' && <MapPin className="w-5 h-5" />}
                          {step.status === 'delivered' && <CheckCircle2 className="w-5 h-5" />}
                        </div>

                        <div className="w-full pl-6 md:w-1/2 md:pl-12 md:hidden">
                          <h4 className={`font-bold text-lg text-brand-text-primary capitalize`}>{step.status.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-500">{new Date(step.timestamp).toLocaleString('en-IN')}</p>
                          {step.location && <p className="text-xs text-gray-400 mt-1">{step.location}</p>}
                        </div>
                        <div className="hidden md:block md:w-1/2 md:pl-12"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
