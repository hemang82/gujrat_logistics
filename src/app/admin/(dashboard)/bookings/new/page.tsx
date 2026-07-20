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
import { Plus, Trash2, ArrowLeft, Printer } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { SearchSelect } from '@/components/ui/search-select';

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManual = searchParams.get('type') === 'manual';

  const [isLoading, setIsLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'print'>('save');
  const [isFetchingEway, setIsFetchingEway] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grNo, setGrNo] = useState('');
  const user = useUserStore((state) => state.user);

  // Autocomplete suggestion states
  const [consignorSuggestions, setConsignorSuggestions] = useState<any[]>([]);
  const [consigneeSuggestions, setConsigneeSuggestions] = useState<any[]>([]);
  const [showConsignorDropdown, setShowConsignorDropdown] = useState(false);
  const [showConsigneeDropdown, setShowConsigneeDropdown] = useState(false);
  const [consignorHighlightIndex, setConsignorHighlightIndex] = useState(-1);
  const [consigneeHighlightIndex, setConsigneeHighlightIndex] = useState(-1);

  // Branch autocomplete states
  const [destinationBranchSearch, setDestinationBranchSearch] = useState('');
  const [branchSuggestions, setBranchSuggestions] = useState<any[]>([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchHighlightIndex, setBranchHighlightIndex] = useState(-1);

  // Packaging & Description autocomplete states
  const [packagingSuggestions, setPackagingSuggestions] = useState<string[]>([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [activePackagingIndex, setActivePackagingIndex] = useState<number | null>(null);
  const [activeDescriptionIndex, setActiveDescriptionIndex] = useState<number | null>(null);
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

  useEffect(() => {
    fetch('/api/admin/branches?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && data.branches && data.branches.length > 0) {
          const list = data.branches.map((b: any) => ({
            value: b._id,
            label: `${b.name} (${b.code})`
          }));
          setBranchesList(list);
        }
      })
      .catch(err => console.error('Error fetching branches:', err));
  }, []);

  useEffect(() => {
    if (!isManual) {
      // Fetch bookings to determine next LR No for Auto LR Mode
      fetch('/api/admin/bookings')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            let maxNum = 10000;
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
            setGrNo(foundValid ? (maxNum + 1).toString() : '10001');
          } else {
            setGrNo('10001');
          }
        })
        .catch(err => {
          console.error(err);
          setGrNo('10001');
        });
    }
  }, [isManual]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        branch: user.branch || '',
        bookingBranch: user.bookingBranch || ''
      }));
    }
  }, [user]);

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

  // Filter branch suggestions locally from branchesList
  useEffect(() => {
    if (!destinationBranchSearch || destinationBranchSearch.trim().length < 1) {
      setBranchSuggestions([]);
      return;
    }
    const query = destinationBranchSearch.trim().toLowerCase();
    const filtered = branchesList.filter(b =>
      b.label.toLowerCase().includes(query) ||
      b.value.toLowerCase().includes(query)
    );
    setBranchSuggestions(filtered);
  }, [destinationBranchSearch, branchesList]);

  // Reset highlight index when suggestions change
  useEffect(() => {
    setBranchHighlightIndex(-1);
  }, [branchSuggestions]);

  const handleBranchSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDestinationBranchSearch(val);
    if (!val) {
      setFormData(prev => ({ ...prev, destinationBranch: '' }));
    }
  };

  const handleBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab key autocomplete selection
    if (e.key === 'Tab') {
      const firstMatch = branchSuggestions[0];
      if (firstMatch && destinationBranchSearch) {
        const hasMatch = firstMatch.label.toLowerCase().startsWith(destinationBranchSearch.toLowerCase());
        if (hasMatch) {
          setFormData(prev => ({ ...prev, destinationBranch: firstMatch.value }));
          setDestinationBranchSearch(firstMatch.label);
          setShowBranchDropdown(false);
          setBranchHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showBranchDropdown || branchSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBranchHighlightIndex(prev =>
        prev < branchSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBranchHighlightIndex(prev =>
        prev > 0 ? prev - 1 : branchSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (branchHighlightIndex >= 0 && branchHighlightIndex < branchSuggestions.length) {
        e.preventDefault();
        const selected = branchSuggestions[branchHighlightIndex];
        setFormData(prev => ({ ...prev, destinationBranch: selected.value }));
        setDestinationBranchSearch(selected.label);
        setShowBranchDropdown(false);
        setBranchHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowBranchDropdown(false);
      setBranchHighlightIndex(-1);
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

  // Fetch suggestions from masters API
  const fetchMasterSuggestions = useCallback(async (type: 'packaging' | 'description', query: string) => {
    if (!query || query.length < 1) {
      if (type === 'packaging') setPackagingSuggestions([]);
      else setDescriptionSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/masters?type=${type}&q=${encodeURIComponent(query)}&suggest=true`);
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
    for (const item of bookingItems) {
      if (item.packaging && item.packaging.trim()) {
        try {
          await fetch('/api/admin/masters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'packaging', name: item.packaging.trim() })
          });
        } catch { /* ignore */ }
      }
      if (item.description && item.description.trim()) {
        try {
          await fetch('/api/admin/masters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'description', name: item.description.trim() })
          });
        } catch { /* ignore */ }
      }
    }
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
  };

  const selectDescriptionSuggestion = (index: number, name: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], description: name };
    setItems(newItems);
    setActiveDescriptionIndex(null);
    setDescriptionSuggestions([]);
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

    // --- Common required fields (both modes) ---
    if (!formData.bookingBranch) newErrors.bookingBranch = "Booking Branch is required";
    if (!formData.destinationBranch) newErrors.destinationBranch = "Destination Branch is required";
    if (!formData.consignorName) newErrors.consignorName = "Consignor Name is required";
    if (!formData.consigneeName) newErrors.consigneeName = "Consignee Name is required";
    if (!formData.bookingDate) newErrors.bookingDate = "Booking Date is required";

    // --- LR No (manual mode: must enter, auto mode: auto-generated) ---
    if (isManual) {
      if (!formData.grNo) newErrors.grNo = "LR No is required";
    } else {
      if (!formData.grNo && !grNo) newErrors.grNo = "LR No could not be generated. Please refresh.";
    }

    // --- Phone validation (optional but must be valid if entered) ---
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.consignorPhone && !phoneRegex.test(formData.consignorPhone)) newErrors.consignorPhone = "Invalid 10-digit phone number";
    if (formData.consigneePhone && !phoneRegex.test(formData.consigneePhone)) newErrors.consigneePhone = "Invalid 10-digit phone number";

    // --- GST validation (optional but must be valid if entered) ---
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.consignorGst && !gstRegex.test(formData.consignorGst)) newErrors.consignorGst = "Invalid GST format";
    if (formData.consigneeGst && !gstRegex.test(formData.consigneeGst)) newErrors.consigneeGst = "Invalid GST format";

    // --- E-Way Bill: if entered must be 12 digits ---
    const ewayRegex = /^\d{12}$/;
    if (formData.ewayBillNo && !ewayRegex.test(formData.ewayBillNo)) newErrors.ewayBillNo = "E-Way Bill must be exactly 12 digits";

    // --- Item rows validation ---
    items.forEach((item, index) => {
      if (!item.packages) newErrors[`item_${index}_packages`] = "Pkgs required";
      if (!item.description) newErrors[`item_${index}_description`] = "Description required";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
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
        if (submitAction === 'print') {
          router.push(`/admin/bookings/${bookingId}?print=true`);
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
            {isManual ? 'Add Manual Booking' : 'Add New Booking'}
          </h1>
            <p className="text-xs text-gray-500 mt-0.5">
            {isManual ? 'Create handwritten Lorry Receipt (Bilty)' : 'Generate auto Lorry Receipt (Bilty)'}
          </p>
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
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Branch</Label>
                  <Input name="branch" value={formData.branch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm" />
                </div>
                <div className="space-y-1 relative pb-4">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">LR No <span className="text-red-500">*</span></Label>
                  <Input name="grNo" value={formData.grNo} onChange={handleChange} placeholder="Enter LR No" className={`h-10 rounded-lg text-sm font-semibold uppercase ${errors.grNo ? 'border-red-500' : 'border-gray-200'}`} />
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
                  <Input name="bookingBranch" value={formData.bookingBranch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm" />
                </div>
                <div className="space-y-1 relative">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Destination Branch <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    {/* Backdrop autocomplete suggestion */}
                    {destinationBranchSearch && branchSuggestions.length > 0 && branchSuggestions[0].label.toLowerCase().startsWith(destinationBranchSearch.toLowerCase()) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                        <span className="opacity-0">{branchSuggestions[0].label.slice(0, destinationBranchSearch.length)}</span>
                        <span>{branchSuggestions[0].label.slice(destinationBranchSearch.length)}</span>
                      </div>
                    )}
                    <Input
                      name="destinationBranchSearch"
                      value={destinationBranchSearch}
                      onChange={handleBranchSearchChange}
                      onFocus={() => setShowBranchDropdown(true)}
                      onBlur={() => setTimeout(() => setShowBranchDropdown(false), 250)}
                      onKeyDown={handleBranchKeyDown}
                      placeholder="Search or type Branch..."
                      className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.destinationBranch ? 'border-red-500' : 'border-gray-200'}`}
                    />
                  </div>
                  {renderError('destinationBranch')}

                  {showBranchDropdown && branchSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      {branchSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.value}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, destinationBranch: suggestion.value }));
                            setDestinationBranchSearch(suggestion.label);
                            setShowBranchDropdown(false);
                            setBranchHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === branchHighlightIndex
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'hover:bg-gray-50 text-gray-800'
                            }`}
                        >
                          <span>{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <div className="flex gap-2">
                      <Input name="ewayBillNo" value={formData.ewayBillNo} onChange={handleChange} placeholder="e.g. 123456789012" className={`h-10 rounded-lg font-semibold text-sm flex-1 ${errors.ewayBillNo ? 'border-red-500 focus-visible:ring-red-500' : 'border-emerald-500 focus-visible:ring-emerald-500'}`} />
                      <Button
                        type="button"
                        onClick={handleFetchEwayBill}
                        disabled={isFetchingEway}
                        className="h-10 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs"
                      >
                        {isFetchingEway ? 'Fetching...' : 'Fetch'}
                      </Button>
                    </div>
                    {renderError('ewayBillNo')}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">LR No</Label>
                    <Input name="grNo" value={formData.grNo || grNo} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed font-semibold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Branch</Label>
                    <Input name="branch" value={formData.branch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Booking Branch</Label>
                    <Input name="bookingBranch" value={formData.bookingBranch} readOnly className="h-10 rounded-lg border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm" />
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
                    <div className="relative">
                      {/* Backdrop autocomplete suggestion */}
                      {destinationBranchSearch && branchSuggestions.length > 0 && branchSuggestions[0].label.toLowerCase().startsWith(destinationBranchSearch.toLowerCase()) && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                          <span className="opacity-0">{branchSuggestions[0].label.slice(0, destinationBranchSearch.length)}</span>
                          <span>{branchSuggestions[0].label.slice(destinationBranchSearch.length)}</span>
                        </div>
                      )}
                      <Input
                        name="destinationBranchSearch"
                        value={destinationBranchSearch}
                        onChange={handleBranchSearchChange}
                        onFocus={() => setShowBranchDropdown(true)}
                        onBlur={() => setTimeout(() => setShowBranchDropdown(false), 250)}
                        onKeyDown={handleBranchKeyDown}
                        placeholder="Search or type Branch..."
                        className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.destinationBranch ? 'border-red-500' : 'border-gray-200'}`}
                      />
                    </div>
                    {renderError('destinationBranch')}

                    {showBranchDropdown && branchSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                        {branchSuggestions.map((suggestion, index) => (
                          <div
                            key={suggestion.value}
                            onMouseDown={() => {
                              setFormData(prev => ({ ...prev, destinationBranch: suggestion.value }));
                              setDestinationBranchSearch(suggestion.label);
                              setShowBranchDropdown(false);
                              setBranchHighlightIndex(-1);
                            }}
                            className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === branchHighlightIndex
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'hover:bg-gray-50 text-gray-800'
                              }`}
                          >
                            <span>{suggestion.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
              <div className="bg-gray-50 border-b border-gray-200 p-2.5 grid grid-cols-12 gap-3 text-xs font-bold text-gray-700 hidden lg:grid uppercase tracking-wider">
                <div className="col-span-1 text-center">Pkgs</div>
                <div className="col-span-2">Packaging</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Weight</div>
                <div className="col-span-1 text-center">N / W</div>
                <div className="col-span-1">Rate</div>
                <div className="col-span-2">Amount</div>
              </div>
              <div className="p-2.5 space-y-2 bg-white">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start border-b pb-2.5 lg:border-none lg:pb-0">
                    <div className="col-span-1 relative pb-4">
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">Pkgs</Label>
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
                      <Input
                        value={item.packaging}
                        onChange={(e) => handleItemChange(index, 'packaging', e.target.value)}
                        onFocus={() => { setActivePackagingIndex(index); fetchMasterSuggestions('packaging', item.packaging); }}
                        onBlur={() => setTimeout(() => setActivePackagingIndex(null), 200)}
                        placeholder="Bora / Bag / Roll"
                        className="h-10 text-sm rounded-lg border-gray-200"
                        autoComplete="off"
                      />
                      {activePackagingIndex === index && packagingSuggestions.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                          {packagingSuggestions.map((s, si) => (
                            <div
                              key={si}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              onMouseDown={() => selectPackagingSuggestion(index, s)}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-3 relative pb-4" ref={el => { descriptionDropdownRefs.current[index] = el; }}>
                      <Label className="text-xs font-semibold text-gray-500 lg:hidden">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        onFocus={() => { setActiveDescriptionIndex(index); fetchMasterSuggestions('description', item.description); }}
                        onBlur={() => setTimeout(() => setActiveDescriptionIndex(null), 200)}
                        placeholder="Hardware / Cycle / Kirana"
                        className={`h-10 text-sm rounded-lg ${errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-200'}`}
                        autoComplete="off"
                      />
                      {activeDescriptionIndex === index && descriptionSuggestions.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                          {descriptionSuggestions.map((s, si) => (
                            <div
                              key={si}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              onMouseDown={() => selectDescriptionSuggestion(index, s)}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
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
                    <Button
                      type="button"
                      onClick={handleFetchEwayBill}
                      disabled={isFetchingEway}
                      className="h-10 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs"
                    >
                      {isFetchingEway ? 'Fetching...' : 'Fetch'}
                    </Button>
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
                  â‚¹ {totals.total.toFixed(2)}
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
            {isLoading && submitAction === 'save' ? 'Submitting...' : 'Submit & Exit'}
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

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading new booking form...</div>}>
      <NewBookingForm />
    </Suspense>
  );
}

