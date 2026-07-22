'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';
import { SearchSelect } from '@/components/ui/search-select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function EditChallanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getBranchLabel = (branchVal: any) => {
    if (!branchVal) return '';
    const valStr = (branchVal?._id || branchVal).toString();
    const match = branchesList.find(b => b.value === valStr);
    return match ? match.label : valStr;
  };
  
  // Lists loaded from APIs
  const [branchesList, setBranchesList] = useState<{ value: string; label: string }[]>([]);
  const [vehiclesList, setVehiclesList] = useState<{ value: string; label: string }[]>([]);
  const [driversList, setDriversList] = useState<{ value: string; label: string }[]>([]);
  const [agentsList, setAgentsList] = useState<{ value: string; label: string }[]>([]);

  // Challan Form State
  const [formData, setFormData] = useState({
    branch: '',
    challanNumber: '',
    challanDate: '',
    allBranchwise: '',
    bookingCrossing: 'Booking',
    selectiveDefault: 'Selective',
    lrToBranch: '',
    truckNo: '',
    agent: '',
    memoDestinationBranch: '',
    driverName: '',
    truckFreight: '0',
    advanceAmount: '0',
    commission: '0',
    remark: '',
    status: 'pending'
  });

  // LR Scanning Row State
  const [scanGrNo, setScanGrNo] = useState('');
  const [scannedLr, setScannedLr] = useState<any>(null);
  const [pendingLrs, setPendingLrs] = useState<any[]>([]);
  const [selectedLrIds, setSelectedLrIds] = useState<Record<string, boolean>>({});

  // Autocomplete suggestion states
  const [allPendingBookings, setAllPendingBookings] = useState<any[]>([]);
  const [lrSuggestions, setLrSuggestions] = useState<any[]>([]);
  const [showLrDropdown, setShowLrDropdown] = useState(false);
  const [lrHighlightIndex, setLrHighlightIndex] = useState(-1);

  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const agentSuggestions = agentsList.filter(a => a.value.toLowerCase().includes(formData.agent.toLowerCase()));

  const [truckNoSearch, setTruckNoSearch] = useState('');
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const truckSuggestions = vehiclesList.filter(v => v.label.toLowerCase().includes(truckNoSearch.toLowerCase()));

  const [memoSearch, setMemoSearch] = useState('');
  const [showMemoDropdown, setShowMemoDropdown] = useState(false);
  const memoSuggestions = branchesList.filter(b => b.label.toLowerCase().includes(memoSearch.toLowerCase()));

  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const driverSuggestions = driversList.filter(d => d.label.toLowerCase().includes(driverSearch.toLowerCase()));

  // Derived state for checked LRs
  const loadedLrs = pendingLrs.filter(item => selectedLrIds[item._id]);

  // Load dropdown lists and fetch existing challan
  useEffect(() => {
    async function loadResourcesAndChallan() {
      try {
        // 1. Fetch Branches
        const branchesRes = await fetch('/api/admin/branches?limit=100');
        const branchesData = await branchesRes.json();
        if (branchesData?.branches) {
          setBranchesList(branchesData.branches.map((b: any) => ({
            value: b._id,
            label: `${b.name} (${b.code})`
          })));
        }

        // 2. Fetch Vehicles
        const vehiclesRes = await fetch('/api/admin/vehicles?limit=100');
        const vehiclesData = await vehiclesRes.json();
        if (vehiclesData && Array.isArray(vehiclesData)) {
          setVehiclesList(vehiclesData.map((v: any) => ({
            value: v._id,
            label: v.vehicleNumber
          })));
        }

        // 3. Fetch Drivers
        const driversRes = await fetch('/api/admin/drivers?limit=100');
        const driversData = await driversRes.json();
        if (driversData && Array.isArray(driversData)) {
          setDriversList(driversData.map((d: any) => ({
            value: d._id,
            label: d.name
          })));
        }

        // 4. Fetch Agents
        const agentsRes = await fetch('/api/admin/agents?limit=100');
        const agentsData = await agentsRes.json();
        if (agentsData && Array.isArray(agentsData)) {
          setAgentsList(agentsData.map((a: any) => ({
            value: a.name,
            label: a.name
          })));
        }

        // 5. Fetch Challan Details
        const res = await fetch(`/api/admin/challans/${id}`);
        if (!res.ok) throw new Error('Challan not found');
        const data = await res.json();

        setFormData({
          branch: data.branch?._id || data.branch || '',
          challanNumber: data.challanNumber || '',
          challanDate: data.challanDate ? new Date(data.challanDate).toISOString().slice(0, 10) : '',
          allBranchwise: data.allBranchwise || 'All',
          bookingCrossing: data.bookingCrossing || 'Booking',
          selectiveDefault: data.selectiveDefault || 'Selective',
          lrToBranch: data.lrToBranch?._id || data.lrToBranch || '',
          truckNo: data.truckNo?._id || data.truckNo || '',
          agent: data.agent || '',
          memoDestinationBranch: data.memoDestinationBranch?._id || data.memoDestinationBranch || '',
          driverName: data.driverName?._id || data.driverName || '',
          truckFreight: data.truckFreight?.toString() || '0',
          advanceAmount: data.advanceAmount?.toString() || '0',
          commission: data.commission?.toString() || '0',
          remark: data.remark || '',
          status: data.status || 'pending'
        });

        // Initialize Search inputs from populated or ID values
        const truckId = data.truckNo?._id || data.truckNo;
        if (truckId && Array.isArray(vehiclesData)) {
          const matchedTruck = vehiclesData.find((v: any) => v._id === truckId);
          if (matchedTruck) setTruckNoSearch(matchedTruck.vehicleNumber);
        }

        const memoBranchId = data.memoDestinationBranch?._id || data.memoDestinationBranch;
        if (memoBranchId && branchesData?.branches) {
          const matchedBranch = branchesData.branches.find((b: any) => b._id === memoBranchId);
          if (matchedBranch) setMemoSearch(`${matchedBranch.name} (${matchedBranch.code})`);
        }

        const driverId = data.driverName?._id || data.driverName;
        if (driverId && Array.isArray(driversData)) {
          const matchedDriver = driversData.find((d: any) => d._id === driverId);
          if (matchedDriver) setDriverSearch(matchedDriver.name);
        }

        // Initialize loaded LRs from populated challan details
        if (data.bookings) {
          const lrs = data.bookings.map((booking: any) => {
            const packages = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
            const weight = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
            const freight = booking.charges?.freightAmount || 0;
            const totalAmount = booking.charges?.totalAmount || freight;
            return {
              _id: booking._id,
              lrNumber: booking.lrNumber,
              bookingDate: booking.bookingDate,
              consignorName: booking.consignor?.name || 'N/A',
              consigneeName: booking.consignee?.name || 'N/A',
              pkg: packages,
              weight: weight,
              freight: freight,
              totalAmount: totalAmount,
              charges: booking.charges || {},
              destinationBranch: booking.destinationBranch || 'N/A'
            };
          });
          setPendingLrs(lrs);
          setSelectedLrIds(prev => {
            const copy = { ...prev };
            lrs.forEach((item: any) => {
              copy[item._id] = true;
            });
            return copy;
          });
        }
      } catch (error) {
        toast.error('Could not load Challan details.');
      } finally {
        setIsFetching(false);
      }
    }

    if (id) loadResourcesAndChallan();

    // Fetch all pending bookings for LR Autocomplete
    fetch('/api/admin/bookings?status=pending&limit=1000')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.bookings || []);
        setAllPendingBookings(list);
      })
      .catch(err => console.error('Error fetching pending bookings', err));
  }, [id]);

  // Auto-load LRs when lrToBranch, allBranchwise, or allPendingBookings changes
  useEffect(() => {
    async function autoLoadBranchBookings() {
      if (!formData.allBranchwise) {
        setPendingLrs([]);
        return;
      }
      if (formData.allBranchwise === 'Branchwise' && !formData.lrToBranch) {
        setPendingLrs([]);
        return;
      }

      if (allPendingBookings.length > 0) {
        // Filter bookings matching destinationBranch with lrToBranch (ObjectId comparison)
        const matchedBookings = allPendingBookings.filter((b: any) => {
          if (formData.allBranchwise === 'Branchwise') {
            const destId = b.destinationBranch?._id || b.destinationBranch;
            const targetId = formData.lrToBranch;
            return (
              destId && targetId && destId.toString() === targetId.toString() &&
              b.status === 'pending'
            );
          }
          return b.status === 'pending';
        });

        if (matchedBookings.length === 0) {
          const branchLabel = branchesList.find(b => b.value === formData.lrToBranch)?.label || formData.lrToBranch;
          const emptyMsg = formData.allBranchwise === 'Branchwise'
            ? `No pending bookings found for branch: ${branchLabel}`
            : `No pending bookings found in database.`;
          toast.info(emptyMsg);
          return;
        }

        const mapped = matchedBookings.map((b: any) => {
          const packages = b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
          const weight = b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
          const freight = b.charges?.freightAmount || 0;
          const totalAmount = b.charges?.totalAmount || freight;
          return {
            _id: b._id,
            lrNumber: b.lrNumber,
            bookingDate: b.bookingDate,
            consignorName: b.consignor?.name || 'N/A',
            consigneeName: b.consignee?.name || 'N/A',
            pkg: packages,
            weight: weight,
            freight: freight,
            totalAmount: totalAmount,
            charges: b.charges || {},
            destinationBranch: b.destinationBranch || 'N/A'
          };
        });

        setPendingLrs(mapped);
        setSelectedLrIds(prev => {
          const newSelections = { ...prev };
          mapped.forEach((item: any) => {
            newSelections[item._id] = true;
          });
          return newSelections;
        });

        const msg = formData.allBranchwise === 'Branchwise' 
          ? `Automatically loaded ${matchedBookings.length} LRs for branch: ${formData.lrToBranch}`
          : `Automatically loaded all ${matchedBookings.length} pending LRs`;
        toast.success(msg);
      }
    }

    autoLoadBranchBookings();
  }, [formData.lrToBranch, formData.allBranchwise, allPendingBookings]);

  // Clear lrToBranch when All is selected
  useEffect(() => {
    if (formData.allBranchwise === 'All') {
      setFormData(prev => ({ ...prev, lrToBranch: '' }));
    }
  }, [formData.allBranchwise]);

  // Sync selected LRs with Default/Selective mode
  useEffect(() => {
    if (formData.selectiveDefault === 'Default' && pendingLrs.length > 0) {
      setSelectedLrIds(prev => {
        const copy = { ...prev };
        pendingLrs.forEach(item => {
          copy[item._id] = true;
        });
        return copy;
      });
    }
  }, [formData.selectiveDefault, pendingLrs]);

  // Clear loadedLrs error when items are loaded
  useEffect(() => {
    if (loadedLrs.length > 0 && errors.loadedLrs) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.loadedLrs;
        return newErrors;
      });
    }
  }, [loadedLrs, errors.loadedLrs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (['truckFreight', 'advanceAmount', 'commission'].includes(name)) {
      value = value.replace(/[^0-9.]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Scan LR No fetch logic (Add button)
  const handleScanLr = async () => {
    if (!scanGrNo.trim()) return;

    // If scannedLr is already populated from dropdown selection, add directly
    if (scannedLr) {
      if (pendingLrs.some(item => item._id === scannedLr._id) && selectedLrIds[scannedLr._id]) {
        toast.warning(`LR No: ${scannedLr.lrNumber} is already added to this Challan.`);
        setScanGrNo('');
        setScannedLr(null);
        return;
      }

      setPendingLrs(prev => [...prev, scannedLr]);
      setSelectedLrIds(prev => ({ ...prev, [scannedLr._id]: true }));
      toast.success(`LR No: ${scannedLr.lrNumber} added to loading list.`);
      setScanGrNo('');
      setScannedLr(null);
      return;
    }

    // Fallback: fetch from API if typed manually without selecting from dropdown
    try {
      const res = await fetch(`/api/admin/bookings?search=${encodeURIComponent(scanGrNo.trim())}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const bookingsList = Array.isArray(data) ? data : (data.bookings || []);

      const searchVal = scanGrNo.trim().replace(/^lr-/i, '').toLowerCase();
      const booking = bookingsList.find((b: any) => String(b.lrNumber || '').toLowerCase() === searchVal);

      if (!booking) {
        toast.error(`LR Number: ${scanGrNo} not found in database.`);
        setScannedLr(null);
        return;
      }

      if (booking.status === 'delivered') {
        toast.error(`LR No: ${scanGrNo} is already delivered.`);
        setScannedLr(null);
        return;
      }

      // Check if already in the loaded table
      if (pendingLrs.some(item => item._id === booking._id)) {
        if (!selectedLrIds[booking._id]) {
          setSelectedLrIds(prev => ({ ...prev, [booking._id]: true }));
          toast.success(`LR No: ${booking.lrNumber} selected in loading list.`);
          setScanGrNo('');
          setScannedLr(null);
          return;
        }
        toast.warning(`LR No: ${scanGrNo} is already added to this Challan.`);
        setScannedLr(null);
        return;
      }

      const packages = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
      const weight = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
      const freight = booking.charges?.freightAmount || 0;
      const totalAmount = booking.charges?.totalAmount || freight;

      const newScanned = {
        _id: booking._id,
        lrNumber: booking.lrNumber,
        bookingDate: booking.bookingDate,
        consignorName: booking.consignor?.name || 'N/A',
        consigneeName: booking.consignee?.name || 'N/A',
        pkg: packages,
        weight: weight,
        freight: freight,
        totalAmount: totalAmount,
        charges: booking.charges || {},
        destinationBranch: booking.destinationBranch || 'N/A'
      };

      setPendingLrs(prev => [...prev, newScanned]);
      setSelectedLrIds(prev => ({ ...prev, [booking._id]: true }));
      setScanGrNo('');
      setScannedLr(null);
      toast.success(`LR No: ${booking.lrNumber} added to loading list.`);
    } catch (err) {
      toast.error('Error scanning LR number.');
    }
  };

  const handleSelectLrSuggestion = (booking: any) => {
    if (booking.status === 'delivered') {
      toast.error(`LR No: ${booking.lrNumber} is already delivered.`);
      setScanGrNo('');
      setShowLrDropdown(false);
      return;
    }

    if (pendingLrs.some(item => item._id === booking._id) && selectedLrIds[booking._id]) {
      toast.warning(`LR No: ${booking.lrNumber} is already added.`);
      setScanGrNo('');
      setScannedLr(null);
      setShowLrDropdown(false);
      return;
    }

    const packages = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || 1;
    const weight = booking.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || 0;
    const freight = booking.charges?.freightAmount || 0;
    const totalAmount = booking.charges?.totalAmount || freight;

    const newScanned = {
      _id: booking._id,
      lrNumber: booking.lrNumber,
      bookingDate: booking.bookingDate,
      consignorName: booking.consignor?.name || 'N/A',
      consigneeName: booking.consignee?.name || 'N/A',
      pkg: packages,
      weight: weight,
      freight: freight,
      totalAmount: totalAmount,
      charges: booking.charges || {},
      destinationBranch: booking.destinationBranch || 'N/A'
    };

    setScanGrNo(booking.lrNumber);
    setScannedLr(newScanned);
    setShowLrDropdown(false);
  };

  const handleRemoveLr = (id: string) => {
    setPendingLrs(prev => prev.filter(item => item._id !== id));
    setSelectedLrIds(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    toast.info('LR removed from loading list.');
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-[11px] font-semibold mt-1">{errors[field]}</p>;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.challanNumber) newErrors.challanNumber = 'Please enter Challan Number';
    if (!formData.challanDate) newErrors.challanDate = 'Please enter Challan Date';
    if (!formData.truckNo) newErrors.truckNo = 'Please select a valid Truck No.';
    if (loadedLrs.length === 0) newErrors.loadedLrs = 'Please load at least one LR No';
    
    if (formData.agent && !agentsList.some(a => a.value === formData.agent)) {
      newErrors.agent = 'Please select a valid agent from the list';
    }
    if (memoSearch && !formData.memoDestinationBranch) {
      newErrors.memoDestinationBranch = 'Please select a valid Memo Destination Branch';
    }
    if (driverSearch && !formData.driverName) {
      newErrors.driverName = 'Please select a valid Driver';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const payload = {
      ...formData,
      bookings: loadedLrs.map(b => b._id),
      truckFreight: parseFloat(formData.truckFreight) || 0,
      advanceAmount: parseFloat(formData.advanceAmount) || 0,
      commission: parseFloat(formData.commission) || 0
    };

    try {
      const response = await fetch(`/api/admin/challans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Challan updated successfully!');
        router.push('/admin/challans');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update Challan: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating Challan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-8 text-center text-gray-500">Loading Challan details...</div>;
  }

  return (
    <div className="w-full pb-8">
      {/* Header Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="h-9 w-9 p-0 rounded-lg shrink-0 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Edit Challan #{getBranchLabel(formData.branch).match(/\(([^)]+)\)/)?.[1] || 'GL'}-{formData.challanNumber}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Modify truck dispatch manifest and load contents</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Card: Fillup Information */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Fillup Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            {/* Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Branch</Label>
                <Input name="branch" value={formData.branch} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Ch No</Label>
                <Input name="challanNumber" value={formData.challanNumber} readOnly className="h-10 text-sm bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg font-bold" />
              </div>
              <div className="space-y-1 sm:col-span-2 md:col-span-1.5">
                <Label className="text-xs font-bold text-gray-600 uppercase">Challan Date <span className="text-red-500">*</span></Label>
                <DatePicker 
                  value={formData.challanDate} 
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, challanDate: date }));
                    if (errors.challanDate) {
                      const newErrors = { ...errors };
                      delete newErrors.challanDate;
                      setErrors(newErrors);
                    }
                  }}
                  className={errors.challanDate ? 'border-red-500 !h-10' : 'border-gray-200 !h-10'}
                />
                {renderError('challanDate')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">All / Branchwise</Label>
                <ThemeSelect
                  name="allBranchwise"
                  value={formData.allBranchwise}
                  onChange={handleChange as any}
                  options={[
                    { value: '', label: 'Select Loading Type' },
                    { value: 'All', label: 'All' },
                    { value: 'Branchwise', label: 'Branchwise' }
                  ]}
                  className="flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Booking / Crossing</Label>
                <ThemeSelect
                  name="bookingCrossing"
                  value={formData.bookingCrossing}
                  onChange={handleChange as any}
                  options={[
                    { value: 'Booking', label: 'Booking' },
                    { value: 'Crossing', label: 'Crossing' }
                  ]}
                  disabled
                  className="flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Selective / Default</Label>
                <ThemeSelect
                  name="selectiveDefault"
                  value={formData.selectiveDefault}
                  onChange={handleChange as any}
                  options={[
                    { value: 'Selective', label: 'Selective' },
                    { value: 'Default', label: 'Default' }
                  ]}
                  className="flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">LR To Branch</Label>
                <ThemeSelect
                  name="lrToBranch"
                  value={formData.lrToBranch}
                  onChange={handleChange as any}
                  options={[{ value: '', label: 'Select Branch' }, ...branchesList]}
                  disabled={formData.allBranchwise === 'All'}
                  className={`flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none ${
                    formData.allBranchwise === 'All'
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                      : ''
                  }`}
                />
              </div>
            </div>

            {/* Row 2: LR Scanning */}
            <div className="border-t border-b border-gray-100 py-3.5 bg-gray-50/50 -mx-4 px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-3 items-end">
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs font-bold text-brand-primary uppercase">LR No:</Label>
                  <div className="relative">
                    <div className="flex gap-1.5">
                      <Input 
                        value={scanGrNo} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setScanGrNo(val);
                          if (val.trim().length > 0) {
                            const filtered = allPendingBookings.filter((b: any) =>
                              String(b.lrNumber || '').toLowerCase().includes(val.trim().toLowerCase()) &&
                              b.status === 'pending'
                            ).slice(0, 10);
                            setLrSuggestions(filtered);
                            setShowLrDropdown(filtered.length > 0);
                            setLrHighlightIndex(-1);
                          } else {
                            setLrSuggestions([]);
                            setShowLrDropdown(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (showLrDropdown && lrSuggestions.length > 0) {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setLrHighlightIndex(prev => prev < lrSuggestions.length - 1 ? prev + 1 : 0);
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setLrHighlightIndex(prev => prev > 0 ? prev - 1 : lrSuggestions.length - 1);
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              if (lrHighlightIndex >= 0 && lrHighlightIndex < lrSuggestions.length) {
                                handleSelectLrSuggestion(lrSuggestions[lrHighlightIndex]);
                              } else if (lrSuggestions.length > 0) {
                                handleSelectLrSuggestion(lrSuggestions[0]);
                              } else {
                                handleScanLr();
                              }
                            } else if (e.key === 'Tab') {
                              if (lrSuggestions.length > 0) {
                                e.preventDefault();
                                const idx = lrHighlightIndex >= 0 ? lrHighlightIndex : 0;
                                handleSelectLrSuggestion(lrSuggestions[idx]);
                              }
                            } else if (e.key === 'Escape') {
                              setShowLrDropdown(false);
                            }
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            handleScanLr();
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowLrDropdown(false), 200)}
                        onFocus={() => {
                          if (scanGrNo.trim().length > 0 && lrSuggestions.length > 0) {
                            setShowLrDropdown(true);
                          }
                        }}
                        placeholder="e.g. LR-1001" 
                        className="h-10 text-sm border-brand-primary/40 focus-visible:ring-brand-primary/50 rounded-lg font-bold"
                        autoComplete="off"
                      />
                      <Button 
                        type="button"
                        onClick={handleScanLr}
                        className="h-10 px-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-bold text-xs"
                      >
                        Add
                      </Button>
                    </div>
                    {/* LR Autocomplete Dropdown */}
                    {showLrDropdown && lrSuggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-12 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto font-normal">
                        {lrSuggestions.map((suggestion: any, index: number) => (
                          <div
                            key={suggestion._id}
                            onMouseDown={() => handleSelectLrSuggestion(suggestion)}
                            className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 ${
                              index === lrHighlightIndex ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-bold">{suggestion.lrNumber}</span>
                            <span className="text-gray-400 ml-2 text-xs">
                              {suggestion.consignor?.name || 'N/A'} → {suggestion.consignee?.name || 'N/A'}
                            </span>
                            <span className="text-gray-400 ml-2 text-xs">
                              ({getBranchLabel(suggestion.destinationBranch) || 'N/A'})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {renderError('loadedLrs')}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs font-bold text-gray-600 uppercase">Consignor Name:</Label>
                  <Input readOnly value={scannedLr?.consignorName || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Consignee Name:</Label>
                  <Input readOnly value={scannedLr?.consigneeName || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1 md:col-span-0.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Pkg:</Label>
                  <Input readOnly value={scannedLr?.pkg || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1 md:col-span-0.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Weight:</Label>
                  <Input readOnly value={scannedLr?.weight || ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Freight:</Label>
                  <Input readOnly value={scannedLr?.freight ? `₹${scannedLr.freight}` : ''} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg font-bold" />
                </div>
                <div className="space-y-1 md:col-span-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Destination Branch:</Label>
                  <Input readOnly value={getBranchLabel(scannedLr?.destinationBranch)} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <Label className="text-xs font-bold text-gray-600 uppercase">Sr No:</Label>
                  <Input readOnly value={loadedLrs.length + 1} className="h-10 text-sm bg-gray-100 text-gray-500 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Loaded LRs Table List */}
            {pendingLrs.length > 0 && (
              <>
              <div className="border border-gray-100 rounded-lg overflow-hidden mt-2 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input 
                          type="checkbox"
                          checked={pendingLrs.length > 0 && pendingLrs.every(item => selectedLrIds[item._id])}
                          disabled={formData.selectiveDefault === 'Default'}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedLrIds(prev => {
                              const copy = { ...prev };
                              pendingLrs.forEach(item => {
                                copy[item._id] = checked;
                              });
                              return copy;
                            });
                          }}
                          className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer disabled:cursor-not-allowed"
                        />
                      </th>
                      <th className="p-3 w-12 text-center">Sr.</th>
                      <th className="p-3">LR Number</th>
                      <th className="p-3">Consignor</th>
                      <th className="p-3">Consignee</th>
                      <th className="p-3 text-center">Packages</th>
                      <th className="p-3 text-center">Weight (KG)</th>
                      <th className="p-3 text-center">Freight</th>
                      <th className="p-3 text-center">Total Amt</th>
                      <th className="p-3">Destination</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                    {pendingLrs.map((item, index) => {
                      const isChecked = !!selectedLrIds[item._id];
                      return (
                        <tr 
                          key={item._id} 
                          className={`hover:bg-gray-50/50 transition-colors ${!isChecked ? 'opacity-50 line-through text-gray-400 bg-gray-50/30' : ''}`}
                        >
                          <td className="p-3 w-10 text-center">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              disabled={formData.selectiveDefault === 'Default'}
                              onChange={(e) => {
                                setSelectedLrIds(prev => ({
                                  ...prev,
                                  [item._id]: e.target.checked
                                }));
                              }}
                              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="p-3 text-center text-gray-400">{index + 1}</td>
                          <td className={`p-3 font-bold ${isChecked ? 'text-brand-primary' : 'text-gray-400'}`}>#{item.lrNumber}</td>
                          <td className="p-3">{item.consignorName}</td>
                          <td className="p-3">{item.consigneeName}</td>
                          <td className="p-3 text-center">{item.pkg}</td>
                          <td className="p-3 text-center">{item.weight} KG</td>
                          <td className="p-3 text-center">₹{item.freight}</td>
                          <td className="p-3 text-center font-bold relative group">
                            <span className="cursor-help border-b border-dotted border-gray-400">₹{item.totalAmount}</span>
                            <div className="absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-gray-900 text-white text-xs rounded shadow-lg p-2.5 right-1/2 translate-x-1/2 bottom-full mb-2 w-48 transition-all pointer-events-none text-left font-normal">
                              <div className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1">Amount Breakdown</div>
                              {(Number(item.charges?.freightAmount) > 0 || Number(item.freight) > 0) && <div className="flex justify-between py-0.5"><span>Freight:</span> <span>₹{item.charges?.freightAmount || item.freight}</span></div>}
                              {Number(item.charges?.pf) > 0 && <div className="flex justify-between py-0.5"><span>PF:</span> <span>₹{item.charges.pf}</span></div>}
                              {Number(item.charges?.hamali) > 0 && <div className="flex justify-between py-0.5"><span>Labour:</span> <span>₹{item.charges.hamali}</span></div>}
                              {Number(item.charges?.biltyCharge) > 0 && <div className="flex justify-between py-0.5"><span>Bilty:</span> <span>₹{item.charges.biltyCharge}</span></div>}
                              {Number(item.charges?.ddCharge) > 0 && <div className="flex justify-between py-0.5"><span>DD Charge:</span> <span>₹{item.charges.ddCharge}</span></div>}
                              {Number(item.charges?.gstAmount) > 0 && <div className="flex justify-between py-0.5 text-brand-secondary"><span>GST:</span> <span>₹{item.charges.gstAmount}</span></div>}
                              <div className="flex justify-between py-0.5 mt-1 border-t border-gray-700 pt-1 font-bold"><span>Total:</span> <span>₹{item.totalAmount}</span></div>
                              
                              {/* Tooltip arrow */}
                              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-solid border-t-gray-900 border-t-[6px] border-x-transparent border-x-[6px] border-b-0"></div>
                            </div>
                          </td>
                          <td className="p-3 uppercase text-brand-primary">{getBranchLabel(item.destinationBranch)}</td>
                          <td className="p-3 text-center">
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveLr(item._id)}
                              className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-brand-primary/5 text-gray-700 font-bold border-t-2 border-brand-primary/20">
                    <tr>
                      <td colSpan={5} className="p-3 text-right uppercase text-xs">Total LRs: <span className="text-brand-primary text-sm">{loadedLrs.length}</span></td>
                      <td className="p-3 text-center text-brand-primary text-sm">{loadedLrs.reduce((acc, curr) => acc + (Number(curr.pkg) || 0), 0)}</td>
                      <td className="p-3 text-center text-brand-primary text-sm">{loadedLrs.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)} KG</td>
                      <td className="p-3 text-center text-brand-primary text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (Number(curr.freight) || 0), 0)}</td>
                      <td className="p-3 text-center text-brand-primary text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </>
            )}

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Truck No. <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {truckNoSearch && truckSuggestions.length > 0 && truckSuggestions[0].label.toLowerCase().startsWith(truckNoSearch.toLowerCase()) && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-medium text-sm h-10 w-full overflow-hidden whitespace-nowrap bg-transparent rounded-lg">
                      <span className="opacity-0">{truckSuggestions[0].label.slice(0, truckNoSearch.length)}</span>
                      <span>{truckSuggestions[0].label.slice(truckNoSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={truckNoSearch}
                    onChange={(e) => {
                      setTruckNoSearch(e.target.value);
                      setFormData(prev => ({ ...prev, truckNo: '' })); // clear ID when typing
                      if (errors.truckNo) {
                        const newErrors = { ...errors };
                        delete newErrors.truckNo;
                        setErrors(newErrors);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && truckNoSearch && truckSuggestions.length > 0 && truckSuggestions[0].label.toLowerCase().startsWith(truckNoSearch.toLowerCase())) {
                        e.preventDefault();
                        setTruckNoSearch(truckSuggestions[0].label);
                        setFormData(prev => ({ ...prev, truckNo: truckSuggestions[0].value }));
                        setShowTruckDropdown(false);
                      }
                    }}
                    onFocus={() => setShowTruckDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTruckDropdown(false), 200)}
                    placeholder="Search Truck..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.truckNo ? 'border-red-500' : 'border-gray-200'}`}
                    autoComplete="off"
                  />
                  {renderError('truckNo')}
                  
                  {showTruckDropdown && truckSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto font-normal">
                      {truckSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onMouseDown={() => {
                            setTruckNoSearch(suggestion.label);
                            setFormData(prev => ({ ...prev, truckNo: suggestion.value }));
                            setShowTruckDropdown(false);
                          }}
                          className="px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                        >
                          <span className="font-bold">{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Agent</Label>
                <div className="relative">
                  {formData.agent && agentSuggestions.length > 0 && agentSuggestions[0].value.toLowerCase().startsWith(formData.agent.toLowerCase()) && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-medium text-sm h-10 w-full overflow-hidden whitespace-nowrap bg-transparent rounded-lg">
                      <span className="opacity-0">{agentSuggestions[0].value.slice(0, formData.agent.length)}</span>
                      <span>{agentSuggestions[0].value.slice(formData.agent.length)}</span>
                    </div>
                  )}
                  <Input
                    name="agent"
                    value={formData.agent}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && formData.agent && agentSuggestions.length > 0 && agentSuggestions[0].value.toLowerCase().startsWith(formData.agent.toLowerCase())) {
                        e.preventDefault();
                        setFormData(prev => ({ ...prev, agent: agentSuggestions[0].value }));
                        setShowAgentDropdown(false);
                      }
                    }}
                    onFocus={() => {
                      if (formData.agent.length >= 0) setShowAgentDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowAgentDropdown(false), 200)}
                    placeholder="Search Agent..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.agent ? 'border-red-500' : 'border-gray-200'}`}
                    autoComplete="off"
                  />
                  {renderError('agent')}
                  
                  {showAgentDropdown && agentSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto font-normal">
                      {agentSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, agent: suggestion.value }));
                            setShowAgentDropdown(false);
                          }}
                          className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 hover:bg-gray-50`}
                        >
                          <span className="font-bold">{suggestion.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Memo Destination Branch</Label>
                <div className="relative">
                  {memoSearch && memoSuggestions.length > 0 && memoSuggestions[0].label.toLowerCase().startsWith(memoSearch.toLowerCase()) && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-medium text-sm h-10 w-full overflow-hidden whitespace-nowrap bg-transparent rounded-lg">
                      <span className="opacity-0">{memoSuggestions[0].label.slice(0, memoSearch.length)}</span>
                      <span>{memoSuggestions[0].label.slice(memoSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={memoSearch}
                    onChange={(e) => {
                      setMemoSearch(e.target.value);
                      setFormData(prev => ({ ...prev, memoDestinationBranch: '' }));
                      if (errors.memoDestinationBranch) {
                        const newErrors = { ...errors };
                        delete newErrors.memoDestinationBranch;
                        setErrors(newErrors);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && memoSearch && memoSuggestions.length > 0 && memoSuggestions[0].label.toLowerCase().startsWith(memoSearch.toLowerCase())) {
                        e.preventDefault();
                        setMemoSearch(memoSuggestions[0].label);
                        setFormData(prev => ({ ...prev, memoDestinationBranch: memoSuggestions[0].value }));
                        setShowMemoDropdown(false);
                      }
                    }}
                    onFocus={() => setShowMemoDropdown(true)}
                    onBlur={() => setTimeout(() => setShowMemoDropdown(false), 200)}
                    placeholder="Search Memo Destination..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.memoDestinationBranch ? 'border-red-500' : 'border-gray-200'}`}
                    autoComplete="off"
                  />
                  {renderError('memoDestinationBranch')}
                  
                  {showMemoDropdown && memoSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto font-normal">
                      {memoSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onMouseDown={() => {
                            setMemoSearch(suggestion.label);
                            setFormData(prev => ({ ...prev, memoDestinationBranch: suggestion.value }));
                            setShowMemoDropdown(false);
                          }}
                          className="px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                        >
                          <span className="font-bold">{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Driver Name</Label>
                <div className="relative">
                  {driverSearch && driverSuggestions.length > 0 && driverSuggestions[0].label.toLowerCase().startsWith(driverSearch.toLowerCase()) && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-medium text-sm h-10 w-full overflow-hidden whitespace-nowrap bg-transparent rounded-lg">
                      <span className="opacity-0">{driverSuggestions[0].label.slice(0, driverSearch.length)}</span>
                      <span>{driverSuggestions[0].label.slice(driverSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={driverSearch}
                    onChange={(e) => {
                      setDriverSearch(e.target.value);
                      setFormData(prev => ({ ...prev, driverName: '' }));
                      if (errors.driverName) {
                        const newErrors = { ...errors };
                        delete newErrors.driverName;
                        setErrors(newErrors);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && driverSearch && driverSuggestions.length > 0 && driverSuggestions[0].label.toLowerCase().startsWith(driverSearch.toLowerCase())) {
                        e.preventDefault();
                        setDriverSearch(driverSuggestions[0].label);
                        setFormData(prev => ({ ...prev, driverName: driverSuggestions[0].value }));
                        setShowDriverDropdown(false);
                      }
                    }}
                    onFocus={() => setShowDriverDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDriverDropdown(false), 200)}
                    placeholder="Search Driver..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.driverName ? 'border-red-500' : 'border-gray-200'}`}
                    autoComplete="off"
                  />
                  {renderError('driverName')}
                  
                  {showDriverDropdown && driverSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto font-normal">
                      {driverSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onMouseDown={() => {
                            setDriverSearch(suggestion.label);
                            setFormData(prev => ({ ...prev, driverName: suggestion.value }));
                            setShowDriverDropdown(false);
                          }}
                          className="px-3 py-2 cursor-pointer text-sm border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                        >
                          <span className="font-bold">{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Challan Status</Label>
                <ThemeSelect
                  name="status"
                  value={formData.status}
                  onChange={handleChange as any}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'in_transit', label: 'In Transit' },
                    { value: 'delivered', label: 'Delivered' }
                  ]}
                  className="flex h-10 w-full rounded-lg border px-3 text-sm focus-visible:outline-none"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Truck Freight</Label>
                <Input name="truckFreight" value={formData.truckFreight} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Advance Amount</Label>
                <Input name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-600 uppercase">Commission</Label>
                <Input name="commission" value={formData.commission} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg" />
              </div>
            </div>

            {/* Row 5 */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-600 uppercase">Remark</Label>
              <Input name="remark" value={formData.remark} onChange={handleChange} placeholder="Challan loading remarks" className="h-10 text-sm rounded-lg" />
            </div>

          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex gap-2.5">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm shadow-sm"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button 
            type="button" 
            onClick={() => router.back()}
            className="h-10 px-6 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm"
          >
            Cancel
          </Button>
        </div>

      </form>
    </div>
  );
}
