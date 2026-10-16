'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Search, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useUserStore } from '@/store/useUserStore';

export default function LorryHireForm() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const userBranch = user?.branch || '';

  const [isLoading, setIsLoading] = useState(false);
  const [voucherNo, setVoucherNo] = useState('Loading...');
  
  const canAdd = user?.role !== 'superadmin' && user?.role !== 'logistic' && user?.permissions?.challans?.canAdd !== false;

  useEffect(() => {
    if (user && !canAdd) {
      toast.error('You do not have permission to create Lorry Hire');
      router.push('/admin/lorry-hire');
    }
  }, [user, canAdd, router]);
  
  const [branches, setBranches] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [challans, setChallans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromBranch: userBranch,
    toBranch: '',
    fromCity: '',
    fromState: '',
    fromPincode: '',
    toCity: '',
    toState: '',
    toPincode: '',
    truckNo: '',
    driver: '',
    modeOfTransport: '1',
    totalAmount: '',
    advanceAmount: '',
    commission: '',
    hamali: '',
    tds: '',
    balancePaidBy: '',
    status: 'pending',
    remark: ''
  });

  const [selectedChallans, setSelectedChallans] = useState<any[]>([]);
  
  const [scanChallanNo, setScanChallanNo] = useState('');
  const [showChallanDropdown, setShowChallanDropdown] = useState(false);
  const [challanHighlightIndex, setChallanHighlightIndex] = useState(-1);
  const [challanSuggestions, setChallanSuggestions] = useState<any[]>([]);

  // Autocomplete states
  const [fromBranchSearch, setFromBranchSearch] = useState('');
  const [showFromBranchDropdown, setShowFromBranchDropdown] = useState(false);
  const [fromBranchHighlightIndex, setFromBranchHighlightIndex] = useState(-1);
  const [fromBranchSuggestions, setFromBranchSuggestions] = useState<any[]>([]);

  // Pincode dropdown states
  const [fromPincodeOptions, setFromPincodeOptions] = useState<{name: string, city: string, state: string}[]>([]);
  const [showFromPincodeDropdown, setShowFromPincodeDropdown] = useState(false);
  const [fromPincodeLoading, setFromPincodeLoading] = useState(false);
  const [toPincodeOptions, setToPincodeOptions] = useState<{name: string, city: string, state: string}[]>([]);
  const [showToPincodeDropdown, setShowToPincodeDropdown] = useState(false);
  const [toPincodeLoading, setToPincodeLoading] = useState(false);

  const [toBranchSearch, setToBranchSearch] = useState('');
  const [showToBranchDropdown, setShowToBranchDropdown] = useState(false);
  const [toBranchHighlightIndex, setToBranchHighlightIndex] = useState(-1);
  const [toBranchSuggestions, setToBranchSuggestions] = useState<any[]>([]);

  const [truckSearch, setTruckSearch] = useState('');
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const [truckHighlightIndex, setTruckHighlightIndex] = useState(-1);
  const [truckSuggestions, setTruckSuggestions] = useState<any[]>([]);

  const [balancePaidBySearch, setBalancePaidBySearch] = useState('');
  const [showBalancePaidByDropdown, setShowBalancePaidByDropdown] = useState(false);
  const [balancePaidByHighlightIndex, setBalancePaidByHighlightIndex] = useState(-1);
  const [balancePaidBySuggestions, setBalancePaidBySuggestions] = useState<any[]>([]);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [driverHighlightIndex, setDriverHighlightIndex] = useState(-1);
  const [driverSuggestions, setDriverSuggestions] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [branchRes, vehicleRes, challanRes, driverRes] = await Promise.all([
        fetch('/api/admin/branches?limit=1000'),
        fetch('/api/admin/vehicles'),
        fetch('/api/admin/challans?status=pending&limit=1000'),
        fetch('/api/admin/drivers?limit=1000')
      ]);
      
      const branchData = await branchRes.json();
      const vehicleData = await vehicleRes.json();
      const challanData = await challanRes.json();
      const driverData = await driverRes.json();
      
      const loadedBranches = branchData.branches || branchData || [];
      const loadedVehicles = vehicleData.vehicles || vehicleData || [];
      const loadedDrivers = driverData.drivers || driverData || [];

      setBranches(loadedBranches);
      setVehicles(loadedVehicles);
      setChallans(challanData.challans || challanData || []);
      setDrivers(loadedDrivers);

      if (userBranch && loadedBranches.length > 0) {
        const userBranchObj = loadedBranches.find((b: any) => b._id === userBranch);
        if (userBranchObj) {
          setFromBranchSearch(`${userBranchObj.name || ''} (${userBranchObj.code || ''})`);
          setFormData(prev => ({
            ...prev,
            fromCity: userBranchObj.city || '',
            fromState: userBranchObj.state || '',
            fromPincode: userBranchObj.pincode || ''
          }));
        }
      }

      // Fetch max voucher No
      fetch('/api/admin/lorry-hire?limit=100')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            let maxNum = 1000;
            let foundValid = false;
            data.forEach((b: any) => {
              if (b.voucherNo) {
                const match = b.voucherNo.match(/LH-(\d+)/);
                if (match) {
                  const num = parseInt(match[1], 10);
                  if (!isNaN(num)) {
                    foundValid = true;
                    if (num > maxNum) maxNum = num;
                  }
                }
              }
            });
            setVoucherNo(foundValid ? `LH-${maxNum + 1}` : 'LH-1001');
          } else {
            setVoucherNo('LH-1001');
          }
        })
        .catch(() => setVoucherNo('LH-1001'));
    } catch (error) {
      toast.error('Failed to load master data');
    }
  };

  const branchOptions = branches.map(b => ({ value: b._id, label: `${b.name || ''} (${b.code || ''})`, original: b }));
  const vehicleOptions = vehicles.map(v => ({ value: v._id, label: v.vehicleNumber || 'Unknown', original: v }));

  // ------------- CHALLAN AUTOCOMPLETE -------------
  useEffect(() => {
    if (!scanChallanNo || scanChallanNo.trim().length < 1) {
      const allPending = challans
        .filter(c => c.status === 'pending' && !selectedChallans.some(sc => sc._id === c._id))
        .map(c => ({
          value: c._id,
          label: `CH-${c.challanNumber}`,
          original: c
        }));
      setChallanSuggestions(allPending);
      return;
    }
    const query = scanChallanNo.trim().toLowerCase().replace(/^ch-/i, '');
    const filtered = challans
      .filter(c => !selectedChallans.some(sc => sc._id === c._id) && String(c.challanNumber).toLowerCase().includes(query))
      .map(c => ({ value: c._id, label: `CH-${c.challanNumber}`, original: c }));
    setChallanSuggestions(filtered);
  }, [scanChallanNo, challans, selectedChallans]);

  useEffect(() => setChallanHighlightIndex(-1), [challanSuggestions]);

  const handleChallanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = challanSuggestions[0];
      if (firstMatch && scanChallanNo && firstMatch.label.toLowerCase().startsWith(scanChallanNo.toLowerCase())) {
        setScanChallanNo(firstMatch.label);
        setShowChallanDropdown(false);
        setChallanHighlightIndex(-1);
        return;
      }
    }
    if (!showChallanDropdown || challanSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleScanChallan();
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setChallanHighlightIndex(prev => prev < challanSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setChallanHighlightIndex(prev => prev > 0 ? prev - 1 : challanSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (challanHighlightIndex >= 0 && challanHighlightIndex < challanSuggestions.length) {
        const selected = challanSuggestions[challanHighlightIndex];
        setScanChallanNo(selected.label);
        setShowChallanDropdown(false);
        setChallanHighlightIndex(-1);
        // Automatically add it after selecting
        setTimeout(() => {
          document.getElementById('add-challan-btn')?.click();
        }, 50);
      } else {
        handleScanChallan();
      }
    } else if (e.key === 'Escape') { setShowChallanDropdown(false); setChallanHighlightIndex(-1); }
  };

  // ------------- FROM BRANCH AUTOCOMPLETE -------------
  useEffect(() => {
    if (!fromBranchSearch || fromBranchSearch.trim().length < 1) {
      setFromBranchSuggestions([]);
      return;
    }
    const query = fromBranchSearch.trim().toLowerCase();
    const filtered = branchOptions.filter(b => 
      (b.label.toLowerCase().includes(query) || b.value.toLowerCase().includes(query)) && 
      b.value !== formData.toBranch
    );
    setFromBranchSuggestions(filtered);
  }, [fromBranchSearch, branches, formData.toBranch]);

  useEffect(() => setFromBranchHighlightIndex(-1), [fromBranchSuggestions]);

  const handleFromBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = fromBranchSuggestions[0];
      if (firstMatch && fromBranchSearch && firstMatch.label.toLowerCase().startsWith(fromBranchSearch.toLowerCase())) {
        setFormData(prev => ({ 
          ...prev, 
          fromBranch: firstMatch.value,
          fromCity: firstMatch.original.city || '',
          fromState: firstMatch.original.state || '',
          fromPincode: firstMatch.original.pincode || ''
        }));
        setFromBranchSearch(firstMatch.label);
        setShowFromBranchDropdown(false);
        setFromBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, fromBranch: '' }));
        return;
      }
    }
    if (!showFromBranchDropdown || fromBranchSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFromBranchHighlightIndex(prev => prev < fromBranchSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFromBranchHighlightIndex(prev => prev > 0 ? prev - 1 : fromBranchSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (fromBranchHighlightIndex >= 0 && fromBranchHighlightIndex < fromBranchSuggestions.length) {
        e.preventDefault();
        const selected = fromBranchSuggestions[fromBranchHighlightIndex];
        setFormData(prev => ({ 
          ...prev, 
          fromBranch: selected.value,
          fromCity: selected.original.city || '',
          fromState: selected.original.state || '',
          fromPincode: selected.original.pincode || ''
        }));
        setFromBranchSearch(selected.label);
        setShowFromBranchDropdown(false);
        setFromBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, fromBranch: '' }));
      }
    } else if (e.key === 'Escape') { setShowFromBranchDropdown(false); setFromBranchHighlightIndex(-1); }
  };

  // ------------- TO BRANCH AUTOCOMPLETE -------------
  useEffect(() => {
    if (!toBranchSearch || toBranchSearch.trim().length < 1) {
      setToBranchSuggestions([]);
      return;
    }
    const query = toBranchSearch.trim().toLowerCase();
    const filtered = branchOptions.filter(b => 
      (b.label.toLowerCase().includes(query) || b.value.toLowerCase().includes(query)) &&
      b.value !== formData.fromBranch
    );
    setToBranchSuggestions(filtered);
  }, [toBranchSearch, branches, formData.fromBranch]);

  useEffect(() => setToBranchHighlightIndex(-1), [toBranchSuggestions]);

  const handleToBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = toBranchSuggestions[0];
      if (firstMatch && toBranchSearch && firstMatch.label.toLowerCase().startsWith(toBranchSearch.toLowerCase())) {
        setFormData(prev => ({ 
          ...prev, 
          toBranch: firstMatch.value,
          toCity: firstMatch.original.city || '',
          toState: firstMatch.original.state || '',
          toPincode: firstMatch.original.pincode || ''
        }));
        setToBranchSearch(firstMatch.label);
        setShowToBranchDropdown(false);
        setToBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, toBranch: '' }));
        return;
      }
    }
    if (!showToBranchDropdown || toBranchSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setToBranchHighlightIndex(prev => prev < toBranchSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setToBranchHighlightIndex(prev => prev > 0 ? prev - 1 : toBranchSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (toBranchHighlightIndex >= 0 && toBranchHighlightIndex < toBranchSuggestions.length) {
        e.preventDefault();
        const selected = toBranchSuggestions[toBranchHighlightIndex];
        setFormData(prev => ({ 
          ...prev, 
          toBranch: selected.value,
          toCity: selected.original.city || '',
          toState: selected.original.state || '',
          toPincode: selected.original.pincode || ''
        }));
        setToBranchSearch(selected.label);
        setShowToBranchDropdown(false);
        setToBranchHighlightIndex(-1);
        setErrors(prev => ({ ...prev, toBranch: '' }));
      }
    } else if (e.key === 'Escape') { setShowToBranchDropdown(false); setToBranchHighlightIndex(-1); }
  };

  // ------------- TRUCK NO AUTOCOMPLETE -------------
  useEffect(() => {
    if (!truckSearch || truckSearch.trim().length < 1) {
      setTruckSuggestions([]);
      return;
    }
    const query = truckSearch.trim().toLowerCase();
    const filtered = vehicleOptions.filter(v => v.label.toLowerCase().includes(query) || v.value.toLowerCase().includes(query));
    setTruckSuggestions(filtered);
  }, [truckSearch, vehicles]);

  useEffect(() => setTruckHighlightIndex(-1), [truckSuggestions]);

  const handleTruckKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = truckSuggestions[0];
      if (firstMatch && truckSearch && firstMatch.label.toLowerCase().startsWith(truckSearch.toLowerCase())) {
        setFormData(prev => ({ ...prev, truckNo: firstMatch.value }));
        setTruckSearch(firstMatch.label);
        setShowTruckDropdown(false);
        setTruckHighlightIndex(-1);
        setErrors(prev => ({ ...prev, truckNo: '' }));
        return;
      }
    }
    if (!showTruckDropdown || truckSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setTruckHighlightIndex(prev => prev < truckSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setTruckHighlightIndex(prev => prev > 0 ? prev - 1 : truckSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (truckHighlightIndex >= 0 && truckHighlightIndex < truckSuggestions.length) {
        e.preventDefault();
        const selected = truckSuggestions[truckHighlightIndex];
        
        let newDriver = formData.driver;
        let newDriverSearch = driverSearch;
        const truckDriver = selected.original?.driver;
        if (truckDriver) {
           const did = typeof truckDriver === 'object' ? truckDriver._id : truckDriver;
           const driverObj = drivers.find(d => d._id === did);
           if (driverObj) {
             newDriver = driverObj._id;
             newDriverSearch = driverObj.name;
           }
        }
        
        setFormData(prev => ({ ...prev, truckNo: selected.value, driver: newDriver }));
        setTruckSearch(selected.label);
        setDriverSearch(newDriverSearch);
        setShowTruckDropdown(false);
        setTruckHighlightIndex(-1);
        setErrors(prev => ({ ...prev, truckNo: '' }));
      }
    } else if (e.key === 'Escape') { setShowTruckDropdown(false); setTruckHighlightIndex(-1); }
  };

  // ------------- DRIVER AUTOCOMPLETE -------------
  const driverOptions = drivers.map(d => ({ value: d._id, label: d.name || 'Unknown' }));

  useEffect(() => {
    if (!driverSearch || driverSearch.trim().length < 1) {
      setDriverSuggestions([]);
      return;
    }
    const query = driverSearch.trim().toLowerCase();
    const filtered = driverOptions.filter(d => 
      d.label.toLowerCase().includes(query) || d.value.toLowerCase().includes(query)
    );
    setDriverSuggestions(filtered);
  }, [driverSearch, drivers]);

  useEffect(() => setDriverHighlightIndex(-1), [driverSuggestions]);

  const handleDriverKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = driverSuggestions[0];
      if (firstMatch && driverSearch && firstMatch.label.toLowerCase().startsWith(driverSearch.toLowerCase())) {
        setFormData(prev => ({ ...prev, driver: firstMatch.value }));
        setDriverSearch(firstMatch.label);
        setShowDriverDropdown(false);
        setDriverHighlightIndex(-1);
        setErrors(prev => ({ ...prev, driver: '' }));
        return;
      }
    }
    if (!showDriverDropdown || driverSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setDriverHighlightIndex(prev => prev < driverSuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setDriverHighlightIndex(prev => prev > 0 ? prev - 1 : driverSuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (driverHighlightIndex >= 0 && driverHighlightIndex < driverSuggestions.length) {
        e.preventDefault();
        const selected = driverSuggestions[driverHighlightIndex];
        setFormData(prev => ({ ...prev, driver: selected.value }));
        setDriverSearch(selected.label);
        setShowDriverDropdown(false);
        setDriverHighlightIndex(-1);
        setErrors(prev => ({ ...prev, driver: '' }));
      }
    } else if (e.key === 'Escape') { setShowDriverDropdown(false); setDriverHighlightIndex(-1); }
  };

  // ------------- BALANCE PAID BY AUTOCOMPLETE -------------
  useEffect(() => {
    if (!balancePaidBySearch || balancePaidBySearch.trim().length < 1) {
      setBalancePaidBySuggestions(branchOptions);
      return;
    }
    const query = balancePaidBySearch.trim().toLowerCase();
    const filtered = branchOptions.filter(b => b.label.toLowerCase().includes(query) || b.value.toLowerCase().includes(query));
    setBalancePaidBySuggestions(filtered);
  }, [balancePaidBySearch, branches]);

  useEffect(() => setBalancePaidByHighlightIndex(-1), [balancePaidBySuggestions]);

  const handleBalancePaidByKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = balancePaidBySuggestions[0];
      if (firstMatch && balancePaidBySearch && firstMatch.label.toLowerCase().startsWith(balancePaidBySearch.toLowerCase())) {
        setFormData(prev => ({ ...prev, balancePaidBy: firstMatch.value }));
        setBalancePaidBySearch(firstMatch.label);
        setShowBalancePaidByDropdown(false);
        setBalancePaidByHighlightIndex(-1);
        return;
      }
    }
    if (!showBalancePaidByDropdown || balancePaidBySuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setBalancePaidByHighlightIndex(prev => prev < balancePaidBySuggestions.length - 1 ? prev + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setBalancePaidByHighlightIndex(prev => prev > 0 ? prev - 1 : balancePaidBySuggestions.length - 1); }
    else if (e.key === 'Enter') {
      if (balancePaidByHighlightIndex >= 0 && balancePaidByHighlightIndex < balancePaidBySuggestions.length) {
        e.preventDefault();
        const selected = balancePaidBySuggestions[balancePaidByHighlightIndex];
        setFormData(prev => ({ ...prev, balancePaidBy: selected.value }));
        setBalancePaidBySearch(selected.label);
        setShowBalancePaidByDropdown(false);
        setBalancePaidByHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') { setShowBalancePaidByDropdown(false); setBalancePaidByHighlightIndex(-1); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScanChallan = () => {
    if (!scanChallanNo.trim()) return;
    
    const searchVal = scanChallanNo.trim().toLowerCase().replace(/^ch-/i, '');
    const challan = challans.find(c => {
      const num = String(c.challanNumber).toLowerCase().replace(/^ch-/i, '');
      return num === searchVal || String(c.challanNumber).toLowerCase() === scanChallanNo.trim().toLowerCase();
    });
    
    if (!challan) {
      toast.error('Challan not found or already assigned');
      return;
    }
    
    if (selectedChallans.some(c => c._id === challan._id)) {
      toast.error('Challan already added to list');
      setScanChallanNo('');
      return;
    }
    
    setSelectedChallans(prev => [...prev, challan]);
    
    // Super Auto-Fill Logic (Only on first challan added)
    if (selectedChallans.length === 0) {
      const fromBranch = challan.branch?._id || challan.branch || '';
      const toBranch = challan.memoDestinationBranch?._id || challan.memoDestinationBranch || challan.lrToBranch?._id || challan.lrToBranch || '';
      const truck = challan.truckNo?._id || challan.truckNo || '';

      // Update search inputs for UI feedback
      let newFromCity = formData.fromCity, newFromState = formData.fromState, newFromPincode = formData.fromPincode;
      if (fromBranch) {
        const branchObj = branches.find(b => b._id === fromBranch);
        if (branchObj) {
          setFromBranchSearch(`${branchObj.name || ''} (${branchObj.code || ''})`);
          newFromCity = branchObj.city || '';
          newFromState = branchObj.state || '';
          newFromPincode = branchObj.pincode || '';
        }
      }
      
      let newToCity = '', newToState = '', newToPincode = '';
      if (toBranch) {
        const branchObj = branches.find(b => b._id === toBranch);
        if (branchObj) {
          setToBranchSearch(`${branchObj.name || ''} (${branchObj.code || ''})`);
          newToCity = branchObj.city || '';
          newToState = branchObj.state || '';
          newToPincode = branchObj.pincode || '';
        }
      }
      
      let newDriver = formData.driver, newDriverSearch = driverSearch;

      // Priority 1: Use driver directly assigned to the Challan
      const challanDriver = challan.driverName?._id || challan.driverName;
      if (challanDriver) {
        if (typeof challan.driverName === 'object' && challan.driverName?.name) {
          newDriver = challan.driverName._id;
          newDriverSearch = challan.driverName.name;
        } else {
          const did = challanDriver.toString();
          const driverObj = drivers.find(d => d._id === did);
          if (driverObj) {
            newDriver = driverObj._id;
            newDriverSearch = driverObj.name;
          }
        }
      }

      // Priority 2: If challan had no driver, fallback to vehicle's assigned driver
      if (truck) {
        const truckObj = vehicles.find(v => v._id === truck);
        if (truckObj) {
          setTruckSearch(truckObj.vehicleNumber || '');
          if (!newDriver) {
            const truckDriver = truckObj.assignedDriver || truckObj.driver;
            if (truckDriver) {
              const did = typeof truckDriver === 'object' ? truckDriver._id : truckDriver;
              const driverObj = drivers.find(d => d._id === did);
              if (driverObj) {
                newDriver = driverObj._id;
                newDriverSearch = driverObj.name;
              }
            }
          }
        }
      } else if (challan.truckNo?.vehicleNumber) {
        setTruckSearch(challan.truckNo.vehicleNumber);
      }
      
      setDriverSearch(newDriverSearch);
      
      setFormData(p => ({
        ...p,
        fromBranch: fromBranch,
        toBranch: toBranch,
        truckNo: truck,
        fromCity: newFromCity,
        fromState: newFromState,
        fromPincode: newFromPincode,
        toCity: newToCity,
        toState: newToState,
        toPincode: newToPincode,
        driver: newDriver
      }));
    }
    
    setScanChallanNo('');
    toast.success('Challan added!');
  };

  const removeChallan = (id: string) => {
    setSelectedChallans(prev => prev.filter(c => c._id !== id));
  };

  const calculateBalance = () => {
    const total = Number(formData.totalAmount) || 0;
    const advance = Number(formData.advanceAmount) || 0;
    const comm = Number(formData.commission) || 0;
    const hamaliAmt = Number(formData.hamali) || 0;
    return total - advance - comm + hamaliAmt;
  };

  // Keyboard Shortcut: Ctrl + Enter to submit Lorry Hire
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('lorry-hire-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fromBranch) newErrors.fromBranch = 'Please select From Branch from the dropdown list';
    if (!formData.toBranch) newErrors.toBranch = 'Please select To Branch from the dropdown list';
    if (!formData.truckNo) newErrors.truckNo = 'Please select Truck No from the dropdown list';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix validation errors');
      return;
    }

    if (selectedChallans.length === 0) {
      toast.error('Please add at least one Challan');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        date: formData.date,
        fromBranch: formData.fromBranch,
        fromCity: formData.fromCity,
        fromState: formData.fromState,
        fromPincode: formData.fromPincode,
        toBranch: formData.toBranch,
        toCity: formData.toCity,
        toState: formData.toState,
        toPincode: formData.toPincode,
        truckNo: formData.truckNo,
        driver: formData.driver,
        modeOfTransport: formData.modeOfTransport,
        challans: selectedChallans.map(c => c._id),
        totalAmount: Number(formData.totalAmount) || 0,
        advanceAmount: Number(formData.advanceAmount) || 0,
        commission: Number(formData.commission) || 0,
        hamali: Number(formData.hamali) || 0,
        tds: Number(formData.tds) || 0,
        balanceAmount: calculateBalance(),
        balancePaidBy: formData.balancePaidBy || null,
        status: formData.status,
        remark: formData.remark
      };

      const res = await fetch('/api/admin/lorry-hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Lorry Hire created successfully');
      router.push('/admin/lorry-hire');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <p className="text-rose-500 text-[11px] font-semibold mt-1 leading-tight flex items-center gap-1">{errors[field]}</p>;
    }
    return null;
  };

  return (
    <div className="w-full pb-4">
      {/* Compact Header Bar - Synced with LR & Challan */}
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
            <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">Add New Lorry Hire</h1>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Create a new voucher and assign challans</p>
          </div>
        </div>
      </div>

      <form
        id="lorry-hire-form"
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
          
          {/* Section 1: Hire & Route Information */}
          <div className="relative z-20 !overflow-visible">
            <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-100">
              <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
              <span className="text-xs font-bold text-slate-700 tracking-wide">
                1. Hire & Route Information
              </span>
            </div>

            {/* Row 1: Primary Document Details (3 Balanced Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Voucher No</Label>
                <Input
                  value={voucherNo}
                  disabled
                  className="h-9 text-xs font-bold bg-slate-50 border-slate-200 text-slate-600 rounded-[8px]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Date <span className="text-red-500">*</span></Label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  className="h-9 rounded-[8px] border-[#64748b59] text-xs font-semibold"
                />
              </div>

              {/* Challan Super Auto-Fill */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                  Super Auto-Fill (Search Challan) <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-1.5 relative">
                  <div className="relative flex-1">
                    {scanChallanNo && challanSuggestions.length > 0 && challanSuggestions[0].label.toLowerCase().startsWith(scanChallanNo.toLowerCase()) && (
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 select-none font-medium z-0 pl-[1px]">
                        <span className="opacity-0">{challanSuggestions[0].label.slice(0, scanChallanNo.length)}</span>
                        <span>{challanSuggestions[0].label.slice(scanChallanNo.length)}</span>
                      </div>
                    )}
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-primary" />
                    <Input
                      placeholder="e.g. 1001..."
                      value={scanChallanNo}
                      onChange={(e) => {
                        setScanChallanNo(e.target.value);
                      }}
                      onFocus={() => setShowChallanDropdown(true)}
                      onBlur={() => setTimeout(() => setShowChallanDropdown(false), 250)}
                      onKeyDown={handleChallanKeyDown}
                      className="h-9 pl-8 text-xs font-bold text-slate-800 rounded-[8px] bg-brand-primary/5 border-brand-primary/40 focus-visible:ring-1 focus-visible:ring-brand-primary"
                      autoFocus
                    />
                  </div>
                  <Button 
                    id="add-challan-btn"
                    type="button" 
                    onClick={handleScanChallan} 
                    className="h-9 bg-brand-primary hover:bg-brand-primary-dark shrink-0 px-3.5 text-xs font-bold rounded-[8px] shadow-xs"
                  >
                    Add
                  </Button>
                  
                  {/* Dropdown for Challan */}
                  {showChallanDropdown && challanSuggestions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 mt-1 w-[320px] bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      {challanSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.value}
                          onClick={() => {
                            setScanChallanNo(suggestion.label);
                            setShowChallanDropdown(false);
                            setChallanHighlightIndex(-1);
                            setTimeout(() => {
                              document.getElementById('add-challan-btn')?.click();
                            }, 50);
                          }}
                          onMouseEnter={() => setChallanHighlightIndex(index)}
                          className={`px-3 py-2 text-xs rounded-md cursor-pointer transition-colors flex justify-between items-center ${challanHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <span className="font-bold">{suggestion.label}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{suggestion.original?.memoDestinationBranch?.code || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: From Branch (Disabled), To Branch, Truck No, Driver Name (4 Balanced Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 items-start">
              {/* From Branch (Disabled) */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">From Branch <span className="text-red-500">*</span></Label>
                <Input
                  value={fromBranchSearch}
                  disabled
                  readOnly
                  className="h-9 text-xs font-bold text-slate-600 rounded-[8px] bg-slate-100/80 border-[#64748b59] cursor-not-allowed select-none"
                />
                {renderError('fromBranch')}
              </div>

              {/* To Branch Dropdown */}
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-slate-800">To Branch <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {toBranchSearch && toBranchSuggestions.length > 0 && toBranchSuggestions[0].label.toLowerCase().startsWith(toBranchSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{toBranchSuggestions[0].label.slice(0, toBranchSearch.length)}</span>
                      <span>{toBranchSuggestions[0].label.slice(toBranchSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={toBranchSearch}
                    onChange={(e) => {
                      setToBranchSearch(e.target.value);
                      setFormData(prev => ({ ...prev, toBranch: '' }));
                    }}
                    onFocus={() => setShowToBranchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowToBranchDropdown(false), 250)}
                    onKeyDown={handleToBranchKeyDown}
                    placeholder="Search or type Branch..."
                    className={`h-9 text-xs font-bold text-slate-800 rounded-[8px] relative z-10 bg-transparent ${errors.toBranch ? 'border-red-500' : 'border-[#64748b59]'}`}
                  />
                </div>
                {renderError('toBranch')}

                {showToBranchDropdown && toBranchSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {toBranchSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          setFormData(prev => ({ 
                            ...prev, 
                            toBranch: suggestion.value,
                            toCity: suggestion.original.city || '',
                            toState: suggestion.original.state || '',
                            toPincode: suggestion.original.pincode || ''
                          }));
                          setToBranchSearch(suggestion.label);
                          setShowToBranchDropdown(false);
                          setToBranchHighlightIndex(-1);
                          setErrors(prev => ({ ...prev, toBranch: '' }));
                        }}
                        onMouseEnter={() => setToBranchHighlightIndex(index)}
                        className={`px-3 py-2 text-xs rounded-md cursor-pointer transition-colors ${toBranchHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Truck Dropdown */}
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-slate-800">Truck No <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {truckSearch && truckSuggestions.length > 0 && truckSuggestions[0].label.toLowerCase().startsWith(truckSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{truckSuggestions[0].label.slice(0, truckSearch.length)}</span>
                      <span>{truckSuggestions[0].label.slice(truckSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={truckSearch}
                    onChange={(e) => {
                      setTruckSearch(e.target.value);
                      setFormData(prev => ({ ...prev, truckNo: '' }));
                    }}
                    onFocus={() => setShowTruckDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTruckDropdown(false), 250)}
                    onKeyDown={handleTruckKeyDown}
                    placeholder="Search or type Truck..."
                    className={`h-9 text-xs font-bold text-slate-800 rounded-[8px] relative z-10 bg-transparent ${errors.truckNo ? 'border-red-500' : 'border-[#64748b59]'}`}
                  />
                </div>
                {renderError('truckNo')}

                {showTruckDropdown && truckSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {truckSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          let newDriver = formData.driver;
                          let newDriverSearch = driverSearch;
                          const truckDriver = suggestion.original?.driver;
                          if (truckDriver) {
                             const did = typeof truckDriver === 'object' ? truckDriver._id : truckDriver;
                             const driverObj = drivers.find(d => d._id === did);
                             if (driverObj) {
                               newDriver = driverObj._id;
                               newDriverSearch = driverObj.name;
                             }
                          }
                          
                          setFormData(prev => ({ ...prev, truckNo: suggestion.value, driver: newDriver }));
                          setTruckSearch(suggestion.label);
                          setDriverSearch(newDriverSearch);
                          setShowTruckDropdown(false);
                          setTruckHighlightIndex(-1);
                          setErrors(prev => ({ ...prev, truckNo: '' }));
                        }}
                        onMouseEnter={() => setTruckHighlightIndex(index)}
                        className={`px-3 py-2 text-xs rounded-md cursor-pointer transition-colors ${truckHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Driver Dropdown */}
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-slate-800">Driver Name</Label>
                <div className="relative">
                  {driverSearch && driverSuggestions.length > 0 && driverSuggestions[0].label.toLowerCase().startsWith(driverSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{driverSuggestions[0].label.slice(0, driverSearch.length)}</span>
                      <span>{driverSuggestions[0].label.slice(driverSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={driverSearch}
                    onChange={(e) => {
                      setDriverSearch(e.target.value);
                      setFormData(prev => ({ ...prev, driver: '' }));
                    }}
                    onFocus={() => setShowDriverDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDriverDropdown(false), 250)}
                    onKeyDown={handleDriverKeyDown}
                    placeholder="Search or type Driver..."
                    className={`h-9 text-xs font-bold text-slate-800 rounded-[8px] relative z-10 bg-transparent ${errors.driver ? 'border-red-500' : 'border-[#64748b59]'}`}
                  />
                </div>
                {renderError('driver')}

                {showDriverDropdown && driverSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {driverSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, driver: suggestion.value }));
                          setDriverSearch(suggestion.label);
                          setShowDriverDropdown(false);
                          setDriverHighlightIndex(-1);
                          setErrors(prev => ({ ...prev, driver: '' }));
                        }}
                        onMouseEnter={() => setDriverHighlightIndex(index)}
                        className={`px-3 py-2 text-xs rounded-md cursor-pointer transition-colors ${driverHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Attached Challans Information */}
          <div className="relative z-10 !overflow-visible">
            <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
                <span className="text-xs font-bold text-slate-700 tracking-wide">
                  2. Attached Challans Information
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {selectedChallans.length} {selectedChallans.length === 1 ? 'Challan' : 'Challans'} Attached
              </span>
            </div>

            {selectedChallans.length > 0 ? (
              <div className="border border-slate-200/90 rounded-xl overflow-x-auto shadow-xs bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-r border-slate-200 font-bold">Challan No</th>
                      <th className="p-3 border-r border-slate-200 font-bold">Station</th>
                      <th className="p-3 border-r border-slate-200 text-center font-bold">LRs</th>
                      <th className="p-3 border-r border-slate-200 text-center font-bold">Packages</th>
                      <th className="p-3 border-r border-slate-200 text-center font-bold">Weight (KG)</th>
                      <th className="p-3 border-r border-slate-200 text-center font-bold">Freight</th>
                      <th className="p-3 border-r border-slate-200 text-center font-bold text-orange-600">To Pay</th>
                      <th className="p-3 border-r border-slate-200 text-center font-bold text-emerald-600">Paid</th>
                      <th className="p-3 border-r border-slate-200 text-center font-bold text-blue-600">T.B.B</th>
                      <th className="p-3 text-center w-14 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                    {selectedChallans.map(c => {
                      const totalPackages = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0;
                      const totalWeight = c.bookings?.reduce((acc: number, b: any) => acc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0;
                      const totalLRFreight = c.bookings?.reduce((acc: number, b: any) => acc + (Number(b.charges?.freightAmount) || Number(b.charges?.totalAmount) || 0), 0) || 0;
                      
                      const toPayTotal = c.bookings?.reduce((acc: number, b: any) => acc + (b.paymentCondition === 'to_pay' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0) || 0;
                      const paidTotal = c.bookings?.reduce((acc: number, b: any) => acc + (b.paymentCondition === 'paid' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0) || 0;
                      const tbbTotal = c.bookings?.reduce((acc: number, b: any) => acc + (b.paymentCondition === 'tbb' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0) || 0;
                      
                      return (
                        <tr key={c._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-3 font-bold text-brand-primary border-r border-slate-100">CH-{c.challanNumber}</td>
                          <td className="p-3 font-bold text-brand-primary uppercase border-r border-slate-100">{c.memoDestinationBranch?.name || c.memoDestinationBranch?.code || c.memoDestinationBranch || 'N/A'}</td>
                          <td className="p-3 font-bold text-slate-800 text-center border-r border-slate-100">{c.bookings?.length || 0}</td>
                          <td className="p-3 text-center border-r border-slate-100 font-semibold text-slate-700">{totalPackages}</td>
                          <td className="p-3 text-center border-r border-slate-100 font-semibold text-slate-700">{totalWeight} KG</td>
                          <td className="p-3 text-center font-bold text-slate-800 border-r border-slate-100">₹{totalLRFreight}</td>
                          <td className="p-3 text-center font-bold text-orange-600 border-r border-slate-100">
                            {toPayTotal > 0 ? `₹${toPayTotal}` : '-'}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-600 border-r border-slate-100">
                            {paidTotal > 0 ? `₹${paidTotal}` : '-'}
                          </td>
                          <td className="p-3 text-center font-bold text-blue-600 border-r border-slate-100">
                            {tbbTotal > 0 ? `₹${tbbTotal}` : '-'}
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              type="button"
                              tabIndex={-1}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0 rounded-md"
                              onClick={() => removeChallan(c._id)}
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
                      <td colSpan={2} className="p-3 text-left uppercase text-xs">
                        Total Challans: <span className="text-brand-primary text-sm font-black">{selectedChallans.length}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800 text-sm">
                        {selectedChallans.reduce((acc, c) => acc + (c.bookings?.length || 0), 0)}
                      </td>
                      <td className="p-3 text-center text-brand-primary text-sm font-bold">
                        {selectedChallans.reduce((acc, c) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.packages) || 0), 0) || b.material?.quantity || 1), 0) || 0), 0)}
                      </td>
                      <td className="p-3 text-center text-brand-primary text-sm font-bold">
                        {selectedChallans.reduce((acc, c) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.items?.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0) || b.material?.weight || 0), 0) || 0), 0)} KG
                      </td>
                      <td className="p-3 text-center text-brand-primary text-sm font-bold">
                        ₹{selectedChallans.reduce((acc, c) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (Number(b.charges?.freightAmount) || Number(b.charges?.totalAmount) || 0), 0) || 0), 0)}
                      </td>
                      <td className="p-3 text-center text-orange-600 text-sm font-bold">
                        ₹{selectedChallans.reduce((acc, c) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.paymentCondition === 'to_pay' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0) || 0), 0)}
                      </td>
                      <td className="p-3 text-center text-emerald-600 text-sm font-bold">
                        ₹{selectedChallans.reduce((acc, c) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.paymentCondition === 'paid' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0) || 0), 0)}
                      </td>
                      <td className="p-3 text-center text-blue-600 text-sm font-bold">
                        ₹{selectedChallans.reduce((acc, c) => acc + (c.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.paymentCondition === 'tbb' ? (Number(b.charges?.totalAmount) || Number(b.charges?.freightAmount) || 0) : 0), 0) || 0), 0)}
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                {(!formData.fromBranch || !formData.toBranch) 
                  ? "Select From Branch and To Branch or use Super Auto-Fill to search Challan." 
                  : "No Challans added yet. Search and add Challan using the box above."}
              </div>
            )}
          </div>

          {/* Section 3: Amount & Financial Details */}
          <div className="relative z-10 !overflow-visible">
            <div className="flex items-center gap-2 pb-2 mb-3.5 border-b border-slate-100">
              <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
              <span className="text-xs font-bold text-slate-700 tracking-wide">
                3. Amount & Financial Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Total Amount</Label>
                <Input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-9 text-xs font-bold text-slate-900 rounded-[8px] border-[#64748b59] px-3"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Advance Amount</Label>
                <Input
                  type="number"
                  name="advanceAmount"
                  value={formData.advanceAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-9 text-xs font-bold text-slate-900 rounded-[8px] border-[#64748b59] px-3"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Commission</Label>
                <Input
                  type="number"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-9 text-xs font-bold text-slate-900 rounded-[8px] border-[#64748b59] px-3"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Hamali</Label>
                <Input
                  type="number"
                  name="hamali"
                  value={formData.hamali}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-9 text-xs font-bold text-slate-900 rounded-[8px] border-[#64748b59] px-3"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-800">Balance Amount</Label>
                <div className="h-9 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 flex items-center px-3 font-bold text-sm tracking-wide">
                  {'\u20B9'}{Number(calculateBalance() || 0).toFixed(2)}
                </div>
              </div>

              {/* Balance Paid By Dropdown */}
              <div className="space-y-1 relative sm:col-span-1 lg:col-span-1">
                <Label className="text-xs font-bold text-slate-800">Balance Paid By</Label>
                <div className="relative">
                  {balancePaidBySearch && balancePaidBySuggestions.length > 0 && balancePaidBySuggestions[0].label.toLowerCase().startsWith(balancePaidBySearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{balancePaidBySuggestions[0].label.slice(0, balancePaidBySearch.length)}</span>
                      <span>{balancePaidBySuggestions[0].label.slice(balancePaidBySearch.length)}</span>
                    </div>
                  )}
                  <Input
                    value={balancePaidBySearch}
                    onChange={(e) => {
                      setBalancePaidBySearch(e.target.value);
                      if (!e.target.value) setFormData(prev => ({ ...prev, balancePaidBy: '' }));
                    }}
                    onFocus={() => setShowBalancePaidByDropdown(true)}
                    onBlur={() => setTimeout(() => setShowBalancePaidByDropdown(false), 250)}
                    onKeyDown={handleBalancePaidByKeyDown}
                    placeholder="Search or type Branch..."
                    className="h-9 text-xs font-bold text-slate-800 rounded-[8px] relative z-10 bg-transparent border-[#64748b59]"
                  />
                </div>

                {showBalancePaidByDropdown && balancePaidBySuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {balancePaidBySuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, balancePaidBy: suggestion.value }));
                          setBalancePaidBySearch(suggestion.label);
                          setShowBalancePaidByDropdown(false);
                          setBalancePaidByHighlightIndex(-1);
                        }}
                        onMouseEnter={() => setBalancePaidByHighlightIndex(index)}
                        className={`px-3 py-2 text-xs rounded-md cursor-pointer transition-colors ${balancePaidByHighlightIndex === index ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {suggestion.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remark / Notes right next to Balance Paid By */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                <Label className="text-xs font-bold text-slate-800">Remark / Notes (Optional)</Label>
                <Input
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange as any}
                  placeholder="Enter remarks or notes..."
                  className="h-9 text-xs font-medium text-slate-800 rounded-[8px] border-[#64748b59] placeholder:text-slate-300 w-full"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons - Synced with LR Style */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Link href="/admin/lorry-hire">
            <Button 
              type="button" 
              variant="outline"
              className="h-9 px-4 rounded-[8px] border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
            >
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="h-9 px-5 rounded-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Lorry Hire
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded text-white">Ctrl+↵</kbd>
          </Button>
        </div>
      </form>
    </div>
  );
}





