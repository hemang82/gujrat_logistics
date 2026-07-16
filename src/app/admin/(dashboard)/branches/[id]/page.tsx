'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Edit2, MapPin, Phone, Mail, FileText, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function ViewBranchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [branch, setBranch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBranch() {
      try {
        const res = await fetch(`/api/admin/branches/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setBranch(data);
      } catch (error) {
        toast.error('Could not load branch details');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchBranch();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading branch details...</div>;
  }

  if (!branch) {
    return (
      <div className="p-8 text-center text-gray-500 space-y-4">
        <p>Branch not found.</p>
        <Button onClick={() => router.push('/admin/branches')}>Back to Branches</Button>
      </div>
    );
  }

  return (
    <div className="w-full pb-8 space-y-5">
      <div className="mb-4 flex justify-between items-center bg-white p-3.5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">{branch.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{branch.state} Branch Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/admin/branches')} 
            className="h-9 px-3 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <Link href={`/admin/branches/${id}/edit`}>
            <Button 
              type="button" 
              className="h-9 px-3.5 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Info Card */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden lg:col-span-1">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3 px-4">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              General Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">Address</span>
                <p className="text-sm font-medium text-gray-800">{branch.address || 'N/A'}</p>
                {branch.pincode && <span className="text-xs text-gray-500 mt-0.5 block">PinCode: {branch.pincode}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">Contact Phone</span>
                <p className="text-sm font-medium text-gray-800">{branch.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">Email</span>
                <p className="text-sm font-medium text-gray-800 break-all">{branch.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">GST / Tax Number</span>
                <p className="text-sm font-bold text-gray-800 uppercase">{branch.gstNumber || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Operational Configurations Card */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden lg:col-span-2 space-y-6 bg-white">
          
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 border-b pb-2">
              Operational Configuration
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">Agent Name</span>
                <p className="text-sm font-bold text-gray-800">{branch.agent?.name || branch.agent || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">Booking / Inward</span>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary mt-1 inline-block">
                  {branch.bookingInward === 'B' ? 'Booking Only' : branch.bookingInward === 'I' ? 'Inward Only' : 'Both (B/I)'}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">Distance (KM)</span>
                <p className="text-sm font-bold text-gray-800">{branch.distance || 0} KM</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase block font-semibold">Direct Data</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {branch.directData === 'Yes' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-bold uppercase">Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 font-bold uppercase">Disabled</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 border-b pb-2">
              Financial Commissions & Rates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-xs text-gray-400 uppercase block font-semibold">Commission</span>
                <div className="text-lg font-extrabold text-gray-800">₹{branch.commiAmount?.toFixed(2) || '0.00'}</div>
                {branch.commiBasis && <span className="text-[9px] text-gray-500 uppercase block">Basis: {branch.commiBasis}</span>}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-xs text-gray-400 uppercase block font-semibold">Delivery Charge (D.C.)</span>
                <div className="text-lg font-extrabold text-gray-800">₹{branch.dcAmount?.toFixed(2) || '0.00'}</div>
                {branch.dcBasis && <span className="text-[9px] text-gray-500 uppercase block">Basis: {branch.dcBasis}</span>}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-xs text-gray-400 uppercase block font-semibold">Labour Charge (L.C.)</span>
                <div className="text-lg font-extrabold text-gray-800">₹{branch.lcAmount?.toFixed(2) || '0.00'}</div>
                {branch.lcBasis && <span className="text-[9px] text-gray-500 uppercase block">Basis: {branch.lcBasis}</span>}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-xs text-gray-400 uppercase block font-semibold">Branch Rate</span>
                <div className="text-lg font-extrabold text-gray-800">₹{branch.brnAmount?.toFixed(2) || '0.00'}</div>
                {branch.brnRateBasis && <span className="text-[9px] text-gray-500 uppercase block">Basis: {branch.brnRateBasis}</span>}
              </div>

            </div>
          </div>

        </Card>
      </div>
    </div>
  );
}
