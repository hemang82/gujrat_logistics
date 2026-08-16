'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, FileText, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Play } from 'lucide-react';

export default function EwayBillTesterPage() {
  const [logistics, setLogistics] = useState<any[]>([]);
  const [selectedLogisticId, setSelectedLogisticId] = useState('');
  const [gstin, setGstin] = useState('');
  const [ewayBillNumber, setEwayBillNumber] = useState('');
  
  const [isLoadingLogistics, setIsLoadingLogistics] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Fetch logistics companies to populate select dropdown
  useEffect(() => {
    fetch('/api/admin/logistics?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setLogistics(data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching logistics:', err);
        toast.error('Failed to load logistics companies');
      })
      .finally(() => {
        setIsLoadingLogistics(false);
      });
  }, []);

  // Autofill GSTIN when a company is selected
  const handleLogisticChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedLogisticId(id);
    const selected = logistics.find((l) => l._id === id);
    if (selected) {
      // Prioritize GST number, then fallback to PAN or transporter ID
      setGstin(selected.gstNumber || selected.transporterId || '');
    } else {
      setGstin('');
    }
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);
    setTestError(null);

    if (!gstin.trim()) {
      toast.error('Please enter a GSTIN or Transporter ID.');
      return;
    }
    if (!ewayBillNumber.trim() || ewayBillNumber.length !== 12) {
      toast.error('E-Way Bill Number must be exactly 12 digits.');
      return;
    }

    setIsTesting(true);

    try {
      const response = await fetch('/api/admin/ewaybills/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstin: gstin.trim().toUpperCase(),
          ewayBillNumber: ewayBillNumber.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult(data.data);
        toast.success('E-Way Bill details fetched successfully!');
      } else {
        setTestError(data.error || 'Failed to fetch E-Way Bill details.');
        toast.error('Diagnostics failed.');
      }
    } catch (err: any) {
      setTestError(err.message || 'An error occurred.');
      toast.error('Failed to run diagnostics.');
    } finally {
      setIsTesting(false);
    }
  };

  // Helper to determine if EWB is assigned to the selected company
  const checkTransporterMatch = () => {
    if (!testResult) return null;
    const ewbTransporter = (testResult.transporterId || '').trim().toUpperCase();
    const ewbGstin = (testResult.gstinNo || '').trim().toUpperCase();
    const cleanGstin = gstin.trim().toUpperCase();

    // Check if entered GST matches EWB's transporter, consignor or consignee
    const isTransporter = ewbTransporter === cleanGstin || ewbGstin === cleanGstin;
    const isConsignor = (testResult.fromGstin || '').trim().toUpperCase() === cleanGstin;
    const isConsignee = (testResult.toGstin || '').trim().toUpperCase() === cleanGstin;

    if (isTransporter) {
      return { match: true, text: 'Authorized: This GSTIN is listed as the primary Transporter on this E-Way Bill.' };
    }
    if (isConsignor) {
      return { match: true, text: 'Authorized: This GSTIN is listed as the Consignor (Sender) on this E-Way Bill.' };
    }
    if (isConsignee) {
      return { match: true, text: 'Authorized: This GSTIN is listed as the Consignee (Receiver) on this E-Way Bill.' };
    }

    return { 
      match: false, 
      text: `Mismatch Warning: This E-Way Bill belongs to Transporter "${ewbTransporter || 'N/A'}" (GSTIN: ${ewbGstin || 'N/A'}). It is NOT assigned to the entered GSTIN "${cleanGstin}".`
    };
  };

  const authStatus = checkTransporterMatch();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-primary" />
          E-Way Bill Tester & Diagnostics
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Troubleshoot GST API connections. Test E-Way Bill fetches using any logistics company's credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form Column */}
        <Card className="border-gray-200 shadow-sm lg:col-span-1 h-fit">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold text-gray-800 uppercase tracking-wide">Test Configuration</CardTitle>
            <CardDescription className="text-xs">Setup details for the connectivity test.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <form onSubmit={handleTest} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">1. Select Logistic Company (Autofill)</Label>
                {isLoadingLogistics ? (
                  <div className="h-10 flex items-center justify-center border rounded-lg bg-gray-50"><Loader2 className="w-4 h-4 animate-spin text-brand-primary" /></div>
                ) : (
                  <select
                    value={selectedLogisticId}
                    onChange={handleLogisticChange}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">-- Choose Company --</option>
                    {logistics.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">2. GSTIN / Transporter ID <span className="text-red-500">*</span></Label>
                <Input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 24AAXFG0652R1ZO"
                  maxLength={15}
                  className="h-10 text-sm rounded-lg border-gray-200 uppercase font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">3. E-Way Bill Number <span className="text-red-500">*</span></Label>
                <Input
                  value={ewayBillNumber}
                  onChange={(e) => setEwayBillNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="Enter 12-digit EWB No."
                  maxLength={12}
                  className="h-10 text-sm rounded-lg border-gray-200 font-mono"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isTesting}
                className="w-full h-11 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                {isTesting ? 'Testing Connection...' : 'Run Connectivity Test'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results/Diagnostics Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Initial State */}
          {!testResult && !testError && !isTesting && (
            <Card className="border-dashed border-2 border-gray-200 shadow-none bg-gray-50/50 py-16 text-center">
              <CardContent className="flex flex-col items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                <p className="font-bold text-gray-600 text-sm">No Test Run Yet</p>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Fill in the configuration details on the left and click "Run Connectivity Test" to fetch live government E-Way Bill data.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isTesting && (
            <Card className="border-gray-200 shadow-sm py-16 text-center">
              <CardContent className="flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
                <p className="font-bold text-gray-800 text-sm">Establishing Secure API Connection</p>
                <p className="text-xs text-gray-400 mt-1">
                  Querying NIC E-Way Bill Portal via Masters India API. Please wait...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Error Banner */}
          {testError && (
            <Card className="border-red-200 bg-red-50/50 shadow-sm">
              <CardContent className="p-5 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-800 text-sm">Diagnostics Failed / Connection Error</h3>
                  <p className="text-xs text-red-700 mt-2 font-medium bg-white border border-red-200 p-3 rounded-lg font-mono whitespace-pre-wrap leading-relaxed">
                    {testError}
                  </p>
                  <p className="text-xs text-red-600 mt-3">
                    💡 **Common Solutions:**<br />
                    1. Double check if the **GSTIN** is entered correctly and has authorized API credentials.<br />
                    2. Check if the **E-Way Bill Number** is valid and assigned to this GSTIN.<br />
                    3. The government servers might be experiencing high latency or downtime.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Banner & Data Display */}
          {testResult && (
            <div className="space-y-6">
              {/* Status Banner */}
              <Card className="border-green-200 bg-green-50/50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-800 text-sm">API Connection Healthy</h3>
                    <p className="text-xs text-green-700 mt-0.5">E-Way Bill successfully retrieved from NIC Portal.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Authorization / Transporter Check */}
              {authStatus && (
                <Card className={`border ${authStatus.match ? 'border-teal-200 bg-teal-50/20' : 'border-amber-200 bg-amber-50/30'}`}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${authStatus.match ? 'text-teal-600' : 'text-amber-600'}`} />
                    <div>
                      <h4 className={`font-bold text-xs uppercase tracking-wide ${authStatus.match ? 'text-teal-800' : 'text-amber-800'}`}>
                        Assignment Verification
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${authStatus.match ? 'text-teal-700' : 'text-amber-700'}`}>
                        {authStatus.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details Display */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="py-3.5 border-b border-gray-100">
                  <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">E-Way Bill Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-2 p-3.5 text-xs">
                      <span className="font-bold text-gray-500">E-Way Bill Number:</span>
                      <span className="font-bold text-gray-900 font-mono">{testResult.ewbNo}</span>
                    </div>
                    <div className="grid grid-cols-2 p-3.5 text-xs">
                      <span className="font-bold text-gray-500">Generation Date & Status:</span>
                      <span className="font-medium text-gray-900">
                        {testResult.ewayBillDate} | <span className={`font-bold uppercase ${testResult.status === 'ACT' ? 'text-green-600' : 'text-red-500'}`}>{testResult.status === 'ACT' ? 'Active' : testResult.status || 'N/A'}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-3.5 text-xs">
                      <span className="font-bold text-gray-500">Valid Upto / Distance:</span>
                      <span className="font-medium text-gray-900">{testResult.validUpto} ({testResult.actualDist || 0} km)</span>
                    </div>
                    <div className="grid grid-cols-2 p-3.5 text-xs">
                      <span className="font-bold text-gray-500">From / Consignor:</span>
                      <span className="font-medium text-gray-900">{testResult.fromTrdName} (GST: {testResult.fromGstin})</span>
                    </div>
                    <div className="grid grid-cols-2 p-3.5 text-xs">
                      <span className="font-bold text-gray-500">To / Consignee:</span>
                      <span className="font-medium text-gray-900">{testResult.toTrdName} (GST: {testResult.toGstin})</span>
                    </div>
                    <div className="grid grid-cols-2 p-3.5 text-xs">
                      <span className="font-bold text-gray-500">Item Name / Value:</span>
                      <span className="font-medium text-gray-900">{testResult.mainHsnDesc || 'N/A'} (₹{testResult.totInvValue || 0})</span>
                    </div>
                    <div className="grid grid-cols-2 p-3.5 text-xs">
                      <span className="font-bold text-gray-500">Vehicle / Transporter:</span>
                      <span className="font-medium text-gray-900 font-mono">
                        {testResult.vehicleListDetails?.[0]?.vehicleNo || 'NO VEHICLE'} | Trans ID: {testResult.transporterId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Raw JSON Toggle */}
              <Card className="border-gray-200 shadow-sm">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-700 text-xs uppercase"
                >
                  <span>Raw API Response Data</span>
                  {showRawJson ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                {showRawJson && (
                  <CardContent className="p-4 pt-0 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                    <pre className="text-[11px] font-mono p-3 bg-white border rounded-lg overflow-x-auto text-gray-700 max-h-96 leading-relaxed">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
