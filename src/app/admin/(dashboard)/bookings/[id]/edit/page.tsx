'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, ArrowLeft, Printer, ShieldCheck, ChevronDown, MapPin, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { SearchSelect } from '@/components/ui/search-select';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';
import { getWhatsAppShareLink } from '@/lib/whatsappShare';


export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'print'>('save');
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetchingEway, setIsFetchingEway] = useState(false);
  const [loadedOnChallan, setLoadedOnChallan] = useState<string | null>(null);
  
  const user = useUserStore((state) => state.user);
  const canEdit = user?.role === 'logistic' || user?.role === 'superadmin' || user?.permissions?.bookings?.canEdit !== false;

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

  const handleFetchEwayBill = async (forceRefresh: boolean | any = false) => {
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.ewayBillNo;
      return copy;
    });

    if (!formData.ewayBillNo || formData.ewayBillNo.length !== 12) {
      setErrors(prev => ({
        ...prev,
        ewayBillNo: "Please enter a valid 12-digit E-Way Bill Number"
      }));
      return;
    }

    setIsFetchingEway(true);
    try {
      const url = `/api/admin/bookings/fetch-ewaybill?number=${formData.ewayBillNo}${forceRefresh ? '&refresh=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Auto-fill values in form
      setFormData(prev => ({
        ...prev,
        consignorName: data.consignor.name,
        consignorGst: data.consignor.gst,
        consignorPhone: data.consignor.phone,
        consigneeName: data.consignee.name,
        consigneeGst: data.consignee.gst,
        consigneePhone: data.consignee.phone,
        destinationBranch: data.destinationBranch,
        invoiceNo: data.invoiceNumber,
        value: data.totalValue.toString(),
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

      toast.success("E-Way Bill details fetched and auto-filled!");
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        ewayBillNo: `Fetch failed: ${err.message || 'Could not reach server'}`
      }));
    } finally {
      setIsFetchingEway(false);
    }
  };

  const [branchesList, setBranchesList] = useState<{ value: string; label: string; code: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    bookingType: 'auto',
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
    fetch('/api/admin/branches?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && data.branches && data.branches.length > 0) {
          const list = data.branches.map((b: any) => ({
            value: b._id,
            label: b.name,
            code: b.code || ''
          }));
          setBranchesList(list);
        }
      })
      .catch(err => console.error('Error fetching branches:', err));
  }, []);

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
        const res = await fetch(`/api/admin/bookings/suggest-customers?q=${encodeURIComponent(formData.consignorName)}`);
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
        const res = await fetch(`/api/admin/bookings/suggest-customers?q=${encodeURIComponent(formData.consigneeName)}`);
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

  const isManual = formData.bookingType === 'manual';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Apply validation mask
    if (name === 'consignorName' || name === 'consigneeName') {
      value = value.replace(/[^a-zA-Z\s.]/g, '');
    } else if (name === 'consignorPhone' || name === 'consigneePhone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'consignorGst' || name === 'consigneeGst') {
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (['value', 'freightAmount', 'pf', 'labour', 'ddCharge', 'biltyCharge', 'gstRate', 'ewayBillNo', 'grNo'].includes(name)) {
      if (name === 'grNo') {
        value = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
      } else if (name === 'ewayBillNo') {
        value = value.replace(/\D/g, '');
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

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/admin/bookings/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const booking = await res.json();

        // Map items from booking or synthesize one from legacy material field
        const loadedItems = booking.items && booking.items.length > 0
          ? booking.items.map((it: any) => ({
            packages: it.packages?.toString() || '',
            packaging: it.packaging || '',
            description: it.description || '',
            weight: it.weight?.toString() || '',
            nw: it.nw || 'N',
            rate: it.rate?.toString() || '',
            amount: it.amount?.toString() || ''
          }))
          : [{
            packages: booking.material?.quantity?.toString() || '1',
            packaging: booking.material?.packagingType || '',
            description: booking.material?.itemName || '',
            weight: booking.material?.weight?.toString() || '0',
            nw: 'N',
            rate: booking.material?.weight
              ? (booking.charges?.freightAmount / booking.material.weight).toFixed(2)
              : '0.00',
            amount: booking.charges?.freightAmount?.toString() || '0.00'
          }];

        setFormData({
          bookingType: booking.bookingType || 'auto',
          branch: booking.branch?._id || booking.branch || booking.bookingBranch?._id || booking.bookingBranch || '',
          grNo: booking.lrNumber || '',
          bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
          bookingBranch: booking.bookingBranch?._id || booking.bookingBranch || '',
          destinationBranch: booking.destinationBranch?._id || booking.destinationBranch || '',
          rateType: booking.rateType || booking.paymentCondition || 'to_pay',

          consignorName: booking.consignor?.name || '',
          consignorGst: booking.consignor?.gstNumber || '',
          consignorPhone: booking.consignor?.phone || '',
          consigneeName: booking.consignee?.name || '',
          consigneeGst: booking.consignee?.gstNumber || '',
          consigneePhone: booking.consignee?.phone || '',

          value: booking.value?.toString() || '',
          deliveryType: booking.deliveryType || 'Godown Delivery',
          pvtMarka: booking.pvtMarka || '',
          invoiceNo: booking.invoiceNo || '',
          ewayBillNo: booking.ewayBillNo || '',

          freightAmount: booking.charges?.freightAmount?.toString() || '0.00',
          pf: booking.charges?.pf?.toString() || '0.00',
          labour: booking.charges?.hamali?.toString() || '0.00',
          ddCharge: booking.charges?.ddCharge?.toString() || '0.00',
          biltyCharge: booking.charges?.biltyCharge?.toString() || '10.00',
          gstRate: booking.charges?.gstRate?.toString() || '0',
        });


        setItems(loadedItems);
        if (booking.loadedOnChallan) {
          setLoadedOnChallan(booking.loadedOnChallan);
        }
      } catch (error) {
        toast.error('Could not load booking details');
      } finally {
        setIsFetching(false);
      }
    }
    if (id) fetchBooking();
  }, [id]);



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

    if (!formData.bookingBranch) newErrors.bookingBranch = "Please enter Booking Branch";
    if (!formData.destinationBranch) {
      newErrors.destinationBranch = "Please select Destination Branch";
    } else if (formData.destinationBranch === (formData.bookingBranch || formData.branch)) {
      newErrors.destinationBranch = "Destination Branch cannot be the same as Booking Branch";
    }
    if (!formData.consignorName) newErrors.consignorName = "Please enter Consignor Name";
    if (!formData.consigneeName) newErrors.consigneeName = "Please enter Consignee Name";
    if (!formData.bookingDate) newErrors.bookingDate = "Please enter Booking Date";
    if (!formData.grNo) newErrors.grNo = "Please enter LR No";

    const phoneRegex = /^\d{10}$/;
    if (formData.consignorPhone && !phoneRegex.test(formData.consignorPhone)) newErrors.consignorPhone = "Invalid 10-digit phone number";
    if (formData.consigneePhone && !phoneRegex.test(formData.consigneePhone)) newErrors.consigneePhone = "Invalid 10-digit phone number";

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.consignorGst && !gstRegex.test(formData.consignorGst)) newErrors.consignorGst = "Invalid GST format";
    if (formData.consigneeGst && !gstRegex.test(formData.consigneeGst)) newErrors.consigneeGst = "Invalid GST format";

    const ewayRegex = /^\d{12}$/;
    if (formData.ewayBillNo && !ewayRegex.test(formData.ewayBillNo)) newErrors.ewayBillNo = "E-Way Bill must be exactly 12 digits";

    items.forEach((item, index) => {
      if (!item.packages) newErrors[`item_${index}_packages`] = "Please enter Pkgs";
      if (!item.description) newErrors[`item_${index}_description`] = "Please enter Description";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix validation errors');
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
      bookingType: formData.bookingType,
      branch: formData.branch,
      lrNumber: formData.grNo,
      bookingDate: new Date(formData.bookingDate),
      bookingBranch: formData.bookingBranch,
      destinationBranch: formData.destinationBranch,
      rateType: formData.rateType,
      paymentCondition: formData.rateType,

      consignor: {
        name: formData.consignorName,
        phone: formData.consignorPhone || '0000000000',
        address: formData.bookingBranch,
        gstNumber: formData.consignorGst
      },
      consignee: {
        name: formData.consigneeName,
        phone: formData.consigneePhone || '0000000000',
        address: formData.destinationBranch,
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
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        autoSaveMasters(items);
        toast.success('LR Updated Successfully!');
        router.refresh();
        const actionToPerform = submitActionRef.current || submitAction;
        if (actionToPerform === 'print') {
          router.push(`/admin/bookings/${id}/print?print=true`);
        } else {
          router.push(`/admin/bookings/${id}`);
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update LR: ${errorData.error || errorData.details}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating LR.');
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


  if (isFetching) {
    return <div className="p-8 text-center text-gray-500">Loading booking details...</div>;
  }

  if (loadedOnChallan) {
    return (
      <div className="p-8 mt-10 max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-xl text-center shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-amber-800">LR Edit Locked</h2>
        <p className="text-sm text-amber-700 mt-2">
          This LR is currently loaded on <strong className="font-extrabold text-amber-900">Challan No: {loadedOnChallan}</strong>.
        </p>
        <p className="text-xs text-amber-600 mt-1">
          To edit this LR, please remove it from the Challan first.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button 
            onClick={() => router.push(`/admin/bookings/${id}`)}
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            View LR Details
          </Button>
          <Button 
            onClick={() => router.push('/admin/bookings')}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold"
          >
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  if (user && !canEdit) {
    return (
      <div className="p-8 mt-10 max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-700">Access Denied</h2>
        <p className="text-sm text-red-600 mt-1">You do not have permission to edit Bookings. Please contact your Logistic Admin.</p>
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
              {isManual ? 'Edit Manual Booking' : 'Edit Booking'}
            </h1>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Modify lorry receipt (bilty) details</p>
          </div>
        </div>
      </div>

      <form
        id="edit-booking-form"
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
                  <div className="space-y-1 relative pb-4 mb-0.5 mb-0.5 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">LR No <span className="text-red-500">*</span></Label>
                    <Input name="grNo" value={formData.grNo} onChange={handleChange} placeholder="Please enter LR No" className={`h-9 rounded-[8px] text-sm font-medium text-slate-800 font-semibold uppercase ${errors.grNo ? 'border-red-500' : 'border-[#64748b59]'}`} />
                    {renderError('grNo')}
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Branch</Label>
                    <Input name="branch" value={branchesList.find(b => b.value === formData.branch)?.label || formData.branch} readOnly className="h-9 rounded-[8px] border border-[#64748b59] bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-medium" />
                  </div>
                  <div className="space-y-1 flex flex-col justify-start sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800 mb-0.5">Booking Date</Label>
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
                        placeholder="e.g. 123456789012" 
                        className={`h-9 rounded-[8px] font-medium text-sm w-full text-slate-800 ${user?.ewbApiAccess ? 'pr-16' : ''} ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : 'border-[#64748b59]'}`} 
                      />
                      {user?.ewbApiAccess && (
                        <Button
                          type="button"
                          onClick={() => handleFetchEwayBill()}
                          disabled={isFetchingEway}
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold text-xs shadow-none transition-colors"
                        >
                          {isFetchingEway ? 'Fetching...' : 'Fetch'}
                        </Button>
                      )}
                    </div>
                    {renderError('ewayBillNo')}
                  </div>
                  <div className="space-y-1 relative sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Destination Branch <span className="text-red-500">*</span></Label>
                    <BranchAutocomplete
                      name="destinationBranch"
                      value={formData.destinationBranch}
                      onChange={handleChange as any}
                      options={branchesList.filter(b => b.value !== formData.branch && b.value !== formData.bookingBranch && b.value !== (user as any)?.branch)}
                      placeholder="Search or type Branch..."
                      error={!formData.destinationBranch && !!errors.destinationBranch}
                    />
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
                    <Input name="grNo" value={formData.grNo} readOnly disabled tabIndex={-1} className="h-9 rounded-[8px] border border-[#64748b59] bg-slate-100/70 text-slate-400 cursor-not-allowed select-none font-medium text-sm" />
                  </div>
                  <div className="space-y-1 sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Branch</Label>
                    <Input name="branch" value={branchesList.find(b => b.value === formData.branch)?.label || formData.branch} readOnly disabled tabIndex={-1} className="h-9 rounded-[8px] border border-[#64748b59] bg-slate-100/70 text-slate-400 cursor-not-allowed select-none text-sm font-medium" />
                  </div>
                  <div className="space-y-1 flex flex-col justify-start sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800 mb-0.5">Booking Date</Label>
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFetchEwayBill();
                          }
                        }}
                        placeholder="e.g. 123456789012" 
                        className={`h-9 rounded-[8px] font-medium text-sm w-full text-slate-800 ${user?.ewbApiAccess ? 'pr-16' : ''} ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : 'border-[#64748b59]'}`} 
                      />
                      {user?.ewbApiAccess && (
                        <Button
                          id="fetch-ewb-btn"
                          type="button"
                          onClick={() => handleFetchEwayBill()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              handleFetchEwayBill();
                            }
                          }}
                          disabled={isFetchingEway}
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold text-xs shadow-none transition-colors"
                        >
                          {isFetchingEway ? 'Fetching...' : 'Fetch'}
                        </Button>
                      )}
                    </div>
                    {renderError('ewayBillNo')}
                  </div>
                  <div className="space-y-1 relative sm:max-w-[95%]">
                    <Label className="text-xs font-bold text-slate-800">Destination Branch <span className="text-red-500">*</span></Label>
                    <BranchAutocomplete
                      name="destinationBranch"
                      value={formData.destinationBranch}
                      onChange={handleChange as any}
                      options={branchesList.filter(b => b.value !== formData.branch && b.value !== formData.bookingBranch && b.value !== (user as any)?.branch)}
                      placeholder="Search or type Branch..."
                      error={!formData.destinationBranch && !!errors.destinationBranch}
                    />
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
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                            index === consignorHighlightIndex 
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
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                            index === consigneeHighlightIndex 
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

                    <div className="col-span-1 relative pb-4 mb-0.5 mb-0.5">
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">Pkgs <span className="text-red-500">*</span></Label>
                      <Input
                        value={item.packages}
                        onChange={(e) => handleItemChange(index, 'packages', e.target.value)}
                        placeholder="Qty"
                        className={`h-9 text-sm font-medium text-slate-800 rounded-[8px] text-center ${errors[`item_${index}_packages`] ? 'border-red-500' : 'border-[#64748b59]'}`}
                      />
                      {renderCellError(`item_${index}_packages`)}
                    </div>
                    <div className="col-span-2 relative pb-4 mb-0.5 mb-0.5" ref={el => { packagingDropdownRefs.current[index] = el; }}>
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
                    <div className="col-span-3 relative pb-4 mb-0.5 mb-0.5" ref={el => { descriptionDropdownRefs.current[index] = el; }}>
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
                    <div className="col-span-2 relative pb-4 mb-0.5 mb-0.5">
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
                    <div className="col-span-1 relative pb-4 mb-0.5 mb-0.5">
                      <Label className="text-xs font-bold text-slate-800 lg:hidden">Rate</Label>
                      <Input
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        placeholder="Rate"
                        className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]"
                      />
                    </div>
                    <div className="col-span-2 relative pb-4 mb-0.5 mb-0.5 flex items-start gap-2">
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
                    <Label className="text-xs font-bold text-slate-800">Invoice No</Label>
                    <Input name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} placeholder="e.g. INV-101" className="h-9 text-sm font-medium text-slate-800 rounded-[8px] border border-[#64748b59]" />
                    {renderError('invoiceNo')}
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
                          placeholder="e.g. 123456789012" 
                          className={`h-9 rounded-[8px] text-sm font-medium text-slate-800 w-full ${user?.ewbApiAccess ? 'pr-16' : ''} ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : 'border-[#64748b59]'}`} 
                        />
                        {user?.ewbApiAccess && (
                          <Button
                            type="button"
                            onClick={() => handleFetchEwayBill()}
                            disabled={isFetchingEway}
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold text-xs shadow-none transition-colors"
                          >
                            {isFetchingEway ? 'Fetching...' : 'Fetch'}
                          </Button>
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
                  {isLoading && submitAction === 'save' ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  id="save-print-share-edit-btn"
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

      </form>

    </div>
  );
}




