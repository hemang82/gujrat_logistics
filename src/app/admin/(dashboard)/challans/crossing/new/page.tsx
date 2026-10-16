'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';
import { SearchSelect } from '@/components/ui/search-select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Plus, Trash2, X, Loader2, Truck, User, Building2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';
import { AGENT_TYPES } from '@/config/constants';

export default function AddCrossingPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userBranch = user?.branch || '';

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canAdd = user?.role !== 'superadmin' && user?.role !== 'logistic' && user?.permissions?.challans?.canAdd !== false;

  useEffect(() => {
    if (user && !canAdd) {
      toast.error('You do not have permission to create Challans');
      router.push('/admin/challans/crossing');
    }
  }, [user, canAdd, router]);

  const getBranchLabel = (branchVal: any) => {
    if (!branchVal) return '';
    const valStr = (branchVal?._id || branchVal).toString();
    const match = branchesList.find(b => b.value === valStr);
    return match ? match.label : valStr;
  };
  
  // Lists loaded from APIs
  const [branchesList, setBranchesList] = useState<{ value: string; label: string }[]>([]);
  const [vehiclesList, setVehiclesList] = useState<{ value: string; label: string; status?: string; assignedDriverId?: string; driverName?: string; driverPhone?: string }[]>([]);
  const [driversList, setDriversList] = useState<{ value: string; label: string; phone?: string; status?: string }[]>([]);
  const [agentsList, setAgentsList] = useState<{ value: string; label: string }[]>([]);

  // Challan Form State
  const [formData, setFormData] = useState({
    branch: userBranch,
    challanNumber: '',
    challanDate: new Date().toISOString().slice(0, 10),
    allBranchwise: '',
    bookingCrossing: 'Crossing',
    selectiveDefault: 'Selective',
    lrToBranch: '',
    truckNo: '',
    agent: '',
    memoDestinationBranch: '',
    driverName: '',
    truckFreight: '0',
    advanceAmount: '0',
    commission: '0',
    remark: ''
  });

  const [driverPhone, setDriverPhone] = useState('');

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

  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const driverSuggestions = driversList.filter(d => d.label.toLowerCase().includes(driverSearch.toLowerCase()));

  const [lrToBranchSearch, setLrToBranchSearch] = useState('');

  const [agentHighlightIndex, setAgentHighlightIndex] = useState(-1);
  const [truckHighlightIndex, setTruckHighlightIndex] = useState(-1);
  const [driverHighlightIndex, setDriverHighlightIndex] = useState(-1);

  // Reset highlight index when search terms change
  useEffect(() => { setAgentHighlightIndex(-1); }, [formData.agent]);
  useEffect(() => { setTruckHighlightIndex(-1); }, [truckNoSearch]);
  useEffect(() => { setDriverHighlightIndex(-1); }, [driverSearch]);

  // Quick Add Vehicle Modal State
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isVehicleSubmitting, setIsVehicleSubmitting] = useState(false);
  const [vehicleErrors, setVehicleErrors] = useState<Record<string, string>>({});
  const [newVehicleData, setNewVehicleData] = useState({
    vehicleNumber: '',
    type: 'Open',
    capacity: '',
    make: '',
    model: '',
    status: 'available',
    rcNumber: '',
    rcExpiry: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    nationalPermitExpiry: '',
    ownerName: '',
    ownerPhone: '',
    branch: ''
  });

  // Quick Add Driver Modal State
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isDriverSubmitting, setIsDriverSubmitting] = useState(false);
  const [driverErrors, setDriverErrors] = useState<Record<string, string>>({});
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    licenseNumber: '',
    licenseExpiry: '',
    aadharNumber: '',
    status: 'available',
    address: '',
    branch: ''
  });

  // Quick Add Agent Modal State
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isAgentSubmitting, setIsAgentSubmitting] = useState(false);
  const [agentErrors, setAgentErrors] = useState<Record<string, string>>({});
  const [newAgentData, setNewAgentData] = useState({
    name: '',
    phone: '',
    email: '',
    agentType: 'Transporter',
    address: '',
    gstNumber: '',
    openingBalance: '0',
    branch: ''
  });

  // Derived state for checked LRs
  const loadedLrs = pendingLrs.filter(item => selectedLrIds[item._id]);

  // Sync user branch from store when it loads
  useEffect(() => {
    if (userBranch && !formData.branch) {
      setFormData(prev => ({ ...prev, branch: userBranch }));
    }
  }, [userBranch]);

  // Auto-load next challan number based on selected branch
  useEffect(() => {
    if (!formData.branch) return;
    fetch(`/api/admin/challans?limit=1000&branch=${formData.branch}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.challans && data.challans.length > 0) {
          let maxNum = 800;
          data.challans.forEach((c: any) => {
            if (c.challanNumber) {
              const num = parseInt(String(c.challanNumber).replace(/\D/g, ''), 10);
              if (!isNaN(num) && num > maxNum) maxNum = num;
            }
          });
          setFormData(prev => ({ ...prev, challanNumber: (maxNum + 1).toString() }));
        } else {
          setFormData(prev => ({ ...prev, challanNumber: '801' }));
        }
      })
      .catch(() => setFormData(prev => ({ ...prev, challanNumber: '801' })));
  }, [formData.branch]);

  // Load Dropdowns (Branches, Vehicles, Drivers, Agents, Bookings)
  useEffect(() => {
    fetch('/api/admin/branches?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && data.branches) {
          const list = data.branches.map((b: any) => ({
            value: b._id,
            label: b.name
          }));
          setBranchesList(list);
        }
      });

    // 3. Load Vehicles
    fetch('/api/admin/vehicles?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const list = data.map((v: any) => ({
            value: v._id,
            label: v.vehicleNumber,
            status: v.status,
            assignedDriverId: v.assignedDriver?._id || v.assignedDriver || '',
            driverName: v.assignedDriver?.name || '',
            driverPhone: v.assignedDriver?.phone || ''
          }));
          setVehiclesList(list);
        }
      });

    // 4. Load Drivers
    fetch('/api/admin/drivers?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const list = data.map((d: any) => ({
            value: d._id,
            label: d.name,
            phone: d.phone || '',
            status: d.status
          }));
          setDriversList(list);
        }
      });

    // 5. Load Agents
    fetch('/api/admin/agents?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          const list = data.map((a: any) => ({
            value: a.name,
            label: a.name
          }));
          setAgentsList(list);
        }
      });
    // 5. Load All Pending Bookings for LR Autocomplete
    fetch('/api/admin/bookings?status=pending&limit=1000')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.bookings || []);
        setAllPendingBookings(list);
      })
      .catch(err => console.error('Error fetching pending bookings', err));
  }, []);

  // Auto-load LRs when Default mode is active and branch filter changes
  useEffect(() => {
    async function autoLoadBranchBookings() {
      // If Selective mode is active, do not auto-load all pending LRs
      if (formData.selectiveDefault !== 'Default') {
        return;
      }

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
          setPendingLrs([]);
          return;
        }

        // Map to loaded LRs table structure
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
            paymentCondition: b.paymentCondition,
            charges: b.charges || {},
            destinationBranch: b.destinationBranch || 'N/A'
          };
        });

        // Update loaded LRs table (overwriting previous branch bookings)
        setPendingLrs(mapped);
        setSelectedLrIds(prev => {
          const newSelections = { ...prev };
          mapped.forEach((item: any) => {
            newSelections[item._id] = true;
          });
          return newSelections;
        });

        const branchNameStr = getBranchLabel(formData.lrToBranch) || formData.lrToBranch;
        const msg = formData.allBranchwise === 'Branchwise' 
          ? `Automatically loaded ${matchedBookings.length} LRs for branch: ${branchNameStr}`
          : `Automatically loaded all ${matchedBookings.length} pending LRs`;
        toast.success(msg);
      }
    }

    autoLoadBranchBookings();
  }, [formData.lrToBranch, formData.allBranchwise, formData.selectiveDefault, allPendingBookings]);

  // Clear lrToBranch when All is selected
  useEffect(() => {
    if (formData.allBranchwise === 'All') {
      setFormData(prev => ({ ...prev, lrToBranch: '' }));
    }
  }, [formData.allBranchwise]);

  // When switching from Default to Selective or vice-versa
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

  // LR Scanner fetch logic (Add button)
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

      if (booking.status === 'in_transit' || booking.status === 'delivered') {
        toast.error(`LR No: ${scanGrNo} is already in transit or delivered.`);
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

      // Parse item packages and weight sum
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
        paymentCondition: booking.paymentCondition,
        charges: booking.charges || {},
        destinationBranch: booking.destinationBranch || 'N/A'
      };

      // Add to loaded LRs table
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
    if (booking.status === 'in_transit' || booking.status === 'delivered') {
      toast.error(`LR No: ${booking.lrNumber} is already in transit or delivered.`);
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
      paymentCondition: booking.paymentCondition,
      charges: booking.charges || {},
      destinationBranch: booking.destinationBranch || 'N/A'
    };

    // Fill the LR input and the preview details (Consignor, Consignee, Pkg, Weight)
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
    if (loadedLrs.length === 0) newErrors.loadedLrs = 'Please load at least one LR No';
    if (formData.agent && !agentsList.some(a => a.value === formData.agent)) {
      newErrors.agent = 'Please select a valid agent from the list';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields.');
      return false;
    }

    return true;
  };

  // Keyboard Shortcut: Ctrl + Enter to submit Crossing Memo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('crossing-challan-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      const response = await fetch('/api/admin/challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Crossing Challan created successfully!');
        router.push('/admin/challans/crossing');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create Crossing Challan: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while saving Challan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      allBranchwise: '',
      bookingCrossing: 'Crossing',
      selectiveDefault: 'Selective',
      lrToBranch: '',
      truckNo: '',
      agent: '',
      memoDestinationBranch: '',
      driverName: '',
      truckFreight: '0',
      advanceAmount: '0',
      commission: '0',
      remark: ''
    }));
    setPendingLrs([]);
    setSelectedLrIds({});
    setScanGrNo('');
    setScannedLr(null);
    toast.info('Form reset completed.');
  };

  // Quick Add Vehicle Submit Handler
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const vErrors: Record<string, string> = {};

    if (!newVehicleData.vehicleNumber.trim()) {
      vErrors.vehicleNumber = 'Please enter Vehicle Number';
    }
    if (!newVehicleData.type) {
      vErrors.type = 'Please select Vehicle Type';
    }
    if (!newVehicleData.capacity.trim()) {
      vErrors.capacity = 'Please enter Capacity';
    }
    if (newVehicleData.ownerPhone && !/^[6-9]\d{9}$/.test(newVehicleData.ownerPhone)) {
      vErrors.ownerPhone = 'Invalid 10-digit phone number';
    }

    setVehicleErrors(vErrors);
    if (Object.keys(vErrors).length > 0) {
      toast.error('Please fix vehicle validation errors');
      return;
    }

    setIsVehicleSubmitting(true);
    try {
      const payload = {
        ...newVehicleData,
        vehicleNumber: newVehicleData.vehicleNumber.trim().toUpperCase(),
        branch: newVehicleData.branch || formData.branch || userBranch
      };

      const res = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add vehicle');
      }

      const created = await res.json();
      toast.success(`Vehicle ${created.vehicleNumber || payload.vehicleNumber} added successfully!`);

      // Add to local vehiclesList & automatically select in Challan
      const newVehicleOption = {
        value: created._id,
        label: created.vehicleNumber || payload.vehicleNumber,
        status: created.status || 'available',
        assignedDriverId: '',
        driverName: '',
        driverPhone: ''
      };

      setVehiclesList(prev => [newVehicleOption, ...prev]);
      setTruckNoSearch(newVehicleOption.label);
      setFormData(prev => ({ ...prev, truckNo: newVehicleOption.value }));

      // Reset and close modal
      setNewVehicleData({
        vehicleNumber: '',
        type: 'Open',
        capacity: '',
        make: '',
        model: '',
        status: 'available',
        rcNumber: '',
        rcExpiry: '',
        insuranceExpiry: '',
        fitnessExpiry: '',
        nationalPermitExpiry: '',
        ownerName: '',
        ownerPhone: '',
        branch: ''
      });
      setVehicleErrors({});
      setIsVehicleModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error creating vehicle');
    } finally {
      setIsVehicleSubmitting(false);
    }
  };

  // Quick Add Driver Submit Handler
  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const dErrors: Record<string, string> = {};

    if (!newDriverData.name.trim()) {
      dErrors.name = 'Please enter Driver Name';
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!newDriverData.phone.trim()) {
      dErrors.phone = 'Please enter Primary Phone';
    } else if (!phoneRegex.test(newDriverData.phone)) {
      dErrors.phone = 'Invalid 10-digit number';
    }
    if (newDriverData.alternatePhone && !phoneRegex.test(newDriverData.alternatePhone)) {
      dErrors.alternatePhone = 'Invalid 10-digit number';
    }
    if (!newDriverData.licenseNumber.trim()) {
      dErrors.licenseNumber = 'Please enter License Number';
    }

    setDriverErrors(dErrors);
    if (Object.keys(dErrors).length > 0) {
      toast.error('Please fix driver validation errors');
      return;
    }

    setIsDriverSubmitting(true);
    try {
      const payload = {
        ...newDriverData,
        name: newDriverData.name.trim(),
        licenseNumber: newDriverData.licenseNumber.trim().toUpperCase(),
        branch: newDriverData.branch || formData.branch || userBranch
      };

      const res = await fetch('/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add driver');
      }

      const created = await res.json();
      toast.success(`Driver ${created.name || payload.name} added successfully!`);

      // Add to local driversList & automatically select in Challan
      const newDriverOption = {
        value: created._id,
        label: created.name || payload.name,
        phone: created.phone || payload.phone,
        status: created.status || 'available'
      };

      setDriversList(prev => [newDriverOption, ...prev]);
      setDriverSearch(newDriverOption.label);
      setFormData(prev => ({ ...prev, driverName: newDriverOption.value }));

      // Reset and close modal
      setNewDriverData({
        name: '',
        phone: '',
        alternatePhone: '',
        licenseNumber: '',
        licenseExpiry: '',
        aadharNumber: '',
        status: 'available',
        address: '',
        branch: ''
      });
      setDriverErrors({});
      setIsDriverModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error creating driver');
    } finally {
      setIsDriverSubmitting(false);
    }
  };

  // Quick Add Agent Submit Handler
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const aErrors: Record<string, string> = {};

    if (!newAgentData.name.trim()) {
      aErrors.name = 'Please enter Agent Name';
    }
    if (!newAgentData.agentType) {
      aErrors.agentType = 'Please select Agent Type';
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!newAgentData.phone.trim()) {
      aErrors.phone = 'Please enter Contact Number';
    } else if (!phoneRegex.test(newAgentData.phone)) {
      aErrors.phone = 'Invalid 10-digit number';
    }
    if (newAgentData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAgentData.email)) {
        aErrors.email = 'Invalid email format';
      }
    }
    if (newAgentData.gstNumber) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(newAgentData.gstNumber)) {
        aErrors.gstNumber = 'Invalid 15-digit GST format';
      }
    }

    setAgentErrors(aErrors);
    if (Object.keys(aErrors).length > 0) {
      toast.error('Please fix agent validation errors');
      return;
    }

    setIsAgentSubmitting(true);
    try {
      const payload: any = {
        name: newAgentData.name.trim(),
        phone: newAgentData.phone.trim(),
        agentType: newAgentData.agentType,
        openingBalance: Number(newAgentData.openingBalance) || 0
      };

      if (newAgentData.email.trim()) payload.email = newAgentData.email.trim();
      if (newAgentData.address.trim()) payload.address = newAgentData.address.trim();
      if (newAgentData.gstNumber.trim()) payload.gstNumber = newAgentData.gstNumber.trim().toUpperCase();

      const targetBranch = newAgentData.branch || formData.branch || userBranch;
      if (targetBranch) payload.branch = targetBranch;

      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add agent');
      }

      const created = await res.json();
      const agentName = created.name || payload.name;
      toast.success(`Agent ${agentName} added successfully!`);

      // Add to local agentsList & automatically select in Challan
      const newOption = {
        value: agentName,
        label: agentName
      };

      setAgentsList(prev => [newOption, ...prev]);
      setFormData(prev => ({ ...prev, agent: newOption.value }));

      // Reset and close modal
      setNewAgentData({
        name: '',
        phone: '',
        email: '',
        agentType: 'Transporter',
        address: '',
        gstNumber: '',
        openingBalance: '0',
        branch: ''
      });
      setAgentErrors({});
      setIsAgentModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error creating agent');
    } finally {
      setIsAgentSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-4">
      {/* Compact Header Bar - Synced with LR Booking */}
      <div className="mb-2.5 flex items-center justify-between bg-white py-2 px-3.5 rounded-xl shadow-xs border border-slate-200/90">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg shrink-0 text-gray-600 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors border border-gray-200"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">Add New Crossing Memo</h1>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Load lorry receipts onto crossing transport sheet</p>
          </div>
        </div>
      </div>

      <form
        id="crossing-challan-form"
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const target = e.target as HTMLElement;
            if (e.ctrlKey || e.metaKey) {
              return;
            }
            if (target && target.tagName === 'TEXTAREA') {
              return;
            }
            e.preventDefault();
          }
        }}
        className="space-y-3"
      >
        
        {/* Unified Single Sheet Card Container */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 sm:p-5 relative z-10 !overflow-visible space-y-5">
          
          {/* Section 1: Fillup Information */}
          <div className="relative z-20 !overflow-visible">
            <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-100">
              <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
              <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                1. Fillup Information
              </span>
            </div>

            {/* Row 1: Primary Document Details (4 Balanced Columns) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Branch</Label>
                {userBranch ? (
                  <Input name="branch" value={user?.branchName || getBranchLabel(formData.branch) || formData.branch} readOnly disabled tabIndex={-1} className="h-9 text-sm bg-slate-100/70 text-slate-500 cursor-not-allowed select-none rounded-[8px] font-medium border border-[#64748b59]" />
                ) : (
                  <ThemeSelect
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange as any}
                    options={[
                      { value: '', label: 'Select Branch' },
                      ...branchesList
                    ]}
                    className="flex h-9 w-full rounded-[8px] border border-gray-200 px-3 text-sm focus-visible:outline-none"
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Challan number (CH Number)</Label>
                <Input name="challanNumber" value={formData.challanNumber} readOnly disabled tabIndex={-1} placeholder="e.g. 819" className="h-9 text-sm font-bold rounded-[8px] bg-slate-100/70 text-brand-primary/80 cursor-not-allowed select-none border border-[#64748b59]" />
                {renderError('challanNumber')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">LR Type</Label>
                <ThemeSelect
                  name="bookingCrossing"
                  value={formData.bookingCrossing}
                  onChange={handleChange as any}
                  options={[
                    { value: '', label: 'Select Type...' },
                    { value: 'Booking', label: 'Booking' },
                    { value: 'Crossing', label: 'Crossing' }
                  ]}
                  disabled
                  className="flex h-9 w-full rounded-[8px] border border-[#64748b59] px-3 text-sm focus-visible:outline-none bg-slate-100/70 text-slate-500 font-medium cursor-not-allowed select-none !opacity-100"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Challan Date <span className="text-red-500">*</span></Label>
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
                  className={`!h-9 rounded-[8px] text-sm ${errors.challanDate ? 'border-red-500' : 'border-gray-200'}`}
                />
                {renderError('challanDate')}
              </div>
            </div>

            {/* Row 2: Target & Loading Filter Controls (3 Proportional Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">All / Branchwise</Label>
                <ThemeSelect
                  name="allBranchwise"
                  value={formData.allBranchwise}
                  onChange={handleChange as any}
                  options={[
                    { value: '', label: 'Select Target...' },
                    { value: 'All', label: 'All Branches' },
                    { value: 'Branchwise', label: 'Specific Branch' }
                  ]}
                  className="flex h-9 w-full rounded-[8px] border border-gray-200 px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Adding Method</Label>
                <ThemeSelect
                  name="selectiveDefault"
                  value={formData.selectiveDefault}
                  onChange={handleChange as any}
                  options={[
                    { value: '', label: 'Select Method...' },
                    { value: 'Selective', label: 'Selective (Manual)' },
                    { value: 'Default', label: 'Default (Pending)' }
                  ]}
                  className="flex h-9 w-full rounded-[8px] border border-gray-200 px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">
                  LR To Branch
                </Label>
                <div className="relative">
                  <BranchAutocomplete
                    name="lrToBranch"
                    value={formData.lrToBranch}
                    onChange={handleChange as any}
                    options={branchesList}
                    placeholder={formData.allBranchwise === 'All' ? 'Disabled for All Branches' : 'Search LR to Branch...'}
                    disabled={formData.allBranchwise === 'All'}
                    className={formData.allBranchwise === 'All' ? 'bg-slate-100/70 text-slate-400 cursor-not-allowed select-none' : ''}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: LR Scanning / Manual Entry */}
          <div className="relative z-10 !overflow-visible pt-1">
            <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
                <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  2. Scan / Add Lorry Receipt
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {formData.selectiveDefault === 'Default' ? (
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Auto-Loaded (Default Mode)
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Scan or Type LR Number
                  </span>
                )}
              </div>
            </div>

            {/* Top Scanning Row: LR Search Input + Add Button */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <div className="sm:col-span-5 md:col-span-4 space-y-1">
                <Label className="text-xs font-bold text-slate-800">
                  LR Number <span className="text-red-500">*</span>
                </Label>
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
                            // On Tab, if a suggestion is active, fill it and let Tab focus + Add button
                            if (lrHighlightIndex >= 0 && lrHighlightIndex < lrSuggestions.length) {
                              handleSelectLrSuggestion(lrSuggestions[lrHighlightIndex]);
                            } else if (lrSuggestions.length > 0 && scanGrNo.trim().length > 0) {
                              handleSelectLrSuggestion(lrSuggestions[0]);
                            }
                            setShowLrDropdown(false);
                            // Do NOT preventDefault() so Tab naturally focuses the "+ Add" button!
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
                        const query = scanGrNo.trim().toLowerCase();
                        const filtered = allPendingBookings.filter((b: any) =>
                          b.status === 'pending' &&
                          (!query || String(b.lrNumber || '').toLowerCase().includes(query))
                        ).slice(0, 15);
                        setLrSuggestions(filtered);
                        setShowLrDropdown(filtered.length > 0);
                      }}
                      onClick={() => {
                        const query = scanGrNo.trim().toLowerCase();
                        const filtered = allPendingBookings.filter((b: any) =>
                          b.status === 'pending' &&
                          (!query || String(b.lrNumber || '').toLowerCase().includes(query))
                        ).slice(0, 15);
                        setLrSuggestions(filtered);
                        setShowLrDropdown(true);
                      }}
                      placeholder="Type or Scan LR Number..." 
                      className="h-9 text-sm border-[#64748b59] focus-visible:ring-brand-primary/50 rounded-[8px] font-medium"
                      autoComplete="off"
                    />
                    <Button 
                      type="button"
                      id="crossing-scan-lr-add-btn"
                      onClick={handleScanLr}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleScanLr();
                        }
                      }}
                      className="h-9 px-4 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-[8px] font-bold text-xs shadow-xs shrink-0 cursor-pointer"
                    >
                      + Add
                    </Button>
                  </div>
                  {/* LR Autocomplete Dropdown */}
                  {showLrDropdown && lrSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-16 mt-1 bg-white border border-[#64748b59] rounded-[8px] shadow-lg max-h-48 overflow-y-auto">
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

              {/* Scanned Preview Info Fields (Clean 6-part Grid) */}
              <div className="sm:col-span-7 md:col-span-8 grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-800">Consignor</Label>
                  <Input readOnly disabled tabIndex={-1} value={scannedLr?.consignorName || ''} placeholder="-" className="h-9 text-xs sm:text-sm bg-slate-100/70 text-slate-500 cursor-not-allowed select-none rounded-[8px] font-medium" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-800">Consignee</Label>
                  <Input readOnly disabled tabIndex={-1} value={scannedLr?.consigneeName || ''} placeholder="-" className="h-9 text-xs sm:text-sm bg-slate-100/70 text-slate-500 cursor-not-allowed select-none rounded-[8px] font-medium" />
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <Label className="text-xs font-bold text-slate-800">Pkg</Label>
                  <Input readOnly disabled tabIndex={-1} value={scannedLr?.pkg || ''} placeholder="0" className="h-9 text-xs sm:text-sm bg-slate-100/70 text-slate-500 cursor-not-allowed select-none rounded-[8px] font-medium text-center" />
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <Label className="text-xs font-bold text-slate-800">Weight</Label>
                  <Input readOnly disabled tabIndex={-1} value={scannedLr?.weight ? `${scannedLr.weight} kg` : ''} placeholder="0 kg" className="h-9 text-xs sm:text-sm bg-slate-100/70 text-slate-500 cursor-not-allowed select-none rounded-[8px] font-medium text-center" />
                </div>
              </div>
            </div>
          </div>

            {/* Loaded LRs Table List */}
            {pendingLrs.length > 0 && (
              <>
              <div className="overflow-x-auto border border-gray-100 rounded-lg overflow-hidden mt-2 bg-white min-h-[240px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-slate-700 font-semibold uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3 w-12 text-center">Sr.</th>
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
                      <th className="p-3">LR Number</th>
                      <th className="p-3">Consignor</th>
                      <th className="p-3">Consignee</th>
                      <th className="p-3 text-center">Packages</th>
                      <th className="p-3 text-center">Weight (KG)</th>
                      <th className="p-3 text-center">Freight</th>
                      <th className="p-3 text-center">To Pay</th>
                      <th className="p-3 text-center">Paid</th>
                      <th className="p-3 text-center">T.B.B</th>
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
                           className={`hover:bg-gray-50/50 transition-colors relative hover:z-50 ${!isChecked ? 'opacity-50 line-through text-gray-400 bg-gray-50/30' : ''}`}
                        >
                          <td className="p-3 text-center text-gray-500 font-bold">{index + 1}</td>
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
                          <td className={`p-3 font-bold ${isChecked ? 'text-brand-primary' : 'text-gray-400'}`}>LR- {item.lrNumber}</td>
                          <td className="p-3">{item.consignorName}</td>
                          <td className="p-3">{item.consigneeName}</td>
                          <td className="p-3 text-center">{item.pkg}</td>
                          <td className="p-3 text-center">{item.weight} KG</td>
                          <td className="p-3 text-center">₹{item.freight}</td>
                          <td className="p-3 text-center text-orange-600">
                            {item.paymentCondition === 'to_pay' ? (
                              <div className="relative group inline-block">
                                <span className="cursor-help border-b border-dotted border-orange-400">₹{item.totalAmount}</span>
                                <div className={`absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-gray-900 text-white text-xs rounded shadow-lg p-2.5 right-1/2 translate-x-1/2 transition-all pointer-events-none text-left font-normal ${
                                  index === pendingLrs.length - 1 ? 'bottom-full mb-1' : 'top-full mt-1'
                                }`}>
                                  <div className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1">Amount Breakdown</div>
                                  <div className="flex justify-between py-0.5"><span>Freight:</span> <span>₹{item.charges?.freightAmount || item.freight || 0}</span></div>
                                  <div className="flex justify-between py-0.5"><span>Labour:</span> <span>₹{item.charges?.hamali || 0}</span></div>
                                  <div className="flex justify-between py-0.5"><span>Bilty:</span> <span>₹{item.charges?.biltyCharge || 0}</span></div>
                                  {Number(item.charges?.pf) > 0 && <div className="flex justify-between py-0.5"><span>PF:</span> <span>₹{item.charges.pf}</span></div>}
                                  {Number(item.charges?.surCharge) > 0 && <div className="flex justify-between py-0.5"><span>Surcharge:</span> <span>₹{item.charges.surCharge}</span></div>}
                                  {Number(item.charges?.ddCharge) > 0 && <div className="flex justify-between py-0.5"><span>DD Charge:</span> <span>₹{item.charges.ddCharge}</span></div>}
                                  {Number(item.charges?.gstAmount) > 0 && <div className="flex justify-between py-0.5 text-brand-secondary"><span>GST:</span> <span>₹{item.charges.gstAmount}</span></div>}
                                  <div className="flex justify-between py-0.5 mt-1 border-t border-gray-700 pt-1 font-bold"><span>Total:</span> <span>₹{item.totalAmount}</span></div>
                                  {index === pendingLrs.length - 1 ? (
                                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-solid border-t-gray-900 border-t-[6px] border-x-transparent border-x-[6px] border-b-0"></div>
                                  ) : (
                                    <div className="absolute left-1/2 -top-1 -translate-x-1/2 border-solid border-b-gray-900 border-b-[6px] border-x-transparent border-x-[6px] border-t-0"></div>
                                  )}
                                </div>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-center text-emerald-600">
                            {item.paymentCondition === 'paid' ? (
                              <div className="relative group inline-block">
                                <span className="cursor-help border-b border-dotted border-emerald-400">₹{item.totalAmount}</span>
                                <div className={`absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-gray-900 text-white text-xs rounded shadow-lg p-2.5 right-1/2 translate-x-1/2 transition-all pointer-events-none text-left font-normal ${
                                  index === pendingLrs.length - 1 ? 'bottom-full mb-1' : 'top-full mt-1'
                                }`}>
                                  <div className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1">Amount Breakdown</div>
                                  <div className="flex justify-between py-0.5"><span>Freight:</span> <span>₹{item.charges?.freightAmount || item.freight || 0}</span></div>
                                  <div className="flex justify-between py-0.5"><span>Labour:</span> <span>₹{item.charges?.hamali || 0}</span></div>
                                  <div className="flex justify-between py-0.5"><span>Bilty:</span> <span>₹{item.charges?.biltyCharge || 0}</span></div>
                                  {Number(item.charges?.pf) > 0 && <div className="flex justify-between py-0.5"><span>PF:</span> <span>₹{item.charges.pf}</span></div>}
                                  {Number(item.charges?.surCharge) > 0 && <div className="flex justify-between py-0.5"><span>Surcharge:</span> <span>₹{item.charges.surCharge}</span></div>}
                                  {Number(item.charges?.ddCharge) > 0 && <div className="flex justify-between py-0.5"><span>DD Charge:</span> <span>₹{item.charges.ddCharge}</span></div>}
                                  {Number(item.charges?.gstAmount) > 0 && <div className="flex justify-between py-0.5 text-brand-secondary"><span>GST:</span> <span>₹{item.charges.gstAmount}</span></div>}
                                  <div className="flex justify-between py-0.5 mt-1 border-t border-gray-700 pt-1 font-bold"><span>Total:</span> <span>₹{item.totalAmount}</span></div>
                                  {index === pendingLrs.length - 1 ? (
                                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-solid border-t-gray-900 border-t-[6px] border-x-transparent border-x-[6px] border-b-0"></div>
                                  ) : (
                                    <div className="absolute left-1/2 -top-1 -translate-x-1/2 border-solid border-b-gray-900 border-b-[6px] border-x-transparent border-x-[6px] border-t-0"></div>
                                  )}
                                </div>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-center text-blue-600">
                            {item.paymentCondition === 'tbb' ? (
                              <div className="relative group inline-block">
                                <span className="cursor-help border-b border-dotted border-blue-400">₹{item.totalAmount}</span>
                                <div className={`absolute z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-gray-900 text-white text-xs rounded shadow-lg p-2.5 right-1/2 translate-x-1/2 transition-all pointer-events-none text-left font-normal ${
                                  index === pendingLrs.length - 1 ? 'bottom-full mb-1' : 'top-full mt-1'
                                }`}>
                                  <div className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1">Amount Breakdown</div>
                                  <div className="flex justify-between py-0.5"><span>Freight:</span> <span>₹{item.charges?.freightAmount || item.freight || 0}</span></div>
                                  <div className="flex justify-between py-0.5"><span>Labour:</span> <span>₹{item.charges?.hamali || 0}</span></div>
                                  <div className="flex justify-between py-0.5"><span>Bilty:</span> <span>₹{item.charges?.biltyCharge || 0}</span></div>
                                  {Number(item.charges?.pf) > 0 && <div className="flex justify-between py-0.5"><span>PF:</span> <span>₹{item.charges.pf}</span></div>}
                                  {Number(item.charges?.surCharge) > 0 && <div className="flex justify-between py-0.5"><span>Surcharge:</span> <span>₹{item.charges.surCharge}</span></div>}
                                  {Number(item.charges?.ddCharge) > 0 && <div className="flex justify-between py-0.5"><span>DD Charge:</span> <span>₹{item.charges.ddCharge}</span></div>}
                                  {Number(item.charges?.gstAmount) > 0 && <div className="flex justify-between py-0.5 text-brand-secondary"><span>GST:</span> <span>₹{item.charges.gstAmount}</span></div>}
                                  <div className="flex justify-between py-0.5 mt-1 border-t border-gray-700 pt-1 font-bold"><span>Total:</span> <span>₹{item.totalAmount}</span></div>
                                  {index === pendingLrs.length - 1 ? (
                                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 border-solid border-t-gray-900 border-t-[6px] border-x-transparent border-x-[6px] border-b-0"></div>
                                  ) : (
                                    <div className="absolute left-1/2 -top-1 -translate-x-1/2 border-solid border-b-gray-900 border-b-[6px] border-x-transparent border-x-[6px] border-t-0"></div>
                                  )}
                                </div>
                              </div>
                            ) : '-'}
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
                      <td colSpan={2} className="p-3"></td>
                      <td className="p-3 text-left uppercase text-xs">Total LRs: <span className="text-brand-primary text-sm">{loadedLrs.length}</span></td>
                      <td colSpan={2} className="p-3"></td>
                      <td className="p-3 text-center text-brand-primary text-sm">{loadedLrs.reduce((acc, curr) => acc + (Number(curr.pkg) || 0), 0)}</td>
                      <td className="p-3 text-center text-brand-primary text-sm">{loadedLrs.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)} KG</td>
                      <td className="p-3 text-center text-brand-primary text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (Number(curr.freight) || 0), 0)}</td>
                      <td className="p-3 text-center text-orange-600 text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (curr.paymentCondition === 'to_pay' ? (Number(curr.totalAmount) || 0) : 0), 0)}</td>
                      <td className="p-3 text-center text-emerald-600 text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (curr.paymentCondition === 'paid' ? (Number(curr.totalAmount) || 0) : 0), 0)}</td>
                      <td className="p-3 text-center text-blue-600 text-sm">₹{loadedLrs.reduce((acc, curr) => acc + (curr.paymentCondition === 'tbb' ? (Number(curr.totalAmount) || 0) : 0), 0)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </>
            )}

            {/* Section 3: Vehicle, Driver & Route Details */}
            <div className="pt-2">
              <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-100">
                <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
                <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  3. Vehicle, Driver & Route Details
                </span>
              </div>

              {/* Row 1: Vehicle, Driver & Agent (3-Column Unified Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Truck No */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-800">Truck No</Label>
                  <div className="relative">
                    <div className="flex gap-1.5 relative">
                      {/* Ghost text for Tab auto-complete suggestion */}
                      {truckNoSearch && truckSuggestions.length > 0 && truckSuggestions[0].label.toLowerCase().startsWith(truckNoSearch.toLowerCase()) && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-300 select-none font-medium z-0 uppercase pl-[1px]">
                          <span className="opacity-0">{truckSuggestions[0].label.slice(0, truckNoSearch.length)}</span>
                          <span>{truckSuggestions[0].label.slice(truckNoSearch.length)}</span>
                        </div>
                      )}
                      <Input
                        name="truckNo"
                        value={truckNoSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTruckNoSearch(val);
                          setShowTruckDropdown(true);
                          const matched = vehiclesList.find(v => v.label.toLowerCase() === val.toLowerCase());
                          if (matched) {
                            setFormData(prev => ({
                              ...prev,
                              truckNo: matched.value,
                              driverName: matched.assignedDriverId || prev.driverName
                            }));
                            if (matched.driverName) setDriverSearch(matched.driverName);
                          } else {
                            setFormData(prev => ({ ...prev, truckNo: '' }));
                          }
                        }}
                        onKeyDown={(e) => {
                          // Tab key: auto-complete inline suggestion if typed, else Tab naturally moves to Driver input
                          if (e.key === 'Tab' && truckNoSearch && truckSuggestions.length > 0 && truckSuggestions[0].label.toLowerCase().startsWith(truckNoSearch.toLowerCase())) {
                            const selectedTruck = truckSuggestions[0];
                            setTruckNoSearch(selectedTruck.label);
                            setFormData(prev => ({
                              ...prev,
                              truckNo: selectedTruck.value,
                              driverName: selectedTruck.assignedDriverId || prev.driverName
                            }));
                            if (selectedTruck.driverName) setDriverSearch(selectedTruck.driverName);
                            setShowTruckDropdown(false);
                            // Do NOT e.preventDefault() so cursor naturally moves to Driver Name input!
                            return;
                          }

                          if (!showTruckDropdown || truckSuggestions.length === 0) return;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setTruckHighlightIndex(prev => prev < truckSuggestions.length - 1 ? prev + 1 : 0);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setTruckHighlightIndex(prev => prev > 0 ? prev - 1 : truckSuggestions.length - 1);
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const idx = truckHighlightIndex >= 0 ? truckHighlightIndex : 0;
                            const selectedTruck = truckSuggestions[idx];
                            if (selectedTruck) {
                              setTruckNoSearch(selectedTruck.label);
                              setFormData(prev => ({
                                ...prev,
                                truckNo: selectedTruck.value,
                                driverName: selectedTruck.assignedDriverId || prev.driverName
                              }));
                              if (selectedTruck.driverName) setDriverSearch(selectedTruck.driverName);
                              setShowTruckDropdown(false);
                            }
                          } else if (e.key === 'Escape') {
                            setShowTruckDropdown(false);
                          }
                        }}
                        onFocus={() => setShowTruckDropdown(true)}
                        onBlur={() => setTimeout(() => setShowTruckDropdown(false), 200)}
                        placeholder="Select Truck from Master..."
                        className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border-[#64748b59] focus-visible:ring-brand-primary/20 uppercase w-full relative z-10 bg-transparent"
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setIsVehicleModalOpen(true)}
                        className="h-9 px-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-[8px] font-bold text-xs shrink-0 border border-brand-primary/20"
                        title="Add New Truck"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {showTruckDropdown && truckSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1 shadow-lg max-h-56 overflow-y-auto">
                        {truckSuggestions.map((truck, idx) => (
                          <div
                            key={truck.value}
                            onMouseDown={() => {
                              setTruckNoSearch(truck.label);
                              setFormData(prev => ({
                                ...prev,
                                truckNo: truck.value,
                                driverName: truck.assignedDriverId || prev.driverName
                              }));
                              if (truck.driverName) setDriverSearch(truck.driverName);
                              setShowTruckDropdown(false);
                            }}
                            className={`px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                              idx === truckHighlightIndex
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'hover:bg-gray-50 text-gray-800'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{truck.label}</span>
                              {truck.driverName && (
                                <span className="text-[11px] font-normal text-slate-400">
                                  Driver: {truck.driverName}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Driver Name */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-800">Driver Name</Label>
                  <div className="relative">
                    <div className="flex gap-1.5 relative">
                      {/* Ghost text for Tab auto-complete suggestion */}
                      {driverSearch && driverSuggestions.length > 0 && driverSuggestions[0].label.toLowerCase().startsWith(driverSearch.toLowerCase()) && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-300 select-none font-medium z-0 pl-[1px]">
                          <span className="opacity-0">{driverSuggestions[0].label.slice(0, driverSearch.length)}</span>
                          <span>{driverSuggestions[0].label.slice(driverSearch.length)}</span>
                        </div>
                      )}
                      <Input
                        name="driverName"
                        value={driverSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDriverSearch(val);
                          setShowDriverDropdown(true);
                          const matched = driversList.find(d => d.label.toLowerCase() === val.toLowerCase());
                          if (matched) {
                            setFormData(prev => ({ ...prev, driverName: matched.value }));
                          } else {
                            setFormData(prev => ({ ...prev, driverName: '' }));
                          }
                        }}
                        onKeyDown={(e) => {
                          // Tab key: auto-complete inline suggestion if typed, else Tab naturally moves to next field
                          if (e.key === 'Tab' && driverSearch && driverSuggestions.length > 0 && driverSuggestions[0].label.toLowerCase().startsWith(driverSearch.toLowerCase())) {
                            const selectedDriver = driverSuggestions[0];
                            setDriverSearch(selectedDriver.label);
                            setFormData(prev => ({ ...prev, driverName: selectedDriver.value }));
                            setShowDriverDropdown(false);
                            // Do NOT e.preventDefault() so cursor naturally moves to next input field!
                            return;
                          }

                          if (!showDriverDropdown || driverSuggestions.length === 0) return;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setDriverHighlightIndex(prev => prev < driverSuggestions.length - 1 ? prev + 1 : 0);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setDriverHighlightIndex(prev => prev > 0 ? prev - 1 : driverSuggestions.length - 1);
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const idx = driverHighlightIndex >= 0 ? driverHighlightIndex : 0;
                            const selectedDriver = driverSuggestions[idx];
                            if (selectedDriver) {
                              setDriverSearch(selectedDriver.label);
                              setFormData(prev => ({ ...prev, driverName: selectedDriver.value }));
                              setShowDriverDropdown(false);
                            }
                          } else if (e.key === 'Escape') {
                            setShowDriverDropdown(false);
                          }
                        }}
                        onFocus={() => setShowDriverDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDriverDropdown(false), 200)}
                        placeholder="Select Driver from Master..."
                        className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border-[#64748b59] focus-visible:ring-brand-primary/20 w-full relative z-10 bg-transparent"
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setIsDriverModalOpen(true)}
                        className="h-9 px-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-[8px] font-bold text-xs shrink-0 border border-brand-primary/20"
                        title="Add New Driver"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {showDriverDropdown && driverSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1 shadow-lg max-h-56 overflow-y-auto">
                        {driverSuggestions.map((driver, idx) => (
                          <div
                            key={driver.value}
                            onMouseDown={() => {
                              setDriverSearch(driver.label);
                              setFormData(prev => ({ ...prev, driverName: driver.value }));
                              setShowDriverDropdown(false);
                            }}
                            className={`px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                              idx === driverHighlightIndex
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'hover:bg-gray-50 text-gray-800'
                            }`}
                          >
                            <span className="font-semibold">{driver.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-800">Agent</Label>
                  <div className="relative">
                    <div className="flex gap-1.5 relative">
                      {formData.agent && agentSuggestions.length > 0 && agentSuggestions[0].value.toLowerCase().startsWith(formData.agent.toLowerCase()) && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-300 select-none font-medium z-0 pl-[1px]">
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
                            setFormData(prev => ({ ...prev, agent: agentSuggestions[0].value }));
                            setShowAgentDropdown(false);
                            return;
                          }
                          if (!showAgentDropdown || agentSuggestions.length === 0) return;
                          
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setAgentHighlightIndex(prev => prev < agentSuggestions.length - 1 ? prev + 1 : 0);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setAgentHighlightIndex(prev => prev > 0 ? prev - 1 : agentSuggestions.length - 1);
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            if (agentHighlightIndex >= 0 && agentHighlightIndex < agentSuggestions.length) {
                              setFormData(prev => ({ ...prev, agent: agentSuggestions[agentHighlightIndex].value }));
                              setShowAgentDropdown(false);
                            }
                          } else if (e.key === 'Escape') {
                            setShowAgentDropdown(false);
                          }
                        }}
                        onFocus={() => setShowAgentDropdown(true)}
                        onBlur={() => setTimeout(() => setShowAgentDropdown(false), 200)}
                        placeholder="Search Agent..."
                        className={`h-9 text-sm font-medium text-slate-800 rounded-[8px] relative z-10 bg-transparent w-full ${errors.agent ? 'border-red-500' : 'border-[#64748b59]'}`}
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setIsAgentModalOpen(true)}
                        className="h-9 px-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-[8px] font-bold text-xs shrink-0 border border-brand-primary/20"
                        title="Add New Agent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {renderError('agent')}
                    
                    {showAgentDropdown && agentSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                        {agentSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onMouseDown={() => {
                              setFormData(prev => ({ ...prev, agent: suggestion.value }));
                              setShowAgentDropdown(false);
                            }}
                            className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === agentHighlightIndex
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'hover:bg-gray-50 text-gray-800'
                              }`}
                          >
                            {suggestion.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Route (Memo Destination Branch) & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-800">Memo Destination Branch</Label>
                  <div className="relative">
                    <BranchAutocomplete
                      name="memoDestinationBranch"
                      value={formData.memoDestinationBranch}
                      onChange={handleChange as any}
                      options={branchesList}
                      placeholder="Search Memo Destination..."
                      error={!!errors.memoDestinationBranch}
                    />
                    {renderError('memoDestinationBranch')}
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-800">Remark / Additional Notes</Label>
                  <Input 
                    name="remark" 
                    value={formData.remark} 
                    onChange={handleChange as any} 
                    placeholder="Enter any special instructions or remarks for this Challan..." 
                    className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border-[#64748b59] focus-visible:ring-brand-primary/20 w-full placeholder:text-slate-300 placeholder:text-xs" 
                  />
                </div>
              </div>
            </div>
          {/* Closing Unified Single Sheet Card Container */}
        </div>

        {/* Action Buttons - Synced with LR Style */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button 
            type="button" 
            onClick={handleReset}
            variant="outline"
            className="h-9 px-4 rounded-[8px] border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="h-9 px-5 rounded-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            {isLoading ? 'Submitting...' : (
              <>
                Create Crossing Memo
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded text-white">Ctrl+↵</kbd>
              </>
            )}
          </Button>
        </div>

      </form>

      {/* ============================================================== */}
      {/* QUICK ADD VEHICLE MODAL (Synced with Vehicles Master Module)  */}
      {/* ============================================================== */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Add New Vehicle</h3>
                  <p className="text-[11px] text-slate-500">Register new vehicle to master directory</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsVehicleModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateVehicle} className="p-4 sm:p-5 space-y-4">
              {/* Core Details */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-brand-primary rounded-full"></span>
                  Core Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Vehicle Number <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. GJ01AB1234"
                      value={newVehicleData.vehicleNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                        setNewVehicleData(prev => ({ ...prev, vehicleNumber: val }));
                        if (vehicleErrors.vehicleNumber) setVehicleErrors(prev => ({ ...prev, vehicleNumber: '' }));
                      }}
                      className={`h-9 text-sm rounded-[8px] uppercase font-bold ${vehicleErrors.vehicleNumber ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {vehicleErrors.vehicleNumber && <p className="text-red-500 text-[11px] font-semibold">{vehicleErrors.vehicleNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Type <span className="text-red-500">*</span></Label>
                    <ThemeSelect
                      name="modalVehicleType"
                      value={newVehicleData.type}
                      onChange={(e) => setNewVehicleData(prev => ({ ...prev, type: e.target.value }))}
                      options={[
                        { value: 'Open', label: 'Open' },
                        { value: 'Container', label: 'Container' },
                        { value: 'Trailer', label: 'Trailer' },
                        { value: 'LCV', label: 'LCV' }
                      ]}
                      className="flex h-9 w-full rounded-[8px] border border-[#64748b59] px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Capacity <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. 10 Ton"
                      value={newVehicleData.capacity}
                      onChange={(e) => {
                        setNewVehicleData(prev => ({ ...prev, capacity: e.target.value }));
                        if (vehicleErrors.capacity) setVehicleErrors(prev => ({ ...prev, capacity: '' }));
                      }}
                      className={`h-9 text-sm rounded-[8px] ${vehicleErrors.capacity ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {vehicleErrors.capacity && <p className="text-red-500 text-[11px] font-semibold">{vehicleErrors.capacity}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Make (Brand)</Label>
                    <Input
                      placeholder="e.g. Tata / Ashok Leyland"
                      value={newVehicleData.make}
                      onChange={(e) => setNewVehicleData(prev => ({ ...prev, make: e.target.value }))}
                      className="h-9 text-sm rounded-[8px] border-[#64748b59]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Model</Label>
                    <Input
                      placeholder="e.g. Signa 5530"
                      value={newVehicleData.model}
                      onChange={(e) => setNewVehicleData(prev => ({ ...prev, model: e.target.value }))}
                      className="h-9 text-sm rounded-[8px] border-[#64748b59]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Status</Label>
                    <ThemeSelect
                      name="modalVehicleStatus"
                      value={newVehicleData.status}
                      onChange={(e) => setNewVehicleData(prev => ({ ...prev, status: e.target.value }))}
                      options={[
                        { value: 'available', label: 'Available' },
                        { value: 'on-trip', label: 'On Trip' },
                        { value: 'maintenance', label: 'Under Maintenance' }
                      ]}
                      className="flex h-9 w-full rounded-[8px] border border-[#64748b59] px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Compliance & Ownership Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-brand-primary rounded-full"></span>
                  Documents & Owner (Optional)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">RC Number</Label>
                    <Input
                      placeholder="RC Number"
                      value={newVehicleData.rcNumber}
                      onChange={(e) => setNewVehicleData(prev => ({ ...prev, rcNumber: e.target.value.toUpperCase() }))}
                      className="h-9 text-sm rounded-[8px] uppercase border-[#64748b59]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Owner Name</Label>
                    <Input
                      placeholder="Owner Name"
                      value={newVehicleData.ownerName}
                      onChange={(e) => setNewVehicleData(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="h-9 text-sm rounded-[8px] border-[#64748b59]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Owner Phone</Label>
                    <Input
                      placeholder="10-digit number"
                      maxLength={10}
                      value={newVehicleData.ownerPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewVehicleData(prev => ({ ...prev, ownerPhone: val }));
                        if (vehicleErrors.ownerPhone) setVehicleErrors(prev => ({ ...prev, ownerPhone: '' }));
                      }}
                      className={`h-9 text-sm rounded-[8px] ${vehicleErrors.ownerPhone ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {vehicleErrors.ownerPhone && <p className="text-red-500 text-[11px] font-semibold">{vehicleErrors.ownerPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="h-9 px-4 rounded-[8px] text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isVehicleSubmitting}
                  className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-[8px] shadow-sm flex items-center gap-1.5"
                >
                  {isVehicleSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    '+ Save & Select Vehicle'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK ADD DRIVER MODAL (Synced with Drivers Master Module)    */}
      {/* ============================================================== */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Add New Driver</h3>
                  <p className="text-[11px] text-slate-500">Register new driver to master directory</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsDriverModalOpen(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateDriver} className="p-4 sm:p-5 space-y-4">
              {/* Personal Details */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-brand-primary rounded-full"></span>
                  Personal Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-bold text-slate-800">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Driver Full Name"
                      value={newDriverData.name}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setNewDriverData(prev => ({ ...prev, name: val }));
                        if (driverErrors.name) setDriverErrors(prev => ({ ...prev, name: '' }));
                      }}
                      className={`h-9 text-sm rounded-[8px] font-medium ${driverErrors.name ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {driverErrors.name && <p className="text-red-500 text-[11px] font-semibold">{driverErrors.name}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Status</Label>
                    <ThemeSelect
                      name="modalDriverStatus"
                      value={newDriverData.status}
                      onChange={(e) => setNewDriverData(prev => ({ ...prev, status: e.target.value }))}
                      options={[
                        { value: 'available', label: 'Available' },
                        { value: 'on-trip', label: 'On Trip' },
                        { value: 'on-leave', label: 'On Leave' },
                        { value: 'inactive', label: 'Inactive' }
                      ]}
                      className="flex h-9 w-full rounded-[8px] border border-[#64748b59] px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Primary Phone <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={newDriverData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewDriverData(prev => ({ ...prev, phone: val }));
                        if (driverErrors.phone) setDriverErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      className={`h-9 text-sm rounded-[8px] font-medium ${driverErrors.phone ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {driverErrors.phone && <p className="text-red-500 text-[11px] font-semibold">{driverErrors.phone}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Emergency Phone</Label>
                    <Input
                      placeholder="Alternate 10-digit number"
                      maxLength={10}
                      value={newDriverData.alternatePhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewDriverData(prev => ({ ...prev, alternatePhone: val }));
                        if (driverErrors.alternatePhone) setDriverErrors(prev => ({ ...prev, alternatePhone: '' }));
                      }}
                      className={`h-9 text-sm rounded-[8px] font-medium ${driverErrors.alternatePhone ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {driverErrors.alternatePhone && <p className="text-red-500 text-[11px] font-semibold">{driverErrors.alternatePhone}</p>}
                  </div>
                </div>
              </div>

              {/* License & KYC Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-brand-primary rounded-full"></span>
                  License & KYC
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Driving License Number <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. GJ0120220012345"
                      value={newDriverData.licenseNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                        setNewDriverData(prev => ({ ...prev, licenseNumber: val }));
                        if (driverErrors.licenseNumber) setDriverErrors(prev => ({ ...prev, licenseNumber: '' }));
                      }}
                      className={`h-9 text-sm rounded-[8px] uppercase font-bold ${driverErrors.licenseNumber ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {driverErrors.licenseNumber && <p className="text-red-500 text-[11px] font-semibold">{driverErrors.licenseNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">Aadhar Number (Optional)</Label>
                    <Input
                      placeholder="12-digit Aadhar"
                      maxLength={12}
                      value={newDriverData.aadharNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setNewDriverData(prev => ({ ...prev, aadharNumber: val }));
                      }}
                      className="h-9 text-sm rounded-[8px] border-[#64748b59]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-800">Residential Address</Label>
                  <Input
                    placeholder="Full residential address"
                    value={newDriverData.address}
                    onChange={(e) => setNewDriverData(prev => ({ ...prev, address: e.target.value }))}
                    className="h-9 text-sm rounded-[8px] border-[#64748b59]"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="h-9 px-4 rounded-[8px] text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isDriverSubmitting}
                  className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-[8px] shadow-sm flex items-center gap-1.5"
                >
                  {isDriverSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    '+ Save & Select Driver'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Agent Modal */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Quick Add Agent</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Add a new agent or transport commission partner</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAgentModalOpen(false)}
                className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateAgent} className="p-5 sm:p-6 space-y-4">
              {/* Row 1: Agent Name, Agent Type, Contact No */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                    AGENT NAME <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="ex. Agent Name"
                    value={newAgentData.name}
                    onChange={(e) => {
                      setNewAgentData(prev => ({ ...prev, name: e.target.value }));
                      if (agentErrors.name) setAgentErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`h-9 text-sm rounded-[8px] font-medium ${agentErrors.name ? 'border-red-500' : 'border-[#64748b59]'}`}
                  />
                  {agentErrors.name && <p className="text-red-500 text-[11px] font-semibold">{agentErrors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                    AGENT TYPE <span className="text-red-500">*</span>
                  </Label>
                  <ThemeSelect
                    name="modalAgentType"
                    value={newAgentData.agentType}
                    onChange={(e) => {
                      setNewAgentData(prev => ({ ...prev, agentType: e.target.value }));
                      if (agentErrors.agentType) setAgentErrors(prev => ({ ...prev, agentType: '' }));
                    }}
                    options={AGENT_TYPES.map(t => ({ value: t, label: t }))}
                    className="flex h-9 w-full rounded-[8px] border border-[#64748b59] px-3 text-sm focus-visible:outline-none"
                  />
                  {agentErrors.agentType && <p className="text-red-500 text-[11px] font-semibold">{agentErrors.agentType}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                    CONTACT NO <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="9966XXXXX8"
                    maxLength={10}
                    value={newAgentData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewAgentData(prev => ({ ...prev, phone: val }));
                      if (agentErrors.phone) setAgentErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`h-9 text-sm rounded-[8px] ${agentErrors.phone ? 'border-red-500' : 'border-[#64748b59]'}`}
                  />
                  {agentErrors.phone && <p className="text-red-500 text-[11px] font-semibold">{agentErrors.phone}</p>}
                </div>
              </div>

              {/* Row 2: Email ID, GST Number, Opening Balance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                    EMAIL ID
                  </Label>
                  <Input
                    type="email"
                    placeholder="mail@transbook.com"
                    value={newAgentData.email}
                    onChange={(e) => {
                      setNewAgentData(prev => ({ ...prev, email: e.target.value }));
                      if (agentErrors.email) setAgentErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`h-9 text-sm rounded-[8px] ${agentErrors.email ? 'border-red-500' : 'border-[#64748b59]'}`}
                  />
                  {agentErrors.email && <p className="text-red-500 text-[11px] font-semibold">{agentErrors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                    GST NUMBER
                  </Label>
                  <Input
                    placeholder="EX. 24AAAAA0000A1Z5"
                    maxLength={15}
                    value={newAgentData.gstNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().slice(0, 15);
                      setNewAgentData(prev => ({ ...prev, gstNumber: val }));
                      if (agentErrors.gstNumber) setAgentErrors(prev => ({ ...prev, gstNumber: '' }));
                    }}
                    className={`h-9 text-sm rounded-[8px] uppercase font-mono ${agentErrors.gstNumber ? 'border-red-500' : 'border-[#64748b59]'}`}
                  />
                  {agentErrors.gstNumber && <p className="text-red-500 text-[11px] font-semibold">{agentErrors.gstNumber}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                    OPENING BALANCE
                  </Label>
                  <Input
                    placeholder="0"
                    value={newAgentData.openingBalance}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setNewAgentData(prev => ({ ...prev, openingBalance: val }));
                    }}
                    className="h-9 text-sm rounded-[8px] border-[#64748b59]"
                  />
                </div>
              </div>

              {/* Row 3: Agent Address */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                  AGENT ADDRESS
                </Label>
                <Textarea
                  placeholder="Address details"
                  rows={3}
                  value={newAgentData.address}
                  onChange={(e) => setNewAgentData(prev => ({ ...prev, address: e.target.value }))}
                  className="min-h-[72px] text-sm rounded-[8px] border-[#64748b59] resize-none"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAgentModalOpen(false)}
                  className="h-9 px-4 rounded-[8px] text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAgentSubmitting}
                  className="h-9 px-5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold rounded-[8px] shadow-sm flex items-center gap-1.5"
                >
                  {isAgentSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    '+ Save & Select Agent'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}






