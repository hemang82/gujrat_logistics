'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

function LogisticsFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!editingId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [randomSuffix] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gstNumber: '',
    transporterId: '',
    panNumber: '',
    companyLogo: '',
    ewbApiAccess: false,
    ewbApiQuota: 0
  });

  useEffect(() => {
    if (editingId) {
      fetchLogisticDetails();
    }
  }, [editingId]);

  const fetchLogisticDetails = async () => {
    try {
      const res = await fetch(`/api/admin/logistics/${editingId}`);
      const data = await res.json();
      if (res.ok && data.data) {
        const logistic = data.data;
        if (logistic) {
          setFormData({
            name: logistic.name || '',
            email: logistic.email || '',
            password: logistic.plainPassword || '', 
            phone: logistic.phone || '',
            gstNumber: logistic.gstNumber || '',
            transporterId: logistic.transporterId || '',
            panNumber: logistic.panNumber || '',
            companyLogo: logistic.companyLogo || '',
            ewbApiAccess: logistic.ewbApiAccess || false,
            ewbApiQuota: logistic.ewbApiQuota || 0
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load details');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, type, checked, value } = e.target;
    
    let finalValue: any = type === 'checkbox' ? checked : value;
    
    if (name === 'phone') {
      finalValue = finalValue.replace(/\D/g, '').slice(0, 10);
    }
    if (name === 'gstNumber' || name === 'transporterId' || name === 'panNumber') {
      finalValue = finalValue.toUpperCase();
    }
    setFormData(prev => {
      const newData = { ...prev, [name]: finalValue };
      
      // Auto-generate password based on name (only for new records)
      if (name === 'name' && !editingId) {
        if (finalValue.trim()) {
          const firstWord = finalValue.trim().split(' ')[0];
          const capitalized = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
          newData.password = `${capitalized}@${randomSuffix}`;
        } else {
          newData.password = '';
        }
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Please enter Company Name";
    
    // Email Validation
    if (!formData.email.trim()) {
      newErrors.email = "Please enter Login Email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!editingId && !formData.password.trim()) newErrors.password = "Please enter Password";
    if (formData.password && formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    // Phone Validation (Required)
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = "Please enter Phone Number";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Statutory Validations (if provided)
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = "Invalid PAN Format (e.g. ABCDE1234F)";
    }
    
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = "Invalid GSTIN Format";
    }

    if (formData.transporterId && formData.transporterId.length !== 15) {
      newErrors.transporterId = "Transporter ID must be exactly 15 characters";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Open a blank window immediately before async fetch to bypass browser popup blockers
    let waWindow: Window | null = null;
    try {
      waWindow = window.open('', '_blank');
    } catch (e) {
      console.warn("Popup blocked or failed to open blank tab:", e);
    }

    try {
      const url = editingId ? `/api/admin/logistics/${editingId}` : '/api/admin/logistics';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`Logistic Company ${editingId ? 'updated' : 'created'} successfully!`);
        
        // Prepare WhatsApp message
        const passText = formData.password ? formData.password : '•••••••• (Unchanged)';
        const transporterIdText = formData.transporterId || 'N/A';
        const gstNumberText = formData.gstNumber || 'N/A';
        const actionText = editingId ? 'UPDATED' : 'REGISTERED';

        const waMessage = 
`*TRUST LOGISTICS - ACCOUNT ${actionText}*

Dear Partner,

Your logistics company account has been successfully ${editingId ? 'updated' : 'registered'} on the Trust Logistics platform.

*Account Details:*
• *Company Name:* ${formData.name}
• *Login Email:* ${formData.email}
• *Password:* ${passText}
• *Phone Number:* ${formData.phone}

*Statutory Details:*
• *Transporter ID:* ${transporterIdText}
• *GST Number:* ${gstNumberText}

*Login Link:* https://trustlogistic.in/admin/login

Thank you,
*Trust Logistics Team*`;

        // Redirect the blank tab to WhatsApp URL
        const cleanPhone = formData.phone.replace(/\D/g, '');
        const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
        
        if (waWindow) {
          waWindow.location.href = waUrl;
        } else {
          // Fallback if blank window couldn't be opened initially
          window.open(waUrl, '_blank');
        }

        router.push('/admin/logistics');
        router.refresh();
      } else {
        if (waWindow) waWindow.close();
        const errorData = await response.json();
        toast.error(`Failed to save: ${errorData.error}`);
      }
    } catch (error) {
      if (waWindow) waWindow.close();
      toast.error('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-xs mt-1 font-semibold">{errors[field]}</p>;
    }
    return null;
  };

  if (isFetching) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
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
              {editingId ? 'Edit Logistic Company' : 'Add New Logistic Company'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {editingId ? 'Update the details for this transport company' : 'Register a new owner account'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        {/* Section 1: Login Information */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Login & Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Company Name <span className="text-red-500">*</span></Label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter Company Name" className={`h-10 text-sm rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('name')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Login Email <span className="text-red-500">*</span></Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter Login Email" className={`h-10 text-sm rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('email')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">
                  {editingId ? 'New Password (Optional)' : 'Password (Auto-Generated) *'}
                </Label>
                <Input name="password" type="text" value={formData.password} onChange={handleChange} placeholder="Enter Password" className={`h-10 text-sm rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('password')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Phone Number <span className="text-red-500">*</span></Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter Phone Number" className={`h-10 text-sm rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('phone')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Statutory Information */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Statutory & Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Transporter ID (TRANSIN)</Label>
                <Input name="transporterId" value={formData.transporterId} onChange={handleChange} placeholder="Enter Transporter ID" maxLength={15} className={`h-10 text-sm rounded-lg uppercase ${errors.transporterId ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('transporterId')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">GST Number</Label>
                <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="Enter GST Number" maxLength={15} className={`h-10 text-sm rounded-lg uppercase ${errors.gstNumber ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('gstNumber')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">PAN Number</Label>
                <Input name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="Enter PAN Number" maxLength={10} className={`h-10 text-sm rounded-lg uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('panNumber')}
              </div>
              <div className="space-y-1 md:col-span-3">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Company Logo (Image URL)</Label>
                <div className="flex gap-3 items-center">
                  <Input name="companyLogo" value={formData.companyLogo} onChange={handleChange} placeholder="Enter Company Logo URL" className="h-10 text-sm rounded-lg border-gray-200 flex-1" />
                  {formData.companyLogo && (
                    <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0 bg-white shadow-sm">
                      <img src={formData.companyLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: API Permissions */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              API Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 flex flex-col justify-center">
                <Label className="text-xs font-semibold text-gray-600 uppercase mb-2">E-Way Bill API Access</Label>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="ewbApiAccess" 
                      checked={formData.ewbApiAccess} 
                      onChange={handleChange} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.ewbApiAccess ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">API Quota (Requests per month)</Label>
                <Input 
                  name="ewbApiQuota" 
                  type="number" 
                  value={formData.ewbApiQuota} 
                  onChange={handleChange} 
                  placeholder="e.g. 1000" 
                  disabled={!formData.ewbApiAccess}
                  className={`h-10 text-sm rounded-lg ${errors.ewbApiQuota ? 'border-red-500' : 'border-gray-200'} ${!formData.ewbApiAccess ? 'bg-gray-50 text-gray-400' : ''}`} 
                />
                {renderError('ewbApiQuota')}
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
            disabled={isLoading} 
            className="h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold transition-all shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? 'Saving...' : (editingId ? 'Update Company' : 'Create Company')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewLogisticsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>}>
      <LogisticsFormContent />
    </Suspense>
  );
}
