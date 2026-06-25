'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ThemeSelect } from '@/components/ui/theme-select';

export default function NewBookingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/vehicles').then(res => res.json()).then(data => setVehicles(data || [])).catch(console.error);
    fetch('/api/admin/drivers').then(res => res.json()).then(data => setDrivers(data || [])).catch(console.error);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    consignorName: '', consignorPhone: '', consignorAddress: '', consignorGst: '',
    consigneeName: '', consigneePhone: '', consigneeAddress: '', consigneeGst: '',
    pickupLocation: '', deliveryLocation: '',
    itemName: '', packagingType: '', quantity: '', weight: '', chargedWeight: '',
    freightAmount: '', hamali: '', surCharge: '', gstRate: '0', paymentCondition: 'to_pay',
    vehicle: '', driver: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Apply regex masking
    if (name === 'consignorName' || name === 'consigneeName') {
      value = value.replace(/[^a-zA-Z\s.]/g, ''); // letters, spaces, dots
    } else if (name === 'consignorPhone' || name === 'consigneePhone') {
      value = value.replace(/\D/g, '').slice(0, 10); // only digits, max 10
    } else if (name === 'consignorGst' || name === 'consigneeGst') {
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // uppercase alphanumeric
    } else if (['quantity', 'weight', 'chargedWeight', 'freightAmount', 'hamali', 'surCharge', 'gstRate'].includes(name)) {
      // allow numbers and decimal point
      value = value.replace(/[^0-9.]/g, '');
      // prevent multiple decimal points
      if ((value.match(/\./g) || []).length > 1) {
        value = value.slice(0, -1);
      }
    }

    setFormData({ ...formData, [name]: value });
    // Clear error for this field as the user types
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const calculateTotal = () => {
    const freight = parseFloat(formData.freightAmount) || 0;
    const hamali = parseFloat(formData.hamali) || 0;
    const surCharge = parseFloat(formData.surCharge) || 0;
    const gstRate = parseFloat(formData.gstRate) || 0;
    
    const subTotal = freight + hamali + surCharge;
    const gstAmount = (subTotal * gstRate) / 100;
    return { subTotal, gstAmount, total: subTotal + gstAmount };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const requiredFields = {
      consignorName: 'Consignor Name', 
      consignorAddress: 'Consignor Address', 
      consigneeName: 'Consignee Name', 
      consigneeAddress: 'Consignee Address', 
      pickupLocation: 'Pickup Location', 
      deliveryLocation: 'Delivery Location', 
      itemName: 'Item Name', 
      packagingType: 'Packaging Type', 
      quantity: 'Quantity', 
      weight: 'Actual Weight', 
      chargedWeight: 'Charged Weight', 
      freightAmount: 'Freight Amount', 
      paymentCondition: 'Payment Condition'
    };
    
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field as keyof typeof formData]) newErrors[field] = `Please enter ${label}`;
    });

    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.consignorPhone && !phoneRegex.test(formData.consignorPhone)) newErrors.consignorPhone = "Invalid 10-digit number";
    else if (!formData.consignorPhone) newErrors.consignorPhone = "Please enter Phone Number";
    
    if (formData.consigneePhone && !phoneRegex.test(formData.consigneePhone)) newErrors.consigneePhone = "Invalid 10-digit number";
    else if (!formData.consigneePhone) newErrors.consigneePhone = "Please enter Phone Number";

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.consignorGst && !gstRegex.test(formData.consignorGst)) newErrors.consignorGst = "Invalid GST format";
    if (formData.consigneeGst && !gstRegex.test(formData.consigneeGst)) newErrors.consigneeGst = "Invalid GST format";

    if (formData.quantity && Number(formData.quantity) <= 0) newErrors.quantity = "Must be > 0";
    if (formData.weight && Number(formData.weight) <= 0) newErrors.weight = "Must be > 0";
    if (formData.chargedWeight && Number(formData.chargedWeight) <= 0) newErrors.chargedWeight = "Must be > 0";
    if (formData.freightAmount && Number(formData.freightAmount) <= 0) newErrors.freightAmount = "Must be > 0";
    if (formData.hamali && Number(formData.hamali) < 0) newErrors.hamali = "Cannot be negative";
    if (formData.surCharge && Number(formData.surCharge) < 0) newErrors.surCharge = "Cannot be negative";
    
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
      consignor: { name: formData.consignorName, phone: formData.consignorPhone, address: formData.consignorAddress, gstNumber: formData.consignorGst },
      consignee: { name: formData.consigneeName, phone: formData.consigneePhone, address: formData.consigneeAddress, gstNumber: formData.consigneeGst },
      pickupLocation: formData.pickupLocation,
      deliveryLocation: formData.deliveryLocation,
      vehicle: formData.vehicle || undefined,
      driver: formData.driver || undefined,
      material: { 
        itemName: formData.itemName, packagingType: formData.packagingType, 
        quantity: parseInt(formData.quantity) || 1, 
        weight: parseFloat(formData.weight) || 0, 
        chargedWeight: parseFloat(formData.chargedWeight) || 0 
      },
      charges: {
        freightAmount: parseFloat(formData.freightAmount) || 0,
        hamali: parseFloat(formData.hamali) || 0,
        surCharge: parseFloat(formData.surCharge) || 0,
        gstRate: parseFloat(formData.gstRate) || 0,
        gstAmount: gstAmount,
        totalAmount: total,
      },
      paymentCondition: formData.paymentCondition,
    };

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('LR Generated Successfully!');
        router.push('/admin/bookings');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create LR: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while generating LR.');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotal();

  const ErrorText = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

  return (
    <div className="w-full pb-10">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">Create New LR (Bilty)</h1>
          <p className="text-brand-text-secondary mt-1">Fill all the details to generate a new Lorry Receipt.</p>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 font-medium">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Consignor Details */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
              <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">1</span>
                Consignor (Sender) Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Company / Name <span className="text-red-500">*</span></Label>
                <Input name="consignorName" placeholder="e.g. ABC Traders Pvt Ltd" value={formData.consignorName} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.consignorName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="consignorName" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-600 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                  <Input name="consignorPhone" placeholder="Enter 10-digit mobile number" value={formData.consignorPhone} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.consignorPhone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                  <ErrorText field="consignorPhone" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 font-medium">GST Number <span className="text-gray-400 font-normal">(Optional)</span></Label>
                  <Input name="consignorGst" placeholder="e.g. 24XXXXX1234X1ZX" value={formData.consignorGst} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm uppercase ${errors.consignorGst ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                  <ErrorText field="consignorGst" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Address / City <span className="text-red-500">*</span></Label>
                <Input name="consignorAddress" placeholder="e.g. Ring Road, Surat" value={formData.consignorAddress} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.consignorAddress ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="consignorAddress" />
              </div>
            </CardContent>
          </Card>

          {/* Consignee Details */}
          <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
              <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">2</span>
                Consignee (Receiver) Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Company / Name <span className="text-red-500">*</span></Label>
                <Input name="consigneeName" placeholder="e.g. XYZ Enterprises" value={formData.consigneeName} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.consigneeName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="consigneeName" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-600 font-medium">Phone Number <span className="text-red-500">*</span></Label>
                  <Input name="consigneePhone" placeholder="Enter 10-digit mobile number" value={formData.consigneePhone} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.consigneePhone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                  <ErrorText field="consigneePhone" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 font-medium">GST Number <span className="text-gray-400 font-normal">(Optional)</span></Label>
                  <Input name="consigneeGst" placeholder="e.g. 27XXXXX1234X1ZX" value={formData.consigneeGst} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm uppercase ${errors.consigneeGst ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                  <ErrorText field="consigneeGst" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Address / City <span className="text-red-500">*</span></Label>
                <Input name="consigneeAddress" placeholder="e.g. Andheri East, Mumbai" value={formData.consigneeAddress} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.consigneeAddress ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="consigneeAddress" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Journey & Material */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
            <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">3</span>
              Journey & Parcel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-gray-600 font-medium">Pickup Location (From) <span className="text-red-500">*</span></Label>
              <Input name="pickupLocation" placeholder="e.g. Surat, Gujarat" value={formData.pickupLocation} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.pickupLocation ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
              <ErrorText field="pickupLocation" />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-gray-600 font-medium">Delivery Location (To) <span className="text-red-500">*</span></Label>
              <Input name="deliveryLocation" placeholder="e.g. Mumbai, Maharashtra" value={formData.deliveryLocation} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.deliveryLocation ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
              <ErrorText field="deliveryLocation" />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-gray-600 font-medium">Assign Vehicle (Optional)</Label>
              <ThemeSelect 
                name="vehicle" 
                value={formData.vehicle} 
                onChange={handleChange as any} 
                options={vehicles.map(v => ({ value: v._id, label: `${v.vehicleNumber} - ${v.type}` }))} 
                placeholder="-- No Vehicle Assigned --"
                className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-gray-600 font-medium">Assign Driver (Optional)</Label>
              <ThemeSelect 
                name="driver" 
                value={formData.driver} 
                onChange={handleChange as any} 
                options={drivers.map(d => ({ value: d._id, label: `${d.name} (${d.phone})` }))} 
                placeholder="-- No Driver Assigned --"
                className="flex w-full h-12 rounded-xl bg-white border border-gray-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary shadow-sm transition-all"
              />
            </div>
            
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-gray-600 font-medium">Item Name (Description) <span className="text-red-500">*</span></Label>
              <Input name="itemName" placeholder="e.g. Hardware Items, Textiles" value={formData.itemName} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.itemName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
              <ErrorText field="itemName" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 font-medium">Packaging Type <span className="text-red-500">*</span></Label>
              <ThemeSelect 
                name="packagingType" 
                value={formData.packagingType} 
                onChange={handleChange as any} 
                options={[
                  { value: 'Box', label: 'Box / Carton' },
                  { value: 'Bag', label: 'Bag / Sack' },
                  { value: 'Bundle', label: 'Bundle' },
                  { value: 'Drum', label: 'Drum / Barrel' },
                  { value: 'Loose', label: 'Loose' }
                ]}
                className={`flex w-full h-12 rounded-xl bg-white border px-3 text-sm focus-visible:outline-none focus-visible:ring-1 transition-all shadow-sm ${errors.packagingType ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`}
              />
              <ErrorText field="packagingType" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 font-medium">Total Quantity (Pieces) <span className="text-red-500">*</span></Label>
              <Input name="quantity" type="number" placeholder="e.g. 50" value={formData.quantity} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.quantity ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
              <ErrorText field="quantity" />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-gray-600 font-medium">Actual Weight (KG) <span className="text-red-500">*</span></Label>
              <Input name="weight" type="number" placeholder="e.g. 500" value={formData.weight} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.weight ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
              <ErrorText field="weight" />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-gray-600 font-medium">Charged Weight (KG) <span className="text-red-500">*</span></Label>
              <Input name="chargedWeight" type="number" placeholder="e.g. 550" value={formData.chargedWeight} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.chargedWeight ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
              <ErrorText field="chargedWeight" />
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
            <CardTitle className="text-lg text-brand-text-primary flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-sm">4</span>
              Financials & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Freight Amount (₹) <span className="text-red-500">*</span></Label>
                <Input name="freightAmount" placeholder="e.g. 5000" type="number" value={formData.freightAmount} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.freightAmount ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="freightAmount" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Hamali / Labour (₹)</Label>
                <Input name="hamali" placeholder="e.g. 300" type="number" value={formData.hamali} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.hamali ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="hamali" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Other Surcharge (₹)</Label>
                <Input name="surCharge" placeholder="e.g. 100" type="number" value={formData.surCharge} onChange={handleChange} className={`h-12 bg-white rounded-xl focus-visible:ring-1 transition-all shadow-sm ${errors.surCharge ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:border-brand-primary focus-visible:ring-brand-primary'}`} />
                <ErrorText field="surCharge" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-medium">Payment Condition <span className="text-red-500">*</span></Label>
                <ThemeSelect 
                  name="paymentCondition" 
                  value={formData.paymentCondition} 
                  onChange={handleChange as any} 
                  options={[
                    { value: 'to_pay', label: 'To Pay' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'tbb', label: 'T.B.B. (Account)' }
                  ]}
                  className={`flex w-full h-12 rounded-xl bg-brand-primary/5 text-brand-primary font-semibold border px-3 focus-visible:outline-none focus-visible:ring-1 shadow-sm transition-all ${errors.paymentCondition ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500' : 'border-brand-primary/20 focus-visible:ring-brand-primary'}`}
                />
                <ErrorText field="paymentCondition" />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="w-full lg:w-1/3">
                <Label className="text-gray-600 font-medium mb-3 block">GST Calculation</Label>
                <div className="flex gap-4 items-center">
                  <div className="w-[180px]">
                    <ThemeSelect 
                      name="gstRate" 
                      value={formData.gstRate} 
                      onChange={handleChange as any} 
                      options={[
                        { value: '0', label: '0% (No GST)' },
                        { value: '5', label: '5% GST' },
                        { value: '12', label: '12% GST' },
                        { value: '18', label: '18% GST' }
                      ]}
                      className="flex h-12 w-full rounded-xl bg-white border border-gray-200 px-3 text-sm focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary shadow-sm transition-all"
                    />
                  </div>
                  <Input type="number" name="gstRate" value={formData.gstRate} onChange={handleChange} placeholder="Custom %" className="h-12 bg-white rounded-xl border-gray-200 focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary shadow-sm transition-all w-full" />
                </div>
              </div>
              
              <div className="text-right flex flex-col gap-2 w-full lg:w-auto bg-white p-5 rounded-xl border border-gray-100 shadow-sm min-w-[300px]">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Sub Total:</span>
                  <span className="font-semibold text-gray-800">₹ {totals.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>GST ({formData.gstRate}%):</span>
                  <span className="font-semibold text-gray-800">+ ₹ {totals.gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-brand-primary mt-3 pt-3 border-t border-gray-100">
                  <span>Grand Total:</span>
                  <span>₹ {totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={() => router.back()} className="h-14 px-8 rounded-xl border-gray-200 hover:bg-gray-50 text-base font-medium">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/20 text-base font-bold transition-all">
            {isLoading ? 'Generating LR...' : 'Generate LR (Bilty)'}
          </Button>
        </div>
      </form>
    </div>
  );
}
