'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User, Lock, Save, ArrowLeft, Building2, CheckCircle2, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    companyLogo: '',
    gstNumber: '',
    transporterId: '',
    panNumber: '',
    ewbApiAccess: false,
    branchName: '',
    branchCode: ''
  });

  useEffect(() => {
    fetch('/api/admin/profile')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            password: '', // Password not fetched
            confirmPassword: '',
            phone: data.user.phone || '',
            role: data.user.role || '',
            companyLogo: data.user.companyLogo || '',
            gstNumber: data.user.gstNumber || '',
            transporterId: data.user.transporterId || '',
            panNumber: data.user.panNumber || '',
            ewbApiAccess: !!data.user.ewbApiAccess,
            branchName: data.user.branch?.name || '',
            branchCode: data.user.branch?.code || ''
          });
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile details');
      })
      .finally(() => setIsFetching(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Please enter Full Name";
    if (!formData.email.trim()) newErrors.email = "Please enter Email (Login ID)";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Please enter valid 10 digit Phone Number";
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

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Profile updated successfully!');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // clear password after save
        // We do not router.push because they should stay on the profile page
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
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
            <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-brand-primary" /> My Profile
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {(formData.role === 'logistic' || formData.role === 'branch_user' || formData.role === 'branch') && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${formData.ewbApiAccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} w-full shadow-sm`}>
            {formData.ewbApiAccess ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-500" />}
            <div>
              <h4 className="font-bold text-sm">E-Way Bill API Access: {formData.ewbApiAccess ? 'ENABLED' : 'DISABLED'}</h4>
              <p className="text-xs opacity-80 mt-0.5">
                {formData.ewbApiAccess 
                  ? 'You have active permission to generate and manage E-Way bills directly from the system.' 
                  : 'You do not have permission to use the E-Way Bill API. Contact Super Admin to enable this feature.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card className="border-none shadow-md bg-white overflow-hidden rounded-2xl h-full">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {(formData.role === 'branch_user' || formData.role === 'branch') && (
                <>
                  <div className="space-y-1.5 md:col-span-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Branch Name</Label>
                    <Input 
                      name="branchName" 
                      value={formData.branchName} 
                      disabled
                      className="h-10 text-sm rounded-lg bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed font-medium" 
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <Label className="text-xs font-semibold text-gray-600 uppercase">Branch Code</Label>
                    <Input 
                      name="branchCode" 
                      value={formData.branchCode} 
                      disabled
                      className="h-10 text-sm rounded-lg bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed font-medium uppercase tracking-wider" 
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter Full Name"
                  className={`h-10 text-sm rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-200'}`} 
                />
                {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Email (Login ID) <span className="text-red-500">*</span></Label>
                <Input 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Enter Email (Login ID)"
                  className={`h-10 text-sm rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200'}`} 
                />
                {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Phone Number</Label>
                <Input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Enter Phone Number"
                  className={`h-10 text-sm rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} 
                />
                {errors.phone && <p className="text-red-500 text-xs font-medium">{errors.phone}</p>}
              </div>

            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white overflow-hidden rounded-2xl h-full">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">New Password</Label>
                <Input 
                  name="password" 
                  type="password"
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Enter New Password (Leave blank to keep current)"
                  className={`h-10 text-sm rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-200'}`} 
                />
                {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Confirm Password</Label>
                <Input 
                  name="confirmPassword" 
                  type="password"
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="Re-enter New Password"
                  className={`h-10 text-sm rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`} 
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs font-medium">{errors.confirmPassword}</p>}
              </div>
              
              <div className="md:col-span-2">
                <p className="text-[10px] text-gray-400">If you don't want to change your password, leave these fields blank.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {formData.role === 'logistic' && (
          <Card className="border-none shadow-md bg-white overflow-hidden rounded-2xl w-full mb-6">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" />
                Statutory & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Transporter ID (TRANSIN)</Label>
                  <Input 
                    name="transporterId" 
                    value={formData.transporterId} 
                    onChange={handleChange} 
                    placeholder="Enter Transporter ID"
                    className="h-10 text-sm rounded-lg border-gray-200" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">GST Number</Label>
                  <Input 
                    name="gstNumber" 
                    value={formData.gstNumber} 
                    onChange={handleChange} 
                    placeholder="Enter GST Number"
                    className="h-10 text-sm rounded-lg border-gray-200" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">PAN Number</Label>
                  <Input 
                    name="panNumber" 
                    value={formData.panNumber} 
                    onChange={handleChange} 
                    placeholder="Enter PAN Number"
                    className="h-10 text-sm rounded-lg border-gray-200" 
                  />
                </div>
                <div className="space-y-1.5 md:col-span-3">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Company Logo (Image URL)</Label>
                  <Input 
                    name="companyLogo" 
                    value={formData.companyLogo} 
                    onChange={handleChange} 
                    placeholder="Enter Company Logo URL"
                    className="h-10 text-sm rounded-lg border-gray-200" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2.5 pt-4">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => router.back()} 
            className="h-10 px-5 rounded-lg border-gray-200 hover:bg-gray-50 text-sm font-medium"
          >
            Go Back
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
