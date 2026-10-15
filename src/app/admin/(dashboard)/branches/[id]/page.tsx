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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => router.push('/admin/branches')}
            variant="outline"
            className="h-9 w-9 p-0 rounded-lg shrink-0 text-slate-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900">{branch.name}</h1>
              <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                {branch.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {branch.city ? `${branch.city}, ` : ''}{branch.state} — Branch Details & Configuration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/branches/${id}/edit`}>
            <Button 
              type="button" 
              className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Edit2 className="w-4 h-4" /> Edit Branch
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Basic & Location Info */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden lg:col-span-1 bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
            <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center justify-between">
              <span>Basic & Location Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <span className="text-xs text-slate-400 uppercase block font-semibold">Location / Address</span>
                <p className="text-sm font-medium text-slate-800 leading-snug">
                  {branch.address ? branch.address : 'No street address specified'}
                </p>
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 mt-2">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">City / District</span>
                    <span className="font-bold text-slate-700">{branch.city || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">State</span>
                    <span className="font-bold text-slate-700">{branch.state || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">PinCode</span>
                    <span className="font-bold text-slate-700 font-mono">{branch.pincode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase text-[10px]">Branch Code</span>
                    <span className="font-bold text-brand-primary font-mono uppercase">{branch.code}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 uppercase block font-semibold">Contact Phone</span>
                <p className="text-sm font-medium text-slate-800">{branch.phone || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <Mail className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 uppercase block font-semibold">Email Address</span>
                <p className="text-sm font-medium text-slate-800 break-all">{branch.email || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <FileText className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 uppercase block font-semibold">GST / Tax Number</span>
                <p className="text-sm font-bold text-slate-800 uppercase font-mono">{branch.gstNumber || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Operational & Financial Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Operational Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase block font-semibold">Agent Name</span>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {typeof branch.agent === 'object' && branch.agent?.name ? branch.agent.name : (branch.agent || 'Direct Branch')}
                  </p>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase block font-semibold">Booking / Inward</span>
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary inline-block">
                    {branch.bookingInward === 'B' ? 'Booking Only' : branch.bookingInward === 'I' ? 'Inward Only' : 'Both (B/I)'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase block font-semibold">Distance (KM)</span>
                  <p className="text-sm font-bold text-slate-800">{branch.distance || 0} KM</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-[11px] text-slate-400 uppercase block font-semibold">Direct Data</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {branch.directData === 'Yes' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-bold uppercase">Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500 font-bold uppercase">No</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Financial Rates & Commissions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase block font-semibold">Commission</span>
                  <div className="text-lg font-extrabold text-slate-900">₹{Number(branch.commiAmount || 0).toFixed(2)}</div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Basis: <span className="text-slate-800">{branch.commiBasis || 'None'}</span>
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase block font-semibold">Delivery Charge (D.C.)</span>
                  <div className="text-lg font-extrabold text-slate-900">₹{Number(branch.dcAmount || 0).toFixed(2)}</div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Basis: <span className="text-slate-800">{branch.dcBasis || 'None'}</span>
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase block font-semibold">Labour Charge (L.C.)</span>
                  <div className="text-lg font-extrabold text-slate-900">₹{Number(branch.lcAmount || 0).toFixed(2)}</div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Basis: <span className="text-slate-800">{branch.lcBasis || 'None'}</span>
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase block font-semibold">Branch Rate</span>
                  <div className="text-lg font-extrabold text-slate-900">₹{Number(branch.brnAmount || 0).toFixed(2)}</div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Basis: <span className="text-slate-800">{branch.brnRateBasis || 'None'}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



