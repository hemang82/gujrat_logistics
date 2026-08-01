'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2, ArrowLeft, Printer, ShieldCheck, ChevronDown, MapPin } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { SearchSelect } from '@/components/ui/search-select';
import { BranchAutocomplete } from '@/components/ui/branch-autocomplete';


export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'print'>('save');
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetchingEway, setIsFetchingEway] = useState(false);

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

  const handleFetchEwayBill = async () => {
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
      const res = await fetch(`/api/admin/bookings/fetch-ewaybill?number=${formData.ewayBillNo}`);
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
          branch: booking.branch?.code || booking.branch || booking.bookingBranch?.code || booking.bookingBranch || '',
          grNo: booking.lrNumber || '',
          bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
          bookingBranch: booking.bookingBranch?.code || booking.bookingBranch || '',
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

        const matchingBranch = branchesList.find(b => b.value === (booking.destinationBranch?._id || booking.destinationBranch));
        const fallbackLabel = booking.destinationBranch?.name ? `${booking.destinationBranch.name} (${booking.destinationBranch.code})` : (booking.destinationBranch?.code || booking.destinationBranch || '');
        setDestinationBranchSearch(matchingBranch ? matchingBranch.label : fallbackLabel);
        setItems(loadedItems);
      } catch (error) {
        toast.error('Could not load booking details');
      } finally {
        setIsFetching(false);
      }
    }
    if (id) fetchBooking();
  }, [id]);



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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bookingBranch) newErrors.bookingBranch = "Please enter Booking Branch";
    if (!formData.destinationBranch) newErrors.destinationBranch = "Please select Destination Branch";
    if (!formData.consignorName) newErrors.consignorName = "Please enter Consignor Name";
    if (!formData.consigneeName) newErrors.consigneeName = "Please enter Consignee Name";
    if (!formData.bookingDate) newErrors.bookingDate = "Please enter Booking Date";
    if (!formData.grNo) newErrors.grNo = "Please enter LR No";

    const phoneRegex = /^[6-9]\d{9}$/;
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
        toast.success('LR Updated Successfully!');
        router.refresh();
        if (submitAction === 'print') {
          router.push(`/admin/bookings/${id}?print=true`);
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
      return <p className="text-red-500 text-xs mt-1 font-semibold">{errors[field]}</p>;
    }
    return null;
  };

  const renderCellError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-xs font-semibold absolute left-0 bottom-0 leading-none">{errors[field]}</p>;
    }
    return null;
  };


  if (isFetching) {
    return <div className="p-8 text-center text-gray-500">Loading booking details...</div>;
  }

  return (
    <div className="w-full pb-8">
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
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
            {isManual ? 'Edit Manual Booking' : 'Edit Booking'}
          </h1>
            <p className="text-xs text-gray-500 mt-0.5">Modify Lorry Receipt (Bilty) details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Section 1: Booking & Route Details */}
        <Card className="border border-gray-100 shadow-sm rounded-xl relative z-20 !overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              1. Booking & Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {isManual ? (
              /* Manual Mode Row 1 (6 columns) */
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Branch Code</Label>
                  <Input name="branch" value={formData.branch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-semibold" />
                </div>
                <div className="space-y-1 relative pb-4">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">LR No <span className="text-red-500">*</span></Label>
                  <Input name="grNo" value={formData.grNo} onChange={handleChange} placeholder="Please enter LR No" className={`h-10 rounded-lg text-sm font-semibold uppercase ${errors.grNo ? 'border-red-500' : 'border-gray-200'}`} />
                  {renderError('grNo')}
                </div>
                <div className="space-y-1 flex flex-col justify-start">
                  <Label className="text-xs font-semibold text-gray-600 uppercase mb-0.5">Booking Date</Label>
                  <DatePicker
                    value={formData.bookingDate}
                    onChange={(dateStr) => setFormData(prev => ({ ...prev, bookingDate: dateStr }))}
                    className="h-10 rounded-lg border-gray-200 text-sm"
                  />
                  {renderError('bookingDate')}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Booking Branch</Label>
                  <Input name="bookingBranch" value={branchesList.find(b => b.code === formData.bookingBranch)?.label || formData.bookingBranch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-semibold" />
                </div>
                <div className="space-y-1 relative">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Destination Branch <span className="text-red-500">*</span></Label>
                  <BranchAutocomplete
                    name="destinationBranch"
                    value={formData.destinationBranch}
                    onChange={handleChange}
                    options={branchesList}
                    placeholder="Search or type Branch..."
                    error={!formData.destinationBranch && !!errors.destinationBranch}
                  />
                  {renderError('destinationBranch')}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Rate Type</Label>
                  <ThemeSelect
                    name="rateType"
                    value={formData.rateType}
                    onChange={handleChange as any}
                    options={[
                      { value: 'to_pay', label: 'To Pay' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'tbb', label: 'T.B.B. (Account)' }
                    ]}
                    className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                  />
                </div>
              </div>
            ) : (
              /* Auto Mode (Row 1 & Row 2) */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">E Way Bill No</Label>
                    <Input name="ewayBillNo" value={formData.ewayBillNo} onChange={handleChange} placeholder="e.g. 123456789012" className="h-10 rounded-lg border-emerald-500 focus-visible:ring-emerald-500 font-semibold text-sm" />
                    {renderError('ewayBillNo')}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">LR No</Label>
                    <Input name="grNo" value={formData.grNo} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed font-semibold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Branch Code</Label>
                    <Input name="branch" value={formData.branch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-semibold" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Booking Branch</Label>
                    <Input name="bookingBranch" value={branchesList.find(b => b.code === formData.bookingBranch)?.label || formData.bookingBranch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-0.5">
                  <div className="space-y-1 flex flex-col justify-start">
                    <Label className="text-xs font-semibold text-gray-600 uppercase mb-0.5">Booking Date</Label>
                    <DatePicker
                      value={formData.bookingDate}
                      onChange={(dateStr) => setFormData(prev => ({ ...prev, bookingDate: dateStr }))}
                      className="h-10 rounded-lg border-gray-200 text-sm"
                    />
                    {renderError('bookingDate')}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Rate Type</Label>
                    <ThemeSelect
                      name="rateType"
                      value={formData.rateType}
                      onChange={handleChange as any}
                      options={[
                        { value: 'to_pay', label: 'To Pay' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'tbb', label: 'T.B.B. (Account)' }
                      ]}
                      className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Destination Branch <span className="text-red-500">*</span></Label>
                    <BranchAutocomplete
                      name="destinationBranch"
                      value={formData.destinationBranch}
                      onChange={handleChange}
                      options={branchesList}
                      placeholder="Search or type Branch..."
                      error={!formData.destinationBranch && !!errors.destinationBranch}
                    />
                    {renderError('destinationBranch')}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Consignor & Consignee Details */}
        <Card className="border border-gray-100 shadow-sm rounded-xl relative z-10 !overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              2. Consignor & Consignee Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Left side: Consignor */}
            <div className="space-y-3.5 pr-0 md:pr-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Consignor (Sender)</h3>
              <div className="space-y-3.5">
                <div className="space-y-1 relative">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Consignor Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    {/* Backdrop autocomplete suggestion */}
                    {formData.consignorName && consignorSuggestions.length > 0 && consignorSuggestions[0].name.toLowerCase().startsWith(formData.consignorName.toLowerCase()) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
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
                      placeholder="e.g. ABC Corporation" 
                      className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.consignorName ? 'border-red-500' : 'border-gray-200'}`} 
                    />
                  </div>
                  {renderError('consignorName')}

                  {showConsignorDropdown && consignorSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
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
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Consignor GST</Label>
                  <Input name="consignorGst" value={formData.consignorGst} onChange={handleChange} placeholder="e.g. 24ABCDE1234F1Z1" className="h-10 text-sm rounded-lg border-gray-200 uppercase" />
                  {renderError('consignorGst')}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Contact Phone</Label>
                  <Input name="consignorPhone" value={formData.consignorPhone} onChange={handleChange} placeholder="e.g. 9876543210" className="h-10 text-sm rounded-lg border-gray-200" />
                  {renderError('consignorPhone')}
                </div>
              </div>
            </div>

            {/* Right side: Consignee */}
            <div className="space-y-3.5 pt-4 md:pt-0 pl-0 md:pl-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Consignee (Receiver)</h3>
              <div className="space-y-3.5">
                <div className="space-y-1 relative">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Consignee Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    {/* Backdrop autocomplete suggestion */}
                    {formData.consigneeName && consigneeSuggestions.length > 0 && consigneeSuggestions[0].name.toLowerCase().startsWith(formData.consigneeName.toLowerCase()) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
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
                      placeholder="e.g. XYZ Enterprises" 
                      className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.consigneeName ? 'border-red-500' : 'border-gray-200'}`} 
                    />
                  </div>
                  {renderError('consigneeName')}

                  {showConsigneeDropdown && consigneeSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
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
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Consignee GST</Label>
                  <Input name="consigneeGst" value={formData.consigneeGst} onChange={handleChange} placeholder="e.g. 24ABCDE1234F1Z1" className="h-10 text-sm rounded-lg border-gray-200 uppercase" />
                  {renderError('consigneeGst')}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Contact Phone</Label>
                  <Input name="consigneePhone" value={formData.consigneePhone} onChange={handleChange} placeholder="e.g. 9876543210" className="h-10 text-sm rounded-lg border-gray-200" />
                  {renderError('consigneePhone')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Material & Parcel Details */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              3. Material & Packages Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 p-2.5 grid grid-cols-12 gap-3 text-xs font-bold text-gray-700 hidden lg:grid uppercase tracking-wider rounded-t-lg">
                <div className="col-span-1 text-center">Pkgs <span className="text-red-500">*</span></div>
                <div className="col-span-2">Packaging</div>
                <div className="col-span-3">Description <span className="text-red-500">*</span></div>
                <div className="col-span-2">Weight</div>
                <div className="col-span-1 text-center">N / W</div>
                <div className="col-span-1">Rate</div>
                <div className="col-span-2">Amount</div>
              </div>
              <div className="p-2.5 space-y-2 bg-white">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start border-b pb-2.5 lg:border-none lg:pb-0">
                    <div className="col-span-1 relative pb-4">
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">Pkgs <span className="text-red-500">*</span></Label>
                      <Input
                        value={item.packages}
                        onChange={(e) => handleItemChange(index, 'packages', e.target.value)}
                        placeholder="Qty"
                        className={`h-10 text-sm rounded-lg text-center ${errors[`item_${index}_packages`] ? 'border-red-500' : 'border-gray-200'}`}
                      />
                      {renderCellError(`item_${index}_packages`)}
                    </div>
                    <div className="col-span-2 relative pb-4" ref={el => { packagingDropdownRefs.current[index] = el; }}>
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">Packaging</Label>
                      <div className="relative">
                        {/* Backdrop autocomplete suggestion */}
                        {item.packaging && activePackagingIndex === index && packagingSuggestions.length > 0 && packagingSuggestions[0].toLowerCase().startsWith(item.packaging.toLowerCase()) && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
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
                          className="h-10 text-sm rounded-lg relative z-10 bg-transparent border-gray-200"
                          autoComplete="off"
                        />
                        {activePackagingIndex === index && packagingSuggestions.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                            {packagingSuggestions.map((s, si) => (
                              <div
                                key={si}
                                onMouseDown={() => selectPackagingSuggestion(index, s)}
                                className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${si === packagingHighlightIndex
                                  ? 'bg-brand-primary/10 text-brand-primary'
                                  : 'hover:bg-gray-50 text-gray-800'
                                  }`}
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3 relative pb-4" ref={el => { descriptionDropdownRefs.current[index] = el; }}>
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">Description <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        {/* Backdrop autocomplete suggestion */}
                        {item.description && activeDescriptionIndex === index && descriptionSuggestions.length > 0 && descriptionSuggestions[0].toLowerCase().startsWith(item.description.toLowerCase()) && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
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
                          className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-200'}`}
                          autoComplete="off"
                        />
                        {activeDescriptionIndex === index && descriptionSuggestions.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                            {descriptionSuggestions.map((s, si) => (
                              <div
                                key={si}
                                onMouseDown={() => selectDescriptionSuggestion(index, s)}
                                className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${si === descriptionHighlightIndex
                                  ? 'bg-brand-primary/10 text-brand-primary'
                                  : 'hover:bg-gray-50 text-gray-800'
                                  }`}
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {renderCellError(`item_${index}_description`)}
                    </div>
                    <div className="col-span-2 relative pb-4">
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">Weight</Label>
                      <Input
                        value={item.weight}
                        onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                        placeholder="0.00"
                        className="h-10 text-sm rounded-lg border-gray-200"
                      />
                    </div>
                    <div className="col-span-1 relative pb-4">
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">N / W</Label>
                      <Input
                        value={item.nw}
                        onChange={(e) => handleItemChange(index, 'nw', e.target.value)}
                        placeholder="N"
                        className="h-10 text-sm rounded-lg border-gray-200 text-center"
                      />
                    </div>
                    <div className="col-span-1 relative pb-4">
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">Rate</Label>
                      <Input
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        placeholder="Rate"
                        className="h-10 text-sm rounded-lg border-gray-200"
                      />
                    </div>
                    <div className="col-span-2 relative pb-4 flex items-start gap-2">
                      <div className="w-full">
                        <Label className="text-xs font-semibold text-gray-500 lg:hidden">Amount</Label>
                        <Input
                          value={item.amount}
                          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                          placeholder="Amount"
                          className="h-10 text-sm rounded-lg border-gray-200"
                        />
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => deleteItem(index)}
                          className="h-10 w-10 rounded-lg text-red-500 hover:text-red-700 shrink-0 mt-0 lg:mt-0"
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
          </CardContent>
        </Card>

        {/* Section 4: Additional Details */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              4. Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isManual ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-3.5`}>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Value</Label>
                <Input name="value" value={formData.value} onChange={handleChange} placeholder="Goods Value" className="h-10 text-sm rounded-lg border-gray-200" />
                {renderError('value')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Del. Type</Label>
                <ThemeSelect
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange as any}
                  options={[
                    { value: 'Godown Delivery', label: 'Godown Delivery' },
                    { value: 'Door Delivery', label: 'Door Delivery' }
                  ]}
                  className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Pvt. Marka</Label>
                <Input name="pvtMarka" value={formData.pvtMarka} onChange={handleChange} placeholder="e.g. 50" className="h-10 text-sm rounded-lg border-gray-200" />
                {renderError('pvtMarka')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Invoice No</Label>
                <Input name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} placeholder="e.g. INV-101" className="h-10 text-sm rounded-lg border-gray-200" />
                {renderError('invoiceNo')}
              </div>
              {isManual && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">E Way Bill No</Label>
                  <div className="flex gap-2">
                    <Input name="ewayBillNo" value={formData.ewayBillNo} onChange={handleChange} placeholder="e.g. 123456789012" className={`h-10 rounded-lg text-sm flex-1 ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`} />
                    {user?.ewbApiAccess && (
                      <Button
                        type="button"
                        onClick={handleFetchEwayBill}
                        disabled={isFetchingEway}
                        className="h-10 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs"
                      >
                        {isFetchingEway ? 'Fetching...' : 'Fetch'}
                      </Button>
                    )}
                  </div>
                  {renderError('ewayBillNo')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Financial Charges */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              5. Charges & Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Freight</Label>
                <Input name="freightAmount" value={formData.freightAmount} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">PF</Label>
                <Input name="pf" value={formData.pf} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Labour</Label>
                <Input name="labour" value={formData.labour} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">
                  {isManual ? 'Tempo Chg.' : 'DD Chg.'}
                </Label>
                <Input name="ddCharge" value={formData.ddCharge} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Bilty Chg.</Label>
                <Input name="biltyCharge" value={formData.biltyCharge} onChange={handleChange} placeholder="10.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">GST Rate (%)</Label>
                <div className="flex gap-2">
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
                    className="flex h-10 w-28 rounded-lg border border-gray-200 px-3 text-sm focus-visible:outline-none"
                  />
                  <Input name="gstRate" value={formData.gstRate} onChange={handleChange} placeholder="Custom %" className="h-10 text-sm rounded-lg border-gray-200 w-full" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Total Amount</Label>
                <div className="h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-3 font-bold text-gray-700 text-sm">
                  {'\u20B9'} {totals.total.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            className="h-10 px-5 rounded-lg border-gray-200 hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => setSubmitAction('save')}
            disabled={isLoading}
            className="h-10 px-5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold transition-all shadow-sm"
          >
            {isLoading && submitAction === 'save' ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="submit"
            onClick={() => setSubmitAction('print')}
            disabled={isLoading}
            className="h-10 px-5 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            {isLoading && submitAction === 'print' ? 'Printing...' : (
              <>
                <Printer className="w-4 h-4" /> Save & Print
              </>
            )}
          </Button>
        </div>

      </form>

    </div>
  );
}
