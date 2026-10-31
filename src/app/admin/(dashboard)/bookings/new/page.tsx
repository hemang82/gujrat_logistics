'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, ArrowLeft, Printer, RefreshCw, ShieldCheck, ChevronDown, MapPin, AlertTriangle, CheckCircle2, Lock, RotateCcw, Building2, Loader2, X } from 'lucide-react';
import { getWhatsAppShareLink } from '@/lib/whatsappShare';
import { useUserStore } from '@/store/useUserStore';
import { SearchSelect } from '@/components/ui/search-select';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManual = searchParams.get('type') === 'manual';

  const [isLoading, setIsLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'print'>('save');
  const [isFetchingEway, setIsFetchingEway] = useState(false);
  const [isEwbLocked, setIsEwbLocked] = useState(false);
  const [showChangeEwbModal, setShowChangeEwbModal] = useState(false);

  // E-Way Bill Expired Modal State
  const [showEwbExpiredModal, setShowEwbExpiredModal] = useState(false);
  const [expiredEwbInfo, setExpiredEwbInfo] = useState<{
    ewbNo: string;
    validUpto: string;
    hoursSinceExpiry: number;
    consignorName: string;
    consignorPhone: string;
    invoiceNo: string;
  } | null>(null);

  // Quick-Add Destination Branch Modal State
  const [isQuickBranchModalOpen, setIsQuickBranchModalOpen] = useState(false);
  const [isSavingQuickBranch, setIsSavingQuickBranch] = useState(false);
  const [isFetchingQuickPincode, setIsFetchingQuickPincode] = useState(false);
  const [quickBranchData, setQuickBranchData] = useState({
    name: '',
    code: '',
    phone: '',
    pincode: '',
    state: 'Gujarat',
    city: ''
  });
  const [quickBranchErrors, setQuickBranchErrors] = useState<Record<string, string>>({});
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [areaSuggestions, setAreaSuggestions] = useState<any[]>([]);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [areaHighlightIndex, setAreaHighlightIndex] = useState(-1);

  // Search Area via India Postal Service & OpenStreetMap Fallback (Super Fast, 100% Free & Accurate for India)
  useEffect(() => {
    if (!areaSearchQuery || areaSearchQuery.trim().length < 2) {
      setAreaSuggestions([]);
      setShowAreaDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingArea(true);
      try {
        const query = areaSearchQuery.trim();
        
        // 1. First priority: India Postal Database API
        const postalRes = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`);
        const postalData = await postalRes.json();
        
        if (postalData && postalData[0] && postalData[0].Status === 'Success' && postalData[0].PostOffice?.length > 0) {
          const suggestions = postalData[0].PostOffice.slice(0, 10).map((po: any) => ({
            displayName: `${po.Name}, ${po.District}, ${po.State} - ${po.Pincode}`,
            areaName: po.Name,
            city: po.District,
            state: po.State,
            pincode: po.Pincode
          }));
          setAreaSuggestions(suggestions);
          setShowAreaDropdown(true);
        } else {
          // 2. Fallback to OpenStreetMap if not found in postal directory
          const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`, {
            headers: { 'Accept-Language': 'en' }
          });
          const osmData = await osmRes.json();
          if (Array.isArray(osmData) && osmData.length > 0) {
            const suggestions = osmData.map((item: any) => {
              const addr = item.address || {};
              const areaName = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.city_district || item.name || '';
              const city = addr.city || addr.town || addr.district || addr.county || '';
              const state = addr.state || 'Gujarat';
              const pincode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);

              return {
                displayName: item.display_name,
                areaName: areaName || city || item.name,
                city: city || areaName,
                state: state,
                pincode: pincode
              };
            });
            setAreaSuggestions(suggestions);
            setShowAreaDropdown(true);
          } else {
            setAreaSuggestions([]);
          }
        }
      } catch (err) {
        console.error('Error fetching area suggestions:', err);
      } finally {
        setIsSearchingArea(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [areaSearchQuery]);

  // Handle Area Selection from dropdown
  const handleSelectArea = async (item: any) => {
    const selectedArea = item.areaName || item.city;
    setAreaSearchQuery(selectedArea);
    setShowAreaDropdown(false);
    setAreaSuggestions([]);
    setAreaHighlightIndex(-1);

    const pin = item.pincode || '';
    setQuickBranchData(prev => ({
      ...prev,
      pincode: pin
    }));

    if (quickBranchErrors.area || quickBranchErrors.pincode) {
      setQuickBranchErrors(prev => {
        const copy = { ...prev };
        delete copy.area;
        delete copy.pincode;
        return copy;
      });
    }

    // If pincode found, fetch post offices so user can select location for exact city & state
    if (pin && pin.length === 6) {
      setIsFetchingQuickPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const json = await res.json();
        if (json && json[0] && json[0].Status === 'Success' && json[0].PostOffice?.length > 0) {
          const offices = json[0].PostOffice;
          setPincodePostOffices(offices);
          toast.info(`Pincode ${pin}: Select location below in PinCode to set City & State`);
        } else {
          // If no postal options, fall back to item city/state
          setQuickBranchData(prev => ({
            ...prev,
            city: item.city || prev.city,
            state: item.state || prev.state
          }));
        }
      } catch (err) {
        console.error('Error fetching pincode:', err);
      } finally {
        setIsFetchingQuickPincode(false);
      }
    } else {
      // Direct set if no 6 digit pin
      setQuickBranchData(prev => ({
        ...prev,
        city: item.city || prev.city,
        state: item.state || prev.state
      }));
    }
  };
  const [pincodePostOffices, setPincodePostOffices] = useState<any[]>([]);
  const [quickStateSuggestions, setQuickStateSuggestions] = useState<string[]>([]);
  const [showQuickStateDropdown, setShowQuickStateDropdown] = useState(false);
  const [quickStateHighlightIndex, setQuickStateHighlightIndex] = useState(-1);

  // Function to refresh branches list
  const refreshBranchesList = async (selectBranchId?: string) => {
    try {
      const url = selectedLogisticId ? `/api/admin/branches?limit=200&logisticId=${selectedLogisticId}` : '/api/admin/branches?limit=200';
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.branches && data.branches.length > 0) {
        const list = data.branches.map((b: any) => ({
          value: b._id,
          label: b.name
        }));
        setBranchesList(list);
        if (selectBranchId) {
          setFormData(prev => ({ ...prev, destinationBranch: selectBranchId }));
        }
      }
    } catch (e) {
      console.error('Error refreshing branches:', e);
    }
  };

  // Pincode auto-lookup in Quick-Add modal
  const handleQuickPincodeChange = async (pinValue: string) => {
    const cleaned = pinValue.replace(/\D/g, '').slice(0, 6);
    setQuickBranchData(prev => ({ ...prev, pincode: cleaned }));
    setPincodePostOffices([]);

    if (quickBranchErrors.pincode) {
      setQuickBranchErrors(prev => {
        const copy = { ...prev };
        delete copy.pincode;
        return copy;
      });
    }

    if (cleaned.length === 6) {
      setIsFetchingQuickPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const json = await res.json();
        if (json && json[0] && json[0].Status === 'Success' && json[0].PostOffice?.length > 0) {
          const offices = json[0].PostOffice;
          setPincodePostOffices(offices);
          toast.info(`Found ${offices.length} location(s). Select one to set City & State.`);
        } else {
          toast.error("Invalid Pincode or no data found.");
        }
      } catch (err) {
        console.error('Error fetching pincode:', err);
      } finally {
        setIsFetchingQuickPincode(false);
      }
    }
  };

  // Clear & Close Quick-Add Branch Modal
  const closeQuickBranchModal = () => {
    setIsQuickBranchModalOpen(false);
    setQuickBranchData({ name: '', code: '', phone: '', pincode: '', state: 'Gujarat', city: '' });
    setAreaSearchQuery('');
    setAreaSuggestions([]);
    setShowAreaDropdown(false);
    setPincodePostOffices([]);
    setQuickBranchErrors({});
    setIsFetchingQuickPincode(false);
  };

  const handleSaveQuickBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!quickBranchData.name.trim()) errs.name = "Please enter Branch Name";
    if (!quickBranchData.code.trim()) errs.code = "Please enter Branch Code";
    if (!quickBranchData.state.trim()) errs.state = "Please select a State";
    if (quickBranchData.phone && quickBranchData.phone.length !== 10) {
      errs.phone = "Phone must be exactly 10 digits";
    }
    if (quickBranchData.pincode && quickBranchData.pincode.length !== 6) {
      errs.pincode = "PinCode must be exactly 6 digits";
    }

    setQuickBranchErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSavingQuickBranch(true);
    try {
      const payload: any = {
        name: quickBranchData.name.trim(),
        code: quickBranchData.code.trim().toUpperCase(),
        phone: quickBranchData.phone.trim(),
        pincode: quickBranchData.pincode.trim(),
        state: quickBranchData.state.trim() || 'Gujarat',
        city: quickBranchData.city.trim()
      };

      if (user?.role === 'superadmin' && selectedLogisticId) {
        payload.logisticId = selectedLogisticId;
      }

      const res = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create branch');
      }

      toast.success(`Branch "${data.name}" created and selected!`);
      closeQuickBranchModal();
      
      // Refresh branch list and auto select the newly created branch
      await refreshBranchesList(data._id);
    } catch (err: any) {
      toast.error(err.message || 'Error saving branch');
    } finally {
      setIsSavingQuickBranch(false);
    }
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grNo, setGrNo] = useState('');
  const user = useUserStore((state) => state.user);

  const canAdd = user?.role === 'logistic' || user?.role === 'superadmin' || user?.permissions?.bookings?.canAdd !== false;

  // Superadmin Logistic Selection
  const [logistics, setLogistics] = useState<any[]>([]);
  const [selectedLogisticId, setSelectedLogisticId] = useState('');

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetch('/api/admin/logistics')
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setLogistics(data.data);
          }
        })
        .catch(err => console.error('Error fetching logistics:', err));
    }
  }, [user]);

  const [branches, setBranches] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/admin/branches')
      .then(res => res.json())
      .then(data => {
        if (data && data.branches) {
          setBranches(data.branches);
        }
      })
      .catch(err => console.error('Error fetching branches:', err));
  }, []);

  // Autocomplete suggestion states
  const [consignorSuggestions, setConsignorSuggestions] = useState<any[]>([]);
  const [consigneeSuggestions, setConsigneeSuggestions] = useState<any[]>([]);
  const [showConsignorDropdown, setShowConsignorDropdown] = useState(false);
  const [showConsigneeDropdown, setShowConsigneeDropdown] = useState(false);
  const [consignorHighlightIndex, setConsignorHighlightIndex] = useState(-1);
  const [consigneeHighlightIndex, setConsigneeHighlightIndex] = useState(-1);

  // Packaging & Description autocomplete states
  const [packagingSuggestions, setPackagingSuggestions] = useState<string[]>([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [activePackagingIndex, setActivePackagingIndex] = useState<number | null>(null);
  const [activeDescriptionIndex, setActiveDescriptionIndex] = useState<number | null>(null);
  const [packagingHighlightIndex, setPackagingHighlightIndex] = useState(-1);
  const [descriptionHighlightIndex, setDescriptionHighlightIndex] = useState(-1);
  const packagingDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descriptionDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Multi-EWB Tags state
  const [ewbList, setEwbList] = useState<string[]>([]);
  const [currentEwbInput, setCurrentEwbInput] = useState('');
  const [showAddEwbInput, setShowAddEwbInput] = useState(false);
  const [differentPartyModal, setDifferentPartyModal] = useState<{
    isOpen: boolean;
    consignorName: string;
    consignorGst: string;
    consigneeName: string;
    consigneeGst: string;
    incomingEwb: string;
  }>({
    isOpen: false,
    consignorName: '',
    consignorGst: '',
    consigneeName: '',
    consigneeGst: '',
    incomingEwb: ''
  });

  // Modal Focus Trap & Keyboard Navigation (Tab, Escape, Enter)
  const activeModalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isAnyModalOpen = showEwbExpiredModal || differentPartyModal.isOpen || showChangeEwbModal;
    if (!isAnyModalOpen) return;

    // Auto-focus first focusable element inside the open modal
    const timer = setTimeout(() => {
      if (activeModalContainerRef.current) {
        const focusable = activeModalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (!activeModalContainerRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showEwbExpiredModal) {
          setShowEwbExpiredModal(false);
          setFormData(prev => ({ ...prev, ewayBillNo: '' }));
        } else if (differentPartyModal.isOpen) {
          setDifferentPartyModal({
            isOpen: false,
            consignorName: '',
            consignorGst: '',
            consigneeName: '',
            consigneeGst: '',
            incomingEwb: ''
          });
          setCurrentEwbInput('');
          setShowAddEwbInput(false);
        } else if (showChangeEwbModal) {
          setShowChangeEwbModal(false);
        }
        return;
      }

      if (e.key === 'Tab') {
        const focusable = activeModalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift + Tab -> if on first, cycle to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab -> if on last, cycle to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleModalKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleModalKeyDown);
    };
  }, [showEwbExpiredModal, differentPartyModal.isOpen, showChangeEwbModal]);

  const handleFetchEwayBill = async (overrideNumber?: string, forceRefresh = false) => {
    const targetEwb = (overrideNumber || currentEwbInput || formData.ewayBillNo || '').trim();

    setErrors(prev => {
      const copy = { ...prev };
      delete copy.ewayBillNo;
      return copy;
    });

    if (!targetEwb || targetEwb.length !== 12) {
      setErrors(prev => ({
        ...prev,
        ewayBillNo: "Please enter a valid 12-digit E-Way Bill Number"
      }));
      return;
    }

    if (ewbList.includes(targetEwb)) {
      toast.info(`E-Way Bill ${targetEwb} is already added!`);
      setCurrentEwbInput('');
      setShowAddEwbInput(false);
      return;
    }

    setIsFetchingEway(true);
    try {
      const url = `/api/admin/bookings/fetch-ewaybill?number=${targetEwb}${forceRefresh ? '&refresh=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Check if E-Way Bill is EXPIRED
      if (data.isExpired) {
        setExpiredEwbInfo({
          ewbNo: data.ewayBillNo || targetEwb,
          validUpto: data.validUpto || 'Expired',
          hoursSinceExpiry: data.hoursSinceExpiry || 0,
          consignorName: data.consignor?.name || '',
          consignorPhone: data.consignor?.phone || '',
          invoiceNo: data.invoiceNumber || ''
        });
        setShowEwbExpiredModal(true);
        setIsEwbLocked(false);
        setErrors(prev => ({
          ...prev,
          ewayBillNo: `E-Way Bill is EXPIRED on ${data.validUpto || 'past date'}! Cannot load LR.`
        }));
        toast.error(`E-Way Bill Expired on ${data.validUpto || 'past date'}!`);
        return;
      }

      // STRICT VALIDATION: If we already have items / consignor loaded from a previous EWB, verify same party!
      if (ewbList.length > 0 && formData.consignorName) {
        const existingConsignorGst = (formData.consignorGst || '').trim().toUpperCase();
        const incomingConsignorGst = (data.consignor?.gst || '').trim().toUpperCase();
        const existingConsignorName = (formData.consignorName || '').trim().toLowerCase();
        const incomingConsignorName = (data.consignor?.name || '').trim().toLowerCase();

        const isGstMatch = existingConsignorGst && incomingConsignorGst && existingConsignorGst === incomingConsignorGst;
        const isNameMatch = existingConsignorName === incomingConsignorName;

        if (!isGstMatch && !isNameMatch) {
          // Different Party Detected! Block merging!
          setDifferentPartyModal({
            isOpen: true,
            consignorName: data.consignor?.name || 'Unknown',
            consignorGst: data.consignor?.gst || '',
            consigneeName: data.consignee?.name || 'Unknown',
            consigneeGst: data.consignee?.gst || '',
            incomingEwb: targetEwb
          });
          return;
        }

        // Same party verified! Merge EWB and items
        const updatedEwbList = [...ewbList, targetEwb];
        setEwbList(updatedEwbList);
        setFormData(prev => {
          const invList = (prev.invoiceNo ? prev.invoiceNo.split(',').map(s => s.trim()) : []);
          if (data.invoiceNumber && !invList.includes(data.invoiceNumber)) {
            invList.push(data.invoiceNumber);
          }
          return {
            ...prev,
            ewayBillNo: updatedEwbList.join(', '),
            invoiceNo: invList.join(', ')
          };
        });

        if (data.items && data.items.length > 0) {
          const newFormattedItems = data.items.map((item: any) => ({
            packages: item.packages.toString(),
            packaging: item.packaging,
            description: item.description,
            weight: item.weight.toString(),
            nw: item.nw || 'N',
            rate: item.rate.toString(),
            amount: item.amount.toString()
          }));
          setItems(prevItems => [...prevItems, ...newFormattedItems]);
        }

        setCurrentEwbInput('');
        setShowAddEwbInput(false);
        toast.success(`Additional E-Way Bill ${targetEwb} merged successfully!`);
        return;
      }

      // Primary EWB - Auto-fill initial values in form
      const initialEwbList = [targetEwb];
      setEwbList(initialEwbList);
      setFormData(prev => ({
        ...prev,
        ewayBillNo: targetEwb,
        consignorName: data.consignor.name,
        consignorGst: data.consignor.gst,
        consignorPhone: data.consignor.phone,
        consigneeName: data.consignee.name,
        consigneeGst: data.consignee.gst,
        consigneePhone: data.consignee.phone,
        destinationBranch: data.destinationBranch,
        invoiceNo: data.invoiceNumber || prev.invoiceNo || '',
        value: '', // Explicitly clear Value as requested
        freightAmount: data.items.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0).toString()
      }));

      // Map loaded items
      if (data.items && data.items.length > 0) {
        setItems(data.items.map((item: any) => ({
          packages: item.packages.toString(),
          packaging: item.packaging,
          description: item.description,
          weight: item.weight.toString(),
          nw: item.nw,
          rate: item.rate.toString(),
          amount: item.amount.toString()
        })));
      }

      setIsEwbLocked(true);
      setCurrentEwbInput('');
      setShowAddEwbInput(false);
      toast.success("E-Way Bill details fetched and verified!");
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        ewayBillNo: `Fetch failed: ${err.message || 'Could not reach server'}`
      }));
    } finally {
      setIsFetchingEway(false);
    }
  };

  const handleRemoveEwb = (ewbToRemove: string) => {
    const updated = ewbList.filter(e => e !== ewbToRemove);
    setEwbList(updated);
    if (updated.length === 0) {
      handleConfirmChangeEwb();
    } else {
      setFormData(prev => ({ ...prev, ewayBillNo: updated.join(', ') }));
      toast.info(`E-Way Bill ${ewbToRemove} removed.`);
    }
  };

  const handleOpenChangeModal = () => {
    setShowChangeEwbModal(true);
  };

  const handleConfirmChangeEwb = () => {
    setShowChangeEwbModal(false);
    setIsEwbLocked(false);
    setEwbList([]);
    setCurrentEwbInput('');
    setShowAddEwbInput(false);
    setFormData(prev => ({
      ...prev,
      ewayBillNo: '',
      consignorName: '',
      consignorGst: '',
      consignorPhone: '',
      consigneeName: '',
      consigneeGst: '',
      consigneePhone: '',
      destinationBranch: '',
      invoiceNo: '',
      value: '',
      freightAmount: '0.00'
    }));
    setItems([{
      packages: '1',
      packaging: 'Bora',
      description: 'Goods',
      weight: '0',
      nw: 'N',
      rate: '0',
      amount: '0'
    }]);
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.ewayBillNo;
      return copy;
    });
    toast.info("E-Way Bill cleared. You can now enter a new number.");
  };
  const [branchesList, setBranchesList] = useState<{ value: string; label: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    branch: '',
    grNo: '',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingBranch: '',
    destinationBranch: '',
    rateType: 'to_pay', // "to_pay" | "paid" | "tbb"

    consignorName: '',
    consignorGst: '',
    consignorPhone: '',
    consigneeName: '',
    consigneeGst: '',
    consigneePhone: '',

    value: '',
    deliveryType: 'Godown Delivery',
    pvtMarka: '',
    invoiceNo: '',
    ewayBillNo: '',

    freightAmount: '0.00',
    pf: '0.00',
    labour: '0.00',
    ddCharge: '0.00',
    biltyCharge: '10.00',
    gstRate: '0',
  });

  useEffect(() => {
    const url = selectedLogisticId ? `/api/admin/branches?limit=100&logisticId=${selectedLogisticId}` : '/api/admin/branches?limit=100';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.branches && data.branches.length > 0) {
          const list = data.branches.map((b: any) => ({
            value: b._id,
            label: b.name
          }));
          setBranchesList(list);
        }
      })
      .catch(err => console.error('Error fetching branches:', err));
  }, [selectedLogisticId]);

  useEffect(() => {
    if (!isManual && formData.branch) {
      const baseUrl = `/api/admin/bookings?branch=${formData.branch}`;
      const url = selectedLogisticId ? `${baseUrl}&logisticId=${selectedLogisticId}` : baseUrl;
      // Fetch bookings to determine next LR No for Auto LR Mode
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            let maxNum = 1000;
            let foundValid = false;
            data.forEach((b: any) => {
              if (b.lrNumber) {
                const num = parseInt(b.lrNumber.replace(/\D/g, ''), 10);
                if (!isNaN(num)) {
                  foundValid = true;
                  if (num > maxNum) {
                    maxNum = num;
                  }
                }
              }
            });
            setGrNo(foundValid ? (maxNum + 1).toString() : '1001');
          } else {
            setGrNo('1001');
          }
        })
        .catch(err => {
          console.error(err);
          setGrNo('1001');
        });
    }
  }, [isManual, formData.branch, selectedLogisticId]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        branch: user.branch || '',
        bookingBranch: user.bookingBranch || ''
      }));
    }
  }, [user]);

  const [items, setItems] = useState([
    { packages: '', packaging: '', description: '', weight: '', nw: 'N', rate: '', amount: '' }
  ]);

  // Consignor suggestions autocomplete
  useEffect(() => {
    if (!formData.consignorName || formData.consignorName.length < 2) {
      setConsignorSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const url = selectedLogisticId 
          ? `/api/admin/bookings/suggest-customers?q=${encodeURIComponent(formData.consignorName)}&logisticId=${selectedLogisticId}`
          : `/api/admin/bookings/suggest-customers?q=${encodeURIComponent(formData.consignorName)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setConsignorSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching consignor suggestions', err);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.consignorName]);

  // Consignee suggestions autocomplete
  useEffect(() => {
    if (!formData.consigneeName || formData.consigneeName.length < 2) {
      setConsigneeSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const url = selectedLogisticId 
          ? `/api/admin/bookings/suggest-customers?q=${encodeURIComponent(formData.consigneeName)}&logisticId=${selectedLogisticId}`
          : `/api/admin/bookings/suggest-customers?q=${encodeURIComponent(formData.consigneeName)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setConsigneeSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching consignee suggestions', err);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.consigneeName]);

  // Reset highlight index when suggestions list changes
  useEffect(() => {
    setConsignorHighlightIndex(-1);
  }, [consignorSuggestions]);

  useEffect(() => {
    setConsigneeHighlightIndex(-1);
  }, [consigneeSuggestions]);

  const handleConsignorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab key autocomplete selection
    if (e.key === 'Tab') {
      const firstMatch = consignorSuggestions[0];
      if (firstMatch && formData.consignorName) {
        const hasMatch = firstMatch.name.toLowerCase().startsWith(formData.consignorName.toLowerCase());
        if (hasMatch) {
          setFormData(prev => ({
            ...prev,
            consignorName: firstMatch.name,
            consignorGst: firstMatch.gst,
            consignorPhone: firstMatch.phone
          }));
          setShowConsignorDropdown(false);
          setConsignorHighlightIndex(-1);
          if (firstMatch.name.toLowerCase() !== formData.consignorName.toLowerCase()) {
            e.preventDefault();
          }
          return;
        }
      }
    }

    if (!showConsignorDropdown || consignorSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setConsignorHighlightIndex(prev =>
        prev < consignorSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setConsignorHighlightIndex(prev =>
        prev > 0 ? prev - 1 : consignorSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (consignorHighlightIndex >= 0 && consignorHighlightIndex < consignorSuggestions.length) {
        e.preventDefault();
        const selected = consignorSuggestions[consignorHighlightIndex];
        setFormData(prev => ({
          ...prev,
          consignorName: selected.name,
          consignorGst: selected.gst,
          consignorPhone: selected.phone
        }));
        setShowConsignorDropdown(false);
        setConsignorHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowConsignorDropdown(false);
      setConsignorHighlightIndex(-1);
    }
  };

  const handleConsigneeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab key autocomplete selection
    if (e.key === 'Tab') {
      const firstMatch = consigneeSuggestions[0];
      if (firstMatch && formData.consigneeName) {
        const hasMatch = firstMatch.name.toLowerCase().startsWith(formData.consigneeName.toLowerCase());
        if (hasMatch) {
          setFormData(prev => ({
            ...prev,
            consigneeName: firstMatch.name,
            consigneeGst: firstMatch.gst,
            consigneePhone: firstMatch.phone
          }));
          setShowConsigneeDropdown(false);
          setConsigneeHighlightIndex(-1);
          if (firstMatch.name.toLowerCase() !== formData.consigneeName.toLowerCase()) {
            e.preventDefault();
          }
          return;
        }
      }
    }

    if (!showConsigneeDropdown || consigneeSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setConsigneeHighlightIndex(prev =>
        prev < consigneeSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setConsigneeHighlightIndex(prev =>
        prev > 0 ? prev - 1 : consigneeSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (consigneeHighlightIndex >= 0 && consigneeHighlightIndex < consigneeSuggestions.length) {
        e.preventDefault();
        const selected = consigneeSuggestions[consigneeHighlightIndex];
        setFormData(prev => ({
          ...prev,
          consigneeName: selected.name,
          consigneeGst: selected.gst,
          consigneePhone: selected.phone
        }));
        setShowConsigneeDropdown(false);
        setConsigneeHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowConsigneeDropdown(false);
      setConsigneeHighlightIndex(-1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Apply validation mask
    if (name === 'consignorName' || name === 'consigneeName') {
      value = value.replace(/[^a-zA-Z\s.]/g, ''); // letters, spaces, dots
    } else if (name === 'consignorPhone' || name === 'consigneePhone') {
      value = value.replace(/\D/g, '').slice(0, 10); // only 10 digits
    } else if (name === 'consignorGst' || name === 'consigneeGst') {
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (['value', 'freightAmount', 'pf', 'labour', 'ddCharge', 'biltyCharge', 'gstRate', 'ewayBillNo', 'grNo'].includes(name)) {
      if (name === 'grNo') {
        value = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase(); // alphanumerics and dashes for manual LR
      } else if (name === 'ewayBillNo') {
        value = value.replace(/\D/g, '').slice(0, 12);
      } else {
        value = value.replace(/[^0-9.]/g, '');
        if ((value.match(/\./g) || []).length > 1) {
          value = value.slice(0, -1);
        }
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Reset highlight index when suggestions change
  useEffect(() => {
    setPackagingHighlightIndex(-1);
  }, [packagingSuggestions]);

  useEffect(() => {
    setDescriptionHighlightIndex(-1);
  }, [descriptionSuggestions]);

  // Fetch suggestions from masters API
  const fetchMasterSuggestions = useCallback(async (type: 'packaging' | 'description', query: string = '') => {
    try {
      const qParam = query && query.trim() ? `&q=${encodeURIComponent(query.trim())}` : '';
      const res = await fetch(`/api/admin/masters?type=${type}&suggest=true${qParam}`);
      if (res.ok) {
        const data = await res.json();
        const names = data.map((d: any) => d.name);
        if (type === 'packaging') setPackagingSuggestions(names);
        else setDescriptionSuggestions(names);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save new masters entries after successful booking
  const autoSaveMasters = useCallback(async (bookingItems: typeof items) => {
    const payloads = [];
    for (const item of bookingItems) {
      if (item.packaging && item.packaging.trim()) payloads.push({ type: 'packaging', name: item.packaging.trim() });
      if (item.description && item.description.trim()) payloads.push({ type: 'description', name: item.description.trim() });
    }
    
    if (payloads.length === 0) return;
    
    try {
      await fetch('/api/admin/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloads })
      });
    } catch { /* ignore */ }
  }, []);

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];

    if (field === 'packages') {
      value = value.replace(/\D/g, '');
    } else if (['weight', 'rate', 'amount'].includes(field)) {
      value = value.replace(/[^0-9.]/g, '');
      if ((value.match(/\./g) || []).length > 1) {
        value = value.slice(0, -1);
      }
    }

    newItems[index] = { ...newItems[index], [field]: value };

    // Fetch autocomplete suggestions for packaging / description
    if (field === 'packaging') {
      setActivePackagingIndex(index);
      setActiveDescriptionIndex(null);
      fetchMasterSuggestions('packaging', value);
    } else if (field === 'description') {
      setActiveDescriptionIndex(index);
      setActivePackagingIndex(null);
      fetchMasterSuggestions('description', value);
    }

    // Automatically calculate amount:
    // If NW basis is 'W' / 'w', calculate based on Weight. Otherwise calculate based on Packages.
    if (['packages', 'weight', 'rate', 'nw'].includes(field)) {
      const pkgs = parseInt(newItems[index].packages) || 0;
      const wt = parseFloat(newItems[index].weight) || 0;
      const rt = parseFloat(newItems[index].rate) || 0;
      const basis = (newItems[index].nw || 'N').toUpperCase();

      if (basis === 'W') {
        newItems[index].amount = (wt * rt).toFixed(2);
      } else {
        newItems[index].amount = (pkgs * rt).toFixed(2);
      }
    }

    setItems(newItems);

    // Recalculate freight total
    const totalFreight = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    setFormData(prev => ({ ...prev, freightAmount: totalFreight.toFixed(2) }));

    const errKey = `item_${index}_${field}`;
    if (errors[errKey]) {
      const newErrors = { ...errors };
      delete newErrors[errKey];
      setErrors(newErrors);
    }
  };

  const selectPackagingSuggestion = (index: number, name: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], packaging: name };
    setItems(newItems);
    setActivePackagingIndex(null);
    setPackagingSuggestions([]);
    setPackagingHighlightIndex(-1);
  };

  const selectDescriptionSuggestion = (index: number, name: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], description: name };
    setItems(newItems);
    setActiveDescriptionIndex(null);
    setDescriptionSuggestions([]);
    setDescriptionHighlightIndex(-1);
  };

  const handlePackagingKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && packagingSuggestions.length > 0 && items[index].packaging) {
      const firstMatch = packagingSuggestions[0];
      if (firstMatch.toLowerCase().startsWith(items[index].packaging.toLowerCase())) {
        selectPackagingSuggestion(index, firstMatch);
        if (firstMatch.toLowerCase() !== items[index].packaging.toLowerCase()) {
          e.preventDefault();
        }
        return;
      }
    }

    if (activePackagingIndex !== index || packagingSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPackagingHighlightIndex(prev => prev < packagingSuggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPackagingHighlightIndex(prev => prev > 0 ? prev - 1 : packagingSuggestions.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const targetIdx = packagingHighlightIndex >= 0 && packagingHighlightIndex < packagingSuggestions.length ? packagingHighlightIndex : 0;
      selectPackagingSuggestion(index, packagingSuggestions[targetIdx]);
    } else if (e.key === 'Escape') {
      setActivePackagingIndex(null);
      setPackagingHighlightIndex(-1);
    }
  };

  const handleDescriptionKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && descriptionSuggestions.length > 0 && items[index].description) {
      const firstMatch = descriptionSuggestions[0];
      if (firstMatch.toLowerCase().startsWith(items[index].description.toLowerCase())) {
        selectDescriptionSuggestion(index, firstMatch);
        if (firstMatch.toLowerCase() !== items[index].description.toLowerCase()) {
          e.preventDefault();
        }
        return;
      }
    }

    if (activeDescriptionIndex !== index || descriptionSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDescriptionHighlightIndex(prev => prev < descriptionSuggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDescriptionHighlightIndex(prev => prev > 0 ? prev - 1 : descriptionSuggestions.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const targetIdx = descriptionHighlightIndex >= 0 && descriptionHighlightIndex < descriptionSuggestions.length ? descriptionHighlightIndex : 0;
      selectDescriptionSuggestion(index, descriptionSuggestions[targetIdx]);
    } else if (e.key === 'Escape') {
      setActiveDescriptionIndex(null);
      setDescriptionHighlightIndex(-1);
    }
  };

  const addItem = () => {
    setItems([...items, { packages: '', packaging: '', description: '', weight: '', nw: 'N', rate: '', amount: '' }]);
  };

  const deleteItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);

    const totalFreight = newItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    setFormData(prev => ({ ...prev, freightAmount: totalFreight.toFixed(2) }));
  };

  const calculateTotal = () => {
    const freight = parseFloat(formData.freightAmount) || 0;
    const pf = parseFloat(formData.pf) || 0;
    const labour = parseFloat(formData.labour) || 0;
    const ddCharge = parseFloat(formData.ddCharge) || 0;
    const biltyCharge = parseFloat(formData.biltyCharge) || 0;
    const gstRate = parseFloat(formData.gstRate) || 0;

    const subTotal = freight + pf + labour + ddCharge + biltyCharge;
    const gstAmount = (subTotal * gstRate) / 100;
    const total = subTotal + gstAmount;

    return { subTotal, gstAmount, total };
  };

  // Keyboard Shortcut: Enter to instantly Save & Print
  const submitActionRef = useRef<'save' | 'print'>('save');

  

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // --- Common required fields (both modes) ---
    if (user?.role === 'superadmin' && !selectedLogisticId) newErrors.selectedLogisticId = "Select a Logistic Company";
    if (!formData.branch) newErrors.branch = "Please select a Booking Branch";
    if (!formData.destinationBranch) {
      newErrors.destinationBranch = "Please enter Destination Branch";
    } else if (formData.branch && formData.destinationBranch === formData.branch) {
      newErrors.destinationBranch = "Destination Branch cannot be the same as Booking Branch";
    }
    if (!formData.consignorName) newErrors.consignorName = "Please enter Consignor Name";
    if (!formData.consigneeName) newErrors.consigneeName = "Please enter Consignee Name";
    if (!formData.bookingDate) newErrors.bookingDate = "Please enter Booking Date";

    // --- LR No (manual mode: must enter, auto mode: auto-generated) ---
    if (isManual) {
      if (!formData.grNo) newErrors.grNo = "Please enter LR No";
    } else {
      if (!formData.grNo && !grNo) newErrors.grNo = "LR No could not be generated. Please refresh.";
    }

    // --- Phone validation (optional but must be valid if entered) ---
    const phoneRegex = /^\d{10}$/;
    if (formData.consignorPhone && !phoneRegex.test(formData.consignorPhone)) newErrors.consignorPhone = "Invalid 10-digit phone number";
    if (formData.consigneePhone && !phoneRegex.test(formData.consigneePhone)) newErrors.consigneePhone = "Invalid 10-digit phone number";

    // --- GST validation (optional but must be valid if entered) ---
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.consignorGst && !gstRegex.test(formData.consignorGst)) newErrors.consignorGst = "Invalid GST format";
    if (formData.consigneeGst && !gstRegex.test(formData.consigneeGst)) newErrors.consigneeGst = "Invalid GST format";

    // --- E-Way Bill: if entered must be 12 digits ---
    if (formData.ewayBillNo) {
      const ewbs = formData.ewayBillNo.split(',').map(s => s.trim()).filter(Boolean);
      const isAll12 = ewbs.length > 0 && ewbs.every(e => /^\d{12}$/.test(e));
      if (!isAll12) {
        newErrors.ewayBillNo = "Each E-Way Bill must be exactly 12 digits";
      }
    }

    // --- Item rows validation ---
    items.forEach((item, index) => {
      if (!item.packages) newErrors[`item_${index}_packages`] = "Pkgs required";
      if (!item.description) newErrors[`item_${index}_description`] = "Description required";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log("Form Validation Failed! Missing/Invalid fields:", newErrors);
      toast.error('Please fill all required fields before submitting.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { gstAmount, total } = calculateTotal();

    const payload = {
      bookingType: isManual ? 'manual' : 'auto',
      branch: formData.branch,
      lrNumber: isManual ? formData.grNo : (formData.grNo || grNo),
      bookingDate: new Date(formData.bookingDate),
      bookingBranch: formData.branch,
      destinationBranch: formData.destinationBranch,
      rateType: formData.rateType,
      paymentCondition: formData.rateType,

      consignor: {
        name: formData.consignorName,
        phone: formData.consignorPhone || '0000000000',
        address: "",
        gstNumber: formData.consignorGst
      },
      consignee: {
        name: formData.consigneeName,
        phone: formData.consigneePhone || '0000000000',
        address: "",
        gstNumber: formData.consigneeGst
      },

      items: items.map(item => ({
        packages: parseInt(item.packages) || 1,
        packaging: item.packaging || 'Bora',
        description: item.description || 'Goods',
        weight: parseFloat(item.weight) || 0,
        nw: item.nw || 'N',
        rate: parseFloat(item.rate) || 0,
        amount: parseFloat(item.amount) || 0
      })),

      value: parseFloat(formData.value) || 0,
      deliveryType: formData.deliveryType,
      pvtMarka: formData.pvtMarka,
      invoiceNo: formData.invoiceNo,
      ewayBillNo: formData.ewayBillNo,

      charges: {
        freightAmount: parseFloat(formData.freightAmount) || 0,
        hamali: parseFloat(formData.labour) || 0,
        surCharge: 0,
        pf: parseFloat(formData.pf) || 0,
        ddCharge: parseFloat(formData.ddCharge) || 0,
        biltyCharge: parseFloat(formData.biltyCharge) || 0,
        gstRate: parseFloat(formData.gstRate) || 0,
        gstAmount: gstAmount,
        totalAmount: total,
      }
    };

    try {
      // If superadmin, add logisticId to payload to assign it correctly
      if (user?.role === 'superadmin' && selectedLogisticId) {
        (payload as any).logisticId = selectedLogisticId;
      }

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('LR Generated Successfully!');
        const createdBooking = await response.json();
        const bookingId = createdBooking._id;

        // Auto-save packaging & description to masters for future suggestions
        await autoSaveMasters(items);

        router.refresh();
        const actionToPerform = submitActionRef.current || submitAction;
        if (actionToPerform === 'print') {
          router.push(`/admin/bookings/${bookingId}/print?print=true`);
        } else {
          router.push('/admin/bookings');
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create LR: ${errorData.error || errorData.details}`);
      }
    } catch (error) {
      toast.error('An error occurred while generating LR.');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotal();

  const renderError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-[10.5px] mt-1 font-medium leading-tight">{errors[field]}</p>;
    }
    return null;
  };

  const renderCellError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-[10px] font-medium absolute left-0 top-[calc(100%+3px)] leading-none whitespace-nowrap">{errors[field]}</p>;
    }
    return null;
  };


  if (user && !canAdd) {
    return (
      <div className="p-8 mt-10 max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-700">Access Denied</h2>
        <p className="text-sm text-red-600 mt-1">You do not have permission to add new Bookings. Please contact your Logistic Admin.</p>
        <Button 
          onClick={() => router.push('/admin/bookings')}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full pb-4">
      {/* Compact Header Card */}
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
            <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
              {isManual ? 'Add Manual Booking' : 'Add New Booking'}
            </h1>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
              {isManual ? 'Create handwritten lorry receipt (bilty)' : 'Generate auto lorry receipt (bilty)'}
            </p>
          </div>
        </div>
      </div>

      <form
        id="booking-form"
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const target = e.target as HTMLElement;
            // If Enter on E-Way bill input or fetch button, trigger fetch
            if (target && (target.getAttribute('name') === 'ewayBillNo' || target.id === 'fetch-ewb-btn' || target.closest('#fetch-ewb-btn'))) {
              e.preventDefault();
              e.stopPropagation();
              handleFetchEwayBill();
              return;
            }
            // If focus is directly on the submit buttons, allow normal submit; otherwise prevent auto form submission
            if (!target || (!target.closest('#save-print-share-btn') && !target.closest('#save-print-share-edit-btn') && target.tagName !== 'BUTTON')) {
              if (target && target.tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }
          }
        }}
        noValidate
        className="space-y-3"
      >
      
        {/* Superadmin Logistic Selection */}
        {user?.role === 'superadmin' && (
          <Card className="border border-blue-200 shadow-sm rounded-xl overflow-visible mb-4 bg-blue-50/50">
            <CardHeader className="border-b border-blue-100 py-2 px-3.5">
              <CardTitle className="text-xs font-bold text-blue-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Super Admin: Select Logistic Company
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="max-w-md">
                <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Logistic Company <span className="text-red-500">*</span></Label>
                <select 
                  className={`flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary ${errors.selectedLogisticId ? 'border-red-500' : 'border-[#64748b59]'}`}
                  value={selectedLogisticId}
                  onChange={(e) => {
                    setSelectedLogisticId(e.target.value);
                    setFormData(prev => ({ ...prev, bookingBranch: '', destinationBranch: '' }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.selectedLogisticId;
                      return newErrors;
                    });
                  }}
                  required
                >
                  <option value="" disabled>Select a company to create LR for</option>
                  {logistics.map(log => (
                    <option key={log._id} value={log._id}>{log.name}</option>
                  ))}
                </select>
                {errors.selectedLogisticId && (
                  <p className="text-xs text-red-500 mt-1">{errors.selectedLogisticId}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unified Single Sheet Card Container */}
        <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 sm:p-4 relative z-10 !overflow-visible space-y-4">
          {/* Section 1: Booking & Route Details */}
          <div className="relative z-40 focus-within:z-50 !overflow-visible">
            <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100">
              <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
              <span className="text-[11px] font-bold text-slate-700 tracking-wider">
                1. Booking & Route Details
              </span>
            </div>
          <div className="space-y-2.5">
            {isManual ? (
              /* Manual Mode (Row 1 & Row 2) */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1 relative pb-4 mb-0.5 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">LR No <span className="text-red-500">*</span></Label>
                    <Input name="grNo" value={formData.grNo} onChange={handleChange} placeholder="Please enter LR No" className={`h-9 rounded-[8px] text-sm font-medium text-slate-800 uppercase ${errors.grNo ? 'border-red-500' : 'border-[#64748b59]'}`} />
                    {renderError('grNo')}
                  </div>
                  <div className="space-y-1 relative sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Branch <span className="text-red-500">*</span></Label>
                    {user?.role === 'branch' ? (
                      <Input name="branch" value={(() => {
                        const b = branches.find(b => b._id === formData.branch);
                        return b ? `${b.name} (${b.code})` : formData.branch;
                      })()} readOnly className="h-9 rounded-[8px] border border-[#64748b59] bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-medium" />
                    ) : (
                      <BranchAutocomplete
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange as any}
                        options={branchesList}
                        placeholder="Search or type Branch..."
                        error={!formData.branch && !!errors.branch}
                      />
                    )}
                    {renderError('branch')}
                  </div>
                  <div className="space-y-1 flex flex-col justify-start sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800 mb-0.5">Booking Date <span className="text-red-500">*</span></Label>
                    <DatePicker
                      value={formData.bookingDate}
                      onChange={(dateStr) => setFormData(prev => ({ ...prev, bookingDate: dateStr }))}
                      className="h-9 rounded-[8px] border border-[#64748b59] text-sm"
                    />
                    {renderError('bookingDate')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-0.5">
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">E Way Bill No</Label>
                    <div className="relative flex items-center">
                      <Input 
                        name="ewayBillNo" 
                        value={formData.ewayBillNo} 
                        onChange={handleChange} 
                        maxLength={12}
                        readOnly={isEwbLocked}
                        placeholder="e.g. 123456789012" 
                        className={`h-9 rounded-[8px] font-medium text-sm w-full text-slate-800 ${isEwbLocked ? 'bg-emerald-50/70 border-emerald-400 font-bold text-emerald-950 pr-24 cursor-not-allowed select-none' : user?.ewbApiAccess ? 'pr-16 border-[#64748b59]' : 'border-[#64748b59]'} ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                      />
                      {user?.ewbApiAccess && (
                        isEwbLocked ? (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <span className="hidden sm:inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 mr-0.5 text-emerald-600" /> Verified
                            </span>
                            <Button
                              type="button"
                              onClick={handleOpenChangeModal}
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 rounded-md border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs shadow-none transition-colors"
                              title="Change E-Way Bill"
                            >
                              <RotateCcw className="w-3 h-3 mr-0.5 text-amber-700" /> Change
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleFetchEwayBill()}
                            disabled={isFetchingEway}
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold text-xs shadow-none transition-colors"
                          >
                            {isFetchingEway ? 'Fetching...' : 'Fetch'}
                          </Button>
                        )
                      )}
                    </div>
                    {renderError('ewayBillNo')}
                  </div>
                  <div className="space-y-1 relative sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Destination Branch <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1.5 items-center">
                      <div className="flex-1">
                        <BranchAutocomplete
                          name="destinationBranch"
                          value={formData.destinationBranch}
                          onChange={handleChange as any}
                          options={branchesList.filter(b => b.value !== formData.branch && b.value !== (user as any)?.branch)}
                          placeholder="Search or type Branch..."
                          error={!formData.destinationBranch && !!errors.destinationBranch}
                        />
                      </div>
                      <Button
                        type="button"
                        tabIndex={-1}
                        onClick={() => {
                          setQuickBranchErrors({});
                          setIsQuickBranchModalOpen(true);
                        }}
                        className="h-9 w-9 p-0 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-[8px] font-bold shrink-0 border border-brand-primary/20 flex items-center justify-center cursor-pointer transition-colors shadow-none"
                        title="Add New Destination Branch"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </Button>
                    </div>
                    {renderError('destinationBranch')}
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Rate Type</Label>
                    <ThemeSelect
                      name="rateType"
                      value={formData.rateType}
                      onChange={handleChange as any}
                      options={[
                        { value: 'to_pay', label: 'To Pay' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'tbb', label: 'T.B.B. (Account)' }
                      ]}
                      className="flex h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Auto Mode (Row 1 & Row 2) */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">LR No</Label>
                    <Input name="grNo" value={formData.grNo || grNo} readOnly disabled tabIndex={-1} className="h-9 rounded-[8px] border border-[#64748b59] bg-slate-100/70 text-slate-400 cursor-not-allowed select-none font-medium text-sm" />
                  </div>
                  <div className="space-y-1 relative sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Branch <span className="text-red-500">*</span></Label>
                    {user?.role === 'branch' ? (
                      <Input name="branch" value={branchesList.find(b => b.value === formData.branch)?.label || formData.branch} readOnly disabled tabIndex={-1} className="h-9 rounded-[8px] border border-[#64748b59] bg-slate-100/70 text-slate-400 cursor-not-allowed select-none text-sm font-medium" />
                    ) : (
                      <BranchAutocomplete
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange as any}
                        options={branchesList}
                        placeholder="Search or type Branch..."
                        error={!formData.branch && !!errors.branch}
                      />
                    )}
                    {renderError('branch')}
                  </div>
                  <div className="space-y-1 flex flex-col justify-start sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800 mb-0.5">Booking Date <span className="text-red-500">*</span></Label>
                    <DatePicker
                      value={formData.bookingDate}
                      onChange={(dateStr) => setFormData(prev => ({ ...prev, bookingDate: dateStr }))}
                      className="h-9 rounded-[8px] border border-[#64748b59] text-sm"
                    />
                    {renderError('bookingDate')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-0.5">
                  <div className="space-y-1 sm:max-w-[95%]">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-800">
                        E-Way Bill No {ewbList.length > 0 && <span className="text-[11px] font-semibold text-emerald-600">({ewbList.length} Attached)</span>}
                      </Label>
                      {isEwbLocked && !showAddEwbInput && user?.ewbApiAccess && (
                        <button
                          type="button"
                          onClick={() => setShowAddEwbInput(true)}
                          className="text-[11px] font-bold text-brand-primary hover:text-brand-primary-dark hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add More EWB
                        </button>
                      )}
                    </div>

                    {/* Multi-EWB Tags List */}
                    {ewbList.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {ewbList.map((ewbNo) => (
                          <span
                            key={ewbNo}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs animate-in fade-in-50 duration-150"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{ewbNo}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEwb(ewbNo)}
                              className="w-3.5 h-3.5 rounded-full hover:bg-emerald-200/60 inline-flex items-center justify-center text-emerald-700 hover:text-red-600 cursor-pointer transition-colors ml-0.5"
                              title="Remove this E-Way Bill"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <Button
                          type="button"
                          onClick={handleOpenChangeModal}
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1.5 text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                          title="Reset and clear all E-Way Bills"
                        >
                          <RotateCcw className="w-2.5 h-2.5 mr-0.5" /> Clear All
                        </Button>
                      </div>
                    )}

                    {/* Input Field: When 0 EWBs or when adding an additional EWB */}
                    {(ewbList.length === 0 || showAddEwbInput) && (
                      <div className="relative flex items-center">
                        <Input 
                          name="ewayBillNo" 
                          value={ewbList.length > 0 ? currentEwbInput : formData.ewayBillNo} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                            if (ewbList.length > 0) {
                              setCurrentEwbInput(val);
                            } else {
                              setFormData(prev => ({ ...prev, ewayBillNo: val }));
                            }
                          }} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              handleFetchEwayBill(ewbList.length > 0 ? currentEwbInput : formData.ewayBillNo);
                            }
                          }}
                          maxLength={12}
                          placeholder={ewbList.length > 0 ? "Enter another 12-digit EWB..." : "e.g. 123456789012"} 
                          className={`h-9 rounded-[8px] font-medium text-sm w-full text-slate-800 pr-20 border-[#64748b59] ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                          autoFocus={showAddEwbInput}
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {showAddEwbInput && (
                            <Button
                              type="button"
                              onClick={() => {
                                setShowAddEwbInput(false);
                                setCurrentEwbInput('');
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-7 px-1.5 text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </Button>
                          )}
                          {user?.ewbApiAccess && (
                            <Button
                              id="fetch-ewb-btn"
                              type="button"
                              onClick={() => handleFetchEwayBill(ewbList.length > 0 ? currentEwbInput : formData.ewayBillNo)}
                              disabled={isFetchingEway}
                              size="sm"
                              className="h-7 px-2.5 rounded-md bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold text-xs shadow-none transition-colors"
                            >
                              {isFetchingEway ? 'Fetching...' : (ewbList.length > 0 ? '+ Merge' : 'Fetch')}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    {renderError('ewayBillNo')}
                  </div>
                  <div className="space-y-1 relative sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Destination Branch <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1.5 items-center">
                      <div className="flex-1">
                        <BranchAutocomplete
                          name="destinationBranch"
                          value={formData.destinationBranch}
                          onChange={handleChange as any}
                          options={branchesList.filter(b => b.value !== formData.branch && b.value !== (user as any)?.branch)}
                          placeholder="Search or type Branch..."
                          error={!formData.destinationBranch && !!errors.destinationBranch}
                        />
                      </div>
                      <Button
                        type="button"
                        tabIndex={-1}
                        onClick={() => {
                          setQuickBranchErrors({});
                          setIsQuickBranchModalOpen(true);
                        }}
                        className="h-9 w-9 p-0 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-[8px] font-bold shrink-0 border border-brand-primary/20 flex items-center justify-center cursor-pointer transition-colors shadow-none"
                        title="Add New Destination Branch"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </Button>
                    </div>
                    {renderError('destinationBranch')}
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Rate Type</Label>
                    <ThemeSelect
                      name="rateType"
                      value={formData.rateType}
                      onChange={handleChange as any}
                      options={[
                        { value: 'to_pay', label: 'To Pay' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'tbb', label: 'T.B.B. (Account)' }
                      ]}
                      className="flex h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Consignor & Consignee Details */}
        <div className={`relative !overflow-visible transition-none ${showConsignorDropdown || showConsigneeDropdown ? "z-50" : "z-30 focus-within:z-50"}`}>

          <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100">
            <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
            <span className="text-[11px] font-bold text-slate-700 tracking-wider">
              2. Consignor & Consignee Details
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Left side: Consignor */}
            <div className="pr-0 lg:pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className={`sm:col-span-2 space-y-1 relative sm:max-w-[96%] ${showConsignorDropdown ? "z-50" : "z-20"}`}>
                  <Label className="text-xs font-bold text-slate-800 whitespace-nowrap">Consignor Name (Sender) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    {/* Backdrop autocomplete suggestion */}
                    {formData.consignorName && consignorSuggestions.length > 0 && consignorSuggestions[0].name.toLowerCase().startsWith(formData.consignorName.toLowerCase()) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-300 select-none font-medium z-0 pl-[1px]">
                        <span className="opacity-0">{consignorSuggestions[0].name.slice(0, formData.consignorName.length)}</span>
                        <span>{consignorSuggestions[0].name.slice(formData.consignorName.length)}</span>
                      </div>
                    )}
                    <Input
                      name="consignorName"
                      value={formData.consignorName}
                      onChange={handleChange}
                      onFocus={() => setShowConsignorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowConsignorDropdown(false), 250)}
                      onKeyDown={handleConsignorKeyDown}
                      placeholder="ABC Corporation"
                      className={`h-9 text-sm font-medium text-slate-800 rounded-[8px] relative z-10 bg-transparent ${errors.consignorName ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                  </div>
                  {renderError('consignorName')}

                  {showConsignorDropdown && consignorSuggestions.length > 0 && (
                    <div className="absolute z-[9999] mt-1 w-full bg-white rounded-xl border border-brand-primary p-1.5 shadow-2xl max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150 ring-1 ring-black/5">
                      {consignorSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.name}
                          onMouseDown={() => {
                            setFormData(prev => ({
                              ...prev,
                              consignorName: suggestion.name,
                              consignorGst: suggestion.gst,
                              consignorPhone: suggestion.phone
                            }));
                            setShowConsignorDropdown(false);
                            setConsignorHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === consignorHighlightIndex
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'hover:bg-gray-50 text-gray-800'
                            }`}
                        >
                          <span className="font-bold">{suggestion.name}</span>
                          <div className="flex gap-2 text-gray-400 font-semibold mt-0.5 text-[10px]">
                            {suggestion.gst && <span>GST: {suggestion.gst}</span>}
                            {suggestion.phone && <span>Phone: {suggestion.phone}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-1 space-y-1 sm:max-w-[96%]">
                  <Label className="text-xs font-bold text-slate-800 whitespace-nowrap">Consignor GST</Label>
                  <Input name="consignorGst" value={formData.consignorGst} onChange={handleChange} placeholder="24ABCDE1234F1Z1" className="h-9 text-xs sm:text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59] uppercase px-2.5" />
                  {renderError('consignorGst')}
                </div>
                <div className="sm:col-span-1 space-y-1 sm:max-w-[96%]">
                  <Label className="text-xs font-bold text-slate-800 whitespace-nowrap">Contact Phone</Label>
                  <Input name="consignorPhone" value={formData.consignorPhone} onChange={handleChange} placeholder="9876543210" className="h-9 text-xs sm:text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59] px-2.5" />
                  {renderError('consignorPhone')}
                </div>
              </div>
            </div>

            {/* Right side: Consignee */}
            <div className="pt-3 lg:pt-0 pl-0 lg:pl-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className={`sm:col-span-2 space-y-1 relative sm:max-w-[96%] ${showConsigneeDropdown ? "z-50" : "z-20"}`}>
                  <Label className="text-xs font-bold text-slate-800 whitespace-nowrap">Consignee Name (Receiver) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    {/* Backdrop autocomplete suggestion */}
                    {formData.consigneeName && consigneeSuggestions.length > 0 && consigneeSuggestions[0]?.name.toLowerCase().startsWith(formData.consigneeName.toLowerCase()) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-300 select-none font-medium z-0 pl-[1px]">
                        <span className="opacity-0">{consigneeSuggestions[0].name.slice(0, formData.consigneeName.length)}</span>
                        <span>{consigneeSuggestions[0].name.slice(formData.consigneeName.length)}</span>
                      </div>
                    )}
                    <Input
                      name="consigneeName"
                      value={formData.consigneeName}
                      onChange={handleChange}
                      onFocus={() => setShowConsigneeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowConsigneeDropdown(false), 250)}
                      onKeyDown={handleConsigneeKeyDown}
                      placeholder="XYZ Enterprises"
                      className={`h-9 text-sm font-medium text-slate-800 rounded-[8px] relative z-10 bg-transparent ${errors.consigneeName ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                  </div>
                  {renderError('consigneeName')}

                  {showConsigneeDropdown && consigneeSuggestions.length > 0 && (
                    <div className="absolute z-[9999] mt-1 w-full bg-white rounded-xl border border-brand-primary p-1.5 shadow-2xl max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150 ring-1 ring-black/5">
                      {consigneeSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.name}
                          onMouseDown={() => {
                            setFormData(prev => ({
                              ...prev,
                              consigneeName: suggestion.name,
                              consigneeGst: suggestion.gst,
                              consigneePhone: suggestion.phone
                            }));
                            setShowConsigneeDropdown(false);
                            setConsigneeHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === consigneeHighlightIndex
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'hover:bg-gray-50 text-gray-800'
                            }`}
                        >
                          <span className="font-bold">{suggestion.name}</span>
                          <div className="flex gap-2 text-gray-400 font-semibold mt-0.5 text-[10px]">
                            {suggestion.gst && <span>GST: {suggestion.gst}</span>}
                            {suggestion.phone && <span>Phone: {suggestion.phone}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-1 space-y-1 sm:max-w-[96%]">
                  <Label className="text-xs font-bold text-slate-800 whitespace-nowrap">Consignee GST</Label>
                  <Input name="consigneeGst" value={formData.consigneeGst} onChange={handleChange} placeholder="24ABCDE1234F1Z1" className="h-9 text-xs sm:text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59] uppercase px-2.5" />
                  {renderError('consigneeGst')}
                </div>
                <div className="sm:col-span-1 space-y-1 sm:max-w-[96%]">
                  <Label className="text-xs font-bold text-slate-800 whitespace-nowrap">Contact Phone</Label>
                  <Input name="consigneePhone" value={formData.consigneePhone} onChange={handleChange} placeholder="9876543210" className="h-9 text-xs sm:text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59] px-2.5" />
                  {renderError('consigneePhone')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Material & Parcel Details */}
        <div className={`relative !overflow-visible ${activePackagingIndex !== null || activeDescriptionIndex !== null ? "z-50" : "z-20 focus-within:z-50"}`}>
          <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100">
            <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
            <span className="text-[11px] font-bold text-slate-700 tracking-wider">
              3. Material & Packages Details
            </span>
          </div>
          <div className="space-y-2">
            <div className="border border-[#64748b59] rounded-[8px] overflow-visible">
              <div className="bg-slate-50 border-b border-gray-200 py-1.5 px-2.5 grid grid-cols-12 gap-2.5 text-xs font-bold text-slate-800 hidden lg:grid tracking-wider rounded-t-lg">
                <div className="col-span-1 text-center">Pkgs <span className="text-red-500">*</span></div>
                <div className="col-span-2">Packaging</div>
                <div className="col-span-3">Description <span className="text-red-500">*</span></div>
                <div className="col-span-2">Weight</div>
                <div className="col-span-1 text-center">N / W</div>
                <div className="col-span-1">Rate</div>
                <div className="col-span-2">Amount</div>
              </div>
              <div className="p-2 space-y-1.5 bg-white">
                {items.map((item, index) => (
                  <div key={index} className={`grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start border-b pb-2.5 lg:border-none lg:pb-0 relative ${activePackagingIndex === index || activeDescriptionIndex === index ? "z-50" : "z-10"}`}>

                    <div className="col-span-1 relative pb-4 mb-0.5">
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">Pkgs <span className="text-red-500">*</span></Label>
                      <Input
                        value={item.packages}
                        onChange={(e) => handleItemChange(index, 'packages', e.target.value)}
                        placeholder="Qty"
                        className={`h-9 text-sm font-medium text-slate-800 rounded-[8px] text-center ${errors[`item_${index}_packages`] ? 'border-red-500' : 'border-[#64748b59]'}`}
                      />
                      {renderCellError(`item_${index}_packages`)}
                    </div>
                    <div className={`col-span-2 relative pb-4 mb-0.5 ${activePackagingIndex === index ? "z-50" : "z-10"}`} ref={el => { packagingDropdownRefs.current[index] = el; }}>
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">Packaging</Label>
                      <div className="relative">
                        {/* Backdrop autocomplete suggestion */}
                        {item.packaging && activePackagingIndex === index && packagingSuggestions.length > 0 && packagingSuggestions[0].toLowerCase().startsWith(item.packaging.toLowerCase()) && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-300 select-none font-medium z-0 pl-[1px]">
                            <span className="opacity-0">{packagingSuggestions[0].slice(0, item.packaging.length)}</span>
                            <span>{packagingSuggestions[0].slice(item.packaging.length)}</span>
                          </div>
                        )}
                        <Input
                          value={item.packaging}
                          onChange={(e) => handleItemChange(index, 'packaging', e.target.value)}
                          onFocus={() => { setActivePackagingIndex(index); fetchMasterSuggestions('packaging', item.packaging); }}
                          onBlur={() => setTimeout(() => setActivePackagingIndex(null), 200)}
                          onKeyDown={(e) => handlePackagingKeyDown(index, e)}
                          placeholder="Bora / Bag / Roll"
                          className="h-9 text-sm font-medium text-slate-800 rounded-[8px] relative z-10 bg-transparent pr-7 border border-[#64748b59] focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 focus:bg-teal-50/20"
                          autoComplete="off"
                        />
                        {activePackagingIndex === index && packagingSuggestions.length > 0 && (
                          <div className="absolute z-[9999] mt-1 w-full bg-white rounded-xl border border-brand-primary p-1.5 shadow-2xl max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150 ring-1 ring-black/5">
                            {packagingSuggestions.map((s, si) => (
                              <div
                                key={si}
                                onMouseDown={() => selectPackagingSuggestion(index, s)}
                                className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${si === packagingHighlightIndex ? 'bg-brand-primary/10 text-brand-primary' : item.packaging === s ? 'bg-brand-primary/5 text-brand-primary font-bold' : 'hover:bg-gray-50 text-gray-700'} flex items-center justify-between !border-b !border-b-gray-100 last:!border-b-0 pb-1.5 mb-0.5`}
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`col-span-3 relative pb-4 mb-0.5 ${activeDescriptionIndex === index ? "z-50" : "z-10"}`} ref={el => { descriptionDropdownRefs.current[index] = el; }}>
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">Description <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        {/* Backdrop autocomplete suggestion */}
                        {item.description && activeDescriptionIndex === index && descriptionSuggestions.length > 0 && descriptionSuggestions[0].toLowerCase().startsWith(item.description.toLowerCase()) && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-300 select-none font-medium z-0 pl-[1px]">
                            <span className="opacity-0">{descriptionSuggestions[0].slice(0, item.description.length)}</span>
                            <span>{descriptionSuggestions[0].slice(item.description.length)}</span>
                          </div>
                        )}
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          onFocus={() => { setActiveDescriptionIndex(index); fetchMasterSuggestions('description', item.description); }}
                          onBlur={() => setTimeout(() => setActiveDescriptionIndex(null), 200)}
                          onKeyDown={(e) => handleDescriptionKeyDown(index, e)}
                          placeholder="Hardware / Cycle / Kirana"
                          className={`h-9 text-sm font-medium text-slate-800 rounded-[8px] relative z-10 bg-transparent ${errors[`item_${index}_description`] ? 'border-red-500' : 'border-[#64748b59]'}`}
                          autoComplete="off"
                        />
                        {activeDescriptionIndex === index && descriptionSuggestions.length > 0 && (
                          <div className="absolute z-[9999] mt-1 w-full bg-white rounded-xl border border-brand-primary p-1.5 shadow-2xl max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150 ring-1 ring-black/5">
                            {descriptionSuggestions.map((s, si) => (
                              <div
                                key={si}
                                onMouseDown={() => selectDescriptionSuggestion(index, s)}
                                className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${si === descriptionHighlightIndex ? 'bg-brand-primary/10 text-brand-primary' : item.description === s ? 'bg-brand-primary/5 text-brand-primary font-bold' : 'hover:bg-gray-50 text-gray-700'} flex items-center justify-between !border-b !border-b-gray-100 last:!border-b-0 pb-1.5 mb-0.5`}
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {renderCellError(`item_${index}_description`)}
                    </div>
                    <div className="col-span-2 relative pb-4 mb-0.5">
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">Weight</Label>
                      <Input
                        value={item.weight}
                        onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                        placeholder="0.00"
                        className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]"
                      />
                    </div>
                    <div className="col-span-1 relative pb-4 mb-0.5">
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">N / W</Label>
                      <ThemeSelect
                        name="nw"
                        value={item.nw || 'N'}
                        onChange={(e) => handleItemChange(index, 'nw', e.target.value)}
                        options={[
                          { value: 'N', label: 'N' },
                          { value: 'W', label: 'W' }
                        ]}
                        className="text-center font-bold px-1.5"
                      />
                    </div>
                    <div className="col-span-1 relative pb-4 mb-0.5">
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">Rate</Label>
                      <Input
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        placeholder="Rate"
                        className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]"
                      />
                    </div>
                    <div className="col-span-2 relative pb-4 mb-0.5 flex items-start gap-2">
                      <div className="w-full">
                        <Label className="text-xs font-bold text-slate-800 lg:hidden">Amount</Label>
                        <Input
                          value={item.amount}
                          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                          placeholder="Amount"
                          className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]"
                        />
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => deleteItem(index)}
                          className="h-9 w-9 rounded-lg text-red-500 hover:text-red-700 shrink-0 mt-0 lg:mt-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pr-1">
              <Button
                type="button"
                onClick={addItem}
                className="h-9 px-3.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-semibold flex items-center gap-1.5 border border-brand-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Row
              </Button>
            </div>
          </div>
        </div>

        {/* Sections 4 & 5: Side-by-Side Grid */}
        <div className="relative z-10 focus-within:z-50 !overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 items-stretch">
            {/* Section 4: Additional Details */}
            <div className="pr-0 lg:pr-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100">
                  <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
                  <span className="text-[11px] font-bold text-slate-700 tracking-wider">
                    4. Additional Details
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Invoice No</Label>
                    <Input name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} placeholder="e.g. INV-101" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    {renderError('invoiceNo')}
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Value</Label>
                    <Input name="value" value={formData.value} onChange={handleChange} placeholder="Goods Value" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    {renderError('value')}
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Del. Type</Label>
                    <ThemeSelect
                      name="deliveryType"
                      value={formData.deliveryType}
                      onChange={handleChange as any}
                      options={[
                        { value: 'Godown Delivery', label: 'Godown Delivery' },
                        { value: 'Door Delivery', label: 'Door Delivery' }
                      ]}
                      className="flex h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Pvt. Marka</Label>
                    <Input name="pvtMarka" value={formData.pvtMarka} onChange={handleChange} placeholder="e.g. 50" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    {renderError('pvtMarka')}
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">GST Rate (%)</Label>
                    <ThemeSelect
                      name="gstRate"
                      value={formData.gstRate}
                      onChange={handleChange as any}
                      options={[
                        { value: '0', label: '0% GST' },
                        { value: '5', label: '5% GST' },
                        { value: '12', label: '12% GST' },
                        { value: '18', label: '18% GST' }
                      ]}
                      className="flex h-9 w-full rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Custom GST (%)</Label>
                    <Input
                      name="gstRate"
                      value={formData.gstRate}
                      onChange={handleChange}
                      placeholder="e.g. 5 or 12"
                      className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59] w-full"
                    />
                  </div>
                  {isManual && (
                    <div className="space-y-1 sm:col-span-2 sm:max-w-[97.5%]">
                      <Label className="text-xs font-bold text-slate-800">E Way Bill No</Label>
                      <div className="relative flex items-center">
                        <Input 
                        name="ewayBillNo" 
                        value={formData.ewayBillNo} 
                        onChange={handleChange} 
                        maxLength={12}
                        readOnly={isEwbLocked}
                        placeholder="e.g. 123456789012" 
                        className={`h-9 rounded-[8px] font-medium text-sm w-full text-slate-800 ${isEwbLocked ? 'bg-emerald-50/70 border-emerald-400 font-bold text-emerald-950 pr-24 cursor-not-allowed select-none' : user?.ewbApiAccess ? 'pr-16 border-[#64748b59]' : 'border-[#64748b59]'} ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                      />
                      {user?.ewbApiAccess && (
                        isEwbLocked ? (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <span className="hidden sm:inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 mr-0.5 text-emerald-600" /> Verified
                            </span>
                            <Button
                              type="button"
                              onClick={handleOpenChangeModal}
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 rounded-md border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs shadow-none transition-colors"
                              title="Change E-Way Bill"
                            >
                              <RotateCcw className="w-3 h-3 mr-0.5 text-amber-700" /> Change
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleFetchEwayBill()}
                            disabled={isFetchingEway}
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold text-xs shadow-none transition-colors"
                          >
                            {isFetchingEway ? 'Fetching...' : 'Fetch'}
                          </Button>
                        )
                      )}
                      </div>
                      {renderError('ewayBillNo')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2 (Right): Section 5 + Action Buttons Stacked */}
            <div className="pt-3 lg:pt-0 pl-0 lg:pl-4 flex flex-col justify-between gap-3">
              {/* Section 5: Financial Charges (Compact) */}
              <div>
                <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100">
                  <span className="w-1.5 h-3.5 bg-brand-primary rounded-full inline-block"></span>
                  <span className="text-[11px] font-bold text-slate-700 tracking-wider">
                    5. Charges & Financials
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="space-y-1 sm:max-w-[95%]">
                      <Label className="text-xs font-bold text-slate-800">Freight</Label>
                      <Input name="freightAmount" value={formData.freightAmount} onChange={handleChange} placeholder="0.00" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    </div>
                    <div className="space-y-1 sm:max-w-[95%]">
                      <Label className="text-xs font-bold text-slate-800">PF</Label>
                      <Input name="pf" value={formData.pf} onChange={handleChange} placeholder="0.00" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    </div>
                    <div className="space-y-1 sm:max-w-[95%]">
                      <Label className="text-xs font-bold text-slate-800">Labour</Label>
                      <Input name="labour" value={formData.labour} onChange={handleChange} placeholder="0.00" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    </div>
                    <div className="space-y-1 sm:max-w-[95%]">
                      <Label className="text-xs font-bold text-slate-800">
                        {isManual ? 'Tempo Chg.' : 'DD Chg.'}
                      </Label>
                      <Input name="ddCharge" value={formData.ddCharge} onChange={handleChange} placeholder="0.00" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    <div className="space-y-1 sm:max-w-[95%]">
                      <Label className="text-xs font-bold text-slate-800">Bilty Chg.</Label>
                      <Input name="biltyCharge" value={formData.biltyCharge} onChange={handleChange} placeholder="10.00" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    </div>
                    <div className="space-y-1 sm:max-w-[95%]">
                      <Label className="text-xs font-bold text-slate-800">Total Amount</Label>
                      <div className="h-9 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 flex items-center px-3 font-bold text-sm">
                        {'\u20B9'} {totals.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Sits strictly under Section 5 on the right */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  className="h-9 px-4 rounded-[8px] border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={() => setSubmitAction('save')}
                  disabled={isLoading}
                  className="h-9 px-4 rounded-[8px] bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                >
                  {isLoading && submitAction === 'save' ? 'Submitting...' : 'Submit & Exit'}
                </Button>
                <Button
                  id="save-print-share-btn"
                  type="submit"
                  onClick={() => {
                    submitActionRef.current = 'print';
                    setSubmitAction('print');
                  }}
                  disabled={isLoading}
                  className="h-9 px-4.5 rounded-[8px] bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  {isLoading && submitAction === 'print' ? 'Printing...' : (
                    <>
                      <Printer className="w-3.5 h-3.5" /> Save & Print
                      
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Unified Single Sheet Card Container */}
        </div>

      
        {/* Different Party Validation Warning Modal */}
        {differentPartyModal.isOpen && (
          <div ref={activeModalContainerRef} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-100 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Different Party Detected! (અલગ પાર્ટી છે)</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    આ E-Way Bill (<strong className="text-red-700">{differentPartyModal.incomingEwb}</strong>) બીજા વેપારીનો છે. 
                    ટ્રાન્સપોર્ટ અને GST નિયમો મુજબ એક જ LR (બિલ્ટી) માં બે અલગ-અલગ પાર્ટીનો માલ મિક્સ કરી શકાતો નથી.
                  </p>
                </div>
              </div>

              {/* Party Comparison Table */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Current LR Party</span>
                    <p className="font-bold text-slate-800">{formData.consignorName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">GST: {formData.consignorGst || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-500 block mb-0.5">Incoming EWB Party</span>
                    <p className="font-bold text-red-700">{differentPartyModal.consignorName}</p>
                    <p className="text-[11px] text-red-600 font-mono">GST: {differentPartyModal.consignorGst || 'N/A'}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  💡 સલાહ: આ પાર્ટી ({differentPartyModal.consignorName}) માટે કૃપા કરીને અલગથી નવી LR બનાવો.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => {
                    setDifferentPartyModal({
                      isOpen: false,
                      consignorName: '',
                      consignorGst: '',
                      consigneeName: '',
                      consigneeGst: '',
                      incomingEwb: ''
                    });
                    setCurrentEwbInput('');
                    setShowAddEwbInput(false);
                  }}
                  className="h-9 px-5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
                >
                  OK, સમજાઈ ગયું (Close)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Theme Warning Modal for Changing E-Way Bill */}
        {showChangeEwbModal && (
          <div ref={activeModalContainerRef} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-amber-100/80 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change E-Way Bill?</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Changing the E-Way Bill will <strong className="text-amber-800">clear all fetched customer and item details</strong> so you can enter and verify a new E-Way Bill.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>This ensures your LR data matches the government GST portal.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChangeEwbModal(false)}
                  className="h-9 px-4 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmChangeEwb}
                  className="h-9 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
                >
                  Yes, Change EWB
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* E-Way Bill Expired Modal (Strict GST Rule & Optional WhatsApp Alert to Party) */}
        {showEwbExpiredModal && expiredEwbInfo && (
          <div ref={activeModalContainerRef} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 mb-1">
                    GST Rule Violation Detected
                  </div>
                  <h3 className="text-base font-bold text-red-950">E-Way Bill is EXPIRED!</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    This E-Way Bill (<strong className="font-mono text-red-800">{expiredEwbInfo.ewbNo}</strong>) has expired and is legally invalid for vehicle transit.
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Expired Date & Time:</span>
                  <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200 font-mono">
                    {expiredEwbInfo.validUpto}
                  </span>
                </div>
                {expiredEwbInfo.consignorName && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">Sender (Party):</span>
                    <span className="font-bold text-slate-800">{expiredEwbInfo.consignorName}</span>
                  </div>
                )}
                {expiredEwbInfo.invoiceNo && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">Invoice No:</span>
                    <span className="font-bold text-slate-800">{expiredEwbInfo.invoiceNo}</span>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  Government GST Rules for Expired E-Way Bill:
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1 text-amber-900/90">
                  <li><strong>Within 8 Hours of Expiry:</strong> Customer can <em>Extend Validity</em> on the GST EWB portal.</li>
                  <li><strong>After 8 Hours:</strong> Customer must <em>Generate a New E-Way Bill</em> for this invoice.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                {/* Optional WhatsApp Share Button: Only show if phone exists or user wants to send */}
                {expiredEwbInfo.consignorPhone && expiredEwbInfo.consignorPhone !== '0000000000' && expiredEwbInfo.consignorPhone.length >= 10 ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const logisticNameStr = user?.logisticName || 'Transport Office';
                      const message = `*E-Way Bill Expired Alert*\n\nHello *${expiredEwbInfo.consignorName || 'Customer'}*,\nYour E-Way Bill No: *${expiredEwbInfo.ewbNo}* (Invoice: ${expiredEwbInfo.invoiceNo || 'N/A'}) has EXPIRED on *${expiredEwbInfo.validUpto}*.\n\nAs per government GST rules, vehicles cannot travel with an expired EWB. Kindly extend the validity or generate a new E-Way Bill and send us the updated copy.\n\nRegards,\n*${logisticNameStr}*`;
                      const waLink = getWhatsAppShareLink(expiredEwbInfo.consignorPhone, message);
                      window.open(waLink, 'whatsapp_share_tab');
                    }}
                    className="w-full sm:w-auto h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Send WhatsApp to Party</span>
                  </Button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Party phone not found in EWB</span>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Retry with force-refresh to bypass stale cache */}
                  <Button
                    type="button"
                    onClick={() => {
                      const ewbToRetry = expiredEwbInfo.ewbNo;
                      setShowEwbExpiredModal(false);
                      setErrors(prev => { const c = { ...prev }; delete c.ewayBillNo; return c; });
                      handleFetchEwayBill(ewbToRetry, true); // forceRefresh=true bypasses cache
                    }}
                    className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Fresh Fetch
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEwbExpiredModal(false);
                      setFormData(prev => ({ ...prev, ewayBillNo: '' }));
                    }}
                    className="h-9 px-4 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Close &amp; Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      
        {/* Quick-Add Destination Branch Modal (Matching Branch Module Rules & Layout) */}
        {isQuickBranchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New Branch</h3>
                    <p className="text-[11px] text-slate-500">Quickly create and auto-select this branch</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeQuickBranchModal}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Row 1: Branch Name | Branch Code | Area / Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 capitalize">Branch Name <span className="text-red-500">*</span></Label>
                    <Input
                      name="quickName"
                      value={quickBranchData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const generatedCode = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                        setQuickBranchData(prev => ({
                          ...prev,
                          name: val,
                          code: generatedCode
                        }));
                        if (quickBranchErrors.name || quickBranchErrors.code) {
                          setQuickBranchErrors(prev => {
                            const copy = { ...prev };
                            delete copy.name;
                            delete copy.code;
                            return copy;
                          });
                        }
                      }}
                      placeholder="ex. Ahmedabad"
                      className={`h-10 text-sm font-semibold text-slate-900 rounded-[8px] ${quickBranchErrors.name ? 'border-red-500' : 'border-[#64748b59]'}`}
                    />
                    {quickBranchErrors.name && <p className="text-red-500 text-xs font-semibold mt-1">{quickBranchErrors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 capitalize">Branch Code <span className="text-red-500">*</span></Label>
                    <Input
                      name="quickCode"
                      value={quickBranchData.code}
                      readOnly
                      disabled
                      placeholder="Auto-Generated"
                      className="h-10 text-sm font-semibold text-slate-900 rounded-[8px] uppercase bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                    />
                    {quickBranchErrors.code && <p className="text-red-500 text-xs font-semibold mt-1">{quickBranchErrors.code}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <Label className="text-xs font-semibold text-slate-700 capitalize">Area / Search Location</Label>
                    <div className="relative">
                      <Input
                        name="quickAreaSearch"
                        value={areaSearchQuery}
                        onChange={(e) => setAreaSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (areaSuggestions.length > 0) setShowAreaDropdown(true);
                        }}
                        onClick={() => {
                          if (areaSuggestions.length > 0) setShowAreaDropdown(prev => !prev);
                        }}
                        onBlur={() => setTimeout(() => setShowAreaDropdown(false), 200)}
                        placeholder="Type area (e.g. Varachha)..."
                        autoComplete="off"
                        className="h-10 pr-8 text-sm font-semibold text-slate-900 rounded-[8px] border-[#64748b59]"
                      />
                      {isSearchingArea && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {showAreaDropdown && areaSuggestions.length > 0 && (
                        <div className="absolute z-[9999] left-0 right-0 mt-1 bg-white rounded-xl border border-brand-primary p-1.5 shadow-md max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150">
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Location:</div>
                          {areaSuggestions.map((item, idx) => (
                            <div
                              key={idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectArea(item);
                              }}
                              className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors hover:bg-brand-primary/10 hover:text-brand-primary text-slate-800 flex flex-col gap-0.5"
                            >
                              <div className="font-bold flex items-center justify-between">
                                <span>{item.areaName}</span>
                                {item.pincode && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                                    {item.pincode}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 truncate">{item.displayName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: PinCode | State | City / District */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 capitalize">PinCode</Label>
                    <div className="relative">
                      <Input
                        name="quickPincode"
                        value={quickBranchData.pincode}
                        onChange={(e) => handleQuickPincodeChange(e.target.value)}
                        placeholder="ex. 380015"
                        maxLength={6}
                        className={`h-10 pr-8 text-sm font-semibold text-slate-900 rounded-[8px] border-[#64748b59] ${quickBranchErrors.pincode ? 'border-red-500' : ''}`}
                      />
                      {isFetchingQuickPincode && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {pincodePostOffices.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1.5 w-full bg-white rounded-xl border-2 border-brand-primary/30 p-1.5 shadow-2xl shadow-brand-primary/10 ring-4 ring-brand-primary/10 max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150">
                          <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Select Location</div>
                          {pincodePostOffices.map((po: any, index: number) => (
                            <div
                              key={index}
                              onMouseDown={() => {
                                setQuickBranchData(prev => ({
                                  ...prev,
                                  city: po.District,
                                  state: po.State
                                }));
                                setPincodePostOffices([]);
                                toast.success(`Selected: ${po.Name} (${po.District}, ${po.State})`);
                              }}
                              className="flex flex-col px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors hover:bg-brand-primary/10 hover:text-brand-primary text-gray-800"
                            >
                              <span className="font-bold">{po.Name}</span>
                              <span className="text-[10px] text-gray-500">{po.District}, {po.State}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {quickBranchErrors.pincode && <p className="text-red-500 text-xs font-semibold mt-1">{quickBranchErrors.pincode}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <Label className="text-xs font-semibold text-slate-700 capitalize">State <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        name="quickState"
                        value={quickBranchData.state}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuickBranchData(prev => ({ ...prev, state: val }));
                          if (quickBranchErrors.state) {
                            setQuickBranchErrors(prev => {
                              const copy = { ...prev };
                              delete copy.state;
                              return copy;
                            });
                          }
                        }}
                        placeholder="Search State..."
                        className={`h-10 text-sm font-semibold text-slate-900 rounded-[8px] ${quickBranchErrors.state ? 'border-red-500' : 'border-[#64748b59]'}`}
                      />
                    </div>
                    {quickBranchErrors.state && <p className="text-red-500 text-xs font-semibold mt-1">{quickBranchErrors.state}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 capitalize">City / District</Label>
                    <Input
                      name="quickCity"
                      value={quickBranchData.city}
                      onChange={(e) => setQuickBranchData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Ahmedabad"
                      className="h-10 text-sm font-semibold text-slate-900 rounded-[8px] border border-[#64748b59]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeQuickBranchModal}
                  disabled={isSavingQuickBranch}
                  className="h-10 px-4 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveQuickBranch}
                  disabled={isSavingQuickBranch}
                  className="h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingQuickBranch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save & Select'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading new booking form...</div>}>
      <NewBookingForm />
    </Suspense>
  );
}






