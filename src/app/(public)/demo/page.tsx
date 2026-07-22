'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function DemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    fleetSize: '1-10',
    painPoint: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/public/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Thank you! Our team will contact you shortly.');
      setFormData({ name: '', companyName: '', phone: '', fleetSize: '1-10', painPoint: '' });
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-brand-primary-dark p-8 text-center text-white">
            <h1 className="text-3xl font-extrabold mb-2">Book a Free Demo</h1>
            <p className="text-brand-primary-light">See how LogiMaster can digitize your transport business today.</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold">Your Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12" placeholder="Rahul Patel" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Company Name</Label>
                <Input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="h-12" placeholder="Shreeji Transport" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Phone Number</Label>
                <Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12" placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Fleet Size</Label>
                <select 
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  value={formData.fleetSize}
                  onChange={e => setFormData({...formData, fleetSize: e.target.value})}
                >
                  <option value="1-10">1 - 10 Vehicles</option>
                  <option value="11-50">11 - 50 Vehicles</option>
                  <option value="50+">50+ Vehicles</option>
                  <option value="Broker">Broker / No Vehicles</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Biggest Pain Point?</Label>
                <select 
                  required
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  value={formData.painPoint}
                  onChange={e => setFormData({...formData, painPoint: e.target.value})}
                >
                  <option value="" disabled>Select a challenge...</option>
                  <option value="Accounting & Pending Payments">Accounting & Pending Payments</option>
                  <option value="Manual LR/Challan Entry">Manual LR/Challan Entry</option>
                  <option value="E-way Bill Generation">E-way Bill Generation</option>
                  <option value="Driver/Fleet Tracking">Driver/Fleet Tracking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Button disabled={loading} type="submit" className="w-full h-14 text-lg font-bold bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl">
                {loading ? 'Submitting...' : 'Request Demo'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
