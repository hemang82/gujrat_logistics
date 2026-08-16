'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [branches, setBranches] = useState<any[]>([]);
  const [branchSearch, setBranchSearch] = useState('');
  const [branchSuggestions, setBranchSuggestions] = useState<any[]>([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchHighlightIndex, setBranchHighlightIndex] = useState(-1);

  const [newBranchData, setNewBranchData] = useState({
    pincode: '',
    state: '',
    city: ''
  });
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [postOfficeOptions, setPostOfficeOptions] = useState<any[]>([]);
  const [showPostOfficeDropdown, setShowPostOfficeDropdown] = useState(false);



  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'branch',
    branchId: '',
    permissions: {
      bookings: {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: false
      },
      challans: {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: false
      }
    }
  });

  // Pincode Auto-fetch effect for Inline Branch Creation
  useEffect(() => {
    if (!formData.branchId && newBranchData.pincode && newBranchData.pincode.length === 6) {
      setIsFetchingPincode(true);
      fetch(`https://api.postalpincode.in/pincode/${newBranchData.pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success') {
            const offices = data[0].PostOffice;
            setPostOfficeOptions(offices);
            setShowPostOfficeDropdown(true);
            if (offices.length === 1) {
              setNewBranchData(prev => ({
                ...prev,
                city: offices[0].District,
                state: offices[0].State
              }));
              setShowPostOfficeDropdown(false);
              toast.success(`Fetched: ${offices[0].District}, ${offices[0].State}`);
            } else {
              toast.success(`Found ${offices.length} locations. Please select one.`);
            }
          } else {
            toast.error('Invalid Pincode or no data found.');
          }
        })
        .catch(err => {
          console.error('Error fetching pincode data:', err);
          toast.error('Failed to fetch Pincode data.');
        })
        .finally(() => {
          setIsFetchingPincode(false);
        });
    }
  }, [newBranchData.pincode, formData.branchId]);

  useEffect(() => {
    // Fetch branches and user data
    Promise.all([
      fetch('/api/admin/branches?limit=100').then(res => res.json()),
      fetch(`/api/admin/users/${resolvedParams.id}`).then(res => res.json())
    ])
    .then(([branchesData, userData]) => {
      if (branchesData.branches) {
        setBranches(branchesData.branches);
      }
      
      if (userData && !userData.error) {
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            password: userData.plainPassword || '', // Populate plain password
            phone: userData.phone || '',
            role: userData.role || 'branch',
            branchId: userData.branch || '',
            permissions: {
              bookings: { canView: true, canAdd: true, canEdit: true, canDelete: false },
              challans: { canView: true, canAdd: true, canEdit: true, canDelete: false },
              ...(userData.permissions || {})
            }
          });
          
          if (userData.branch && branchesData.branches) {
            const currentBranch = branchesData.branches.find((b: any) => b._id === userData.branch);
            if (currentBranch) {
              setBranchSearch(`${currentBranch.name} (${currentBranch.code})`);
              setNewBranchData({
                pincode: currentBranch.pincode || '',
                state: currentBranch.state || '',
                city: currentBranch.city || ''
              });
            }
          }
      } else {
        toast.error(userData.error || 'Branch login not found');
        router.push('/admin/users');
      }
    })
    .catch(err => {
      console.error('Error fetching data:', err);
      toast.error('Failed to load branch login data');
    })
    .finally(() => setIsFetching(false));
  }, [resolvedParams.id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleBranchSearchChange = (value: string) => {
    setBranchSearch(value);
    if (!value) {
      setFormData(prev => ({ ...prev, branchId: '' }));
      setNewBranchData({ pincode: '', state: '', city: '' });
      setBranchSuggestions(branches);
    } else {
      setFormData(prev => ({ ...prev, branchId: '' }));
      const filtered = branches.filter(b => 
        b.name.toLowerCase().includes(value.toLowerCase()) || 
        b.code.toLowerCase().includes(value.toLowerCase())
      );
      setBranchSuggestions(filtered);
    }
    setShowBranchDropdown(true);
    setBranchHighlightIndex(-1);
  };
  
  const handleBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = branchSuggestions[0];
      if (firstMatch && branchSearch) {
        if (firstMatch.name.toLowerCase().startsWith(branchSearch.toLowerCase())) {
          e.preventDefault();
          setFormData(prev => ({ ...prev, branchId: firstMatch._id }));
          setBranchSearch(`${firstMatch.name} (${firstMatch.code})`);
          setNewBranchData({
            pincode: firstMatch.pincode || '',
            state: firstMatch.state || '',
            city: firstMatch.city || ''
          });
          setShowBranchDropdown(false);
          setBranchHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showBranchDropdown || branchSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev < branchSuggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev > 0 ? prev - 1 : branchSuggestions.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (branchHighlightIndex >= 0 && branchHighlightIndex < branchSuggestions.length) {
        const selected = branchSuggestions[branchHighlightIndex];
        setFormData(prev => ({ ...prev, branchId: selected._id }));
        setBranchSearch(`${selected.name} (${selected.code})`);
        setNewBranchData({
          pincode: selected.pincode || '',
          state: selected.state || '',
          city: selected.city || ''
        });
        setShowBranchDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowBranchDropdown(false);
    }
  };

  const togglePermission = (module: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...(prev.permissions as any)[module],
          [action]: !(prev.permissions as any)[module]?.[action]
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Please enter Full Name";
    if (!formData.email.trim()) newErrors.email = "Please enter Email (Login ID)";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Please enter valid 10 digit Phone Number";
    }

    if (!formData.branchId && !branchSearch.trim()) {
      newErrors.branchId = "Please enter Assigned Branch";
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
      let finalBranchId = formData.branchId;
      
      // If creating a new branch inline
      if (!finalBranchId && branchSearch.trim()) {
        const generatedCode = branchSearch.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
        if (!newBranchData.state) {
          toast.error("Please fill State to create a new branch.");
          setIsLoading(false);
          return;
        }

        const branchRes = await fetch('/api/admin/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: branchSearch.trim(),
            code: generatedCode,
            state: newBranchData.state,
            city: newBranchData.city,
            pincode: newBranchData.pincode
          })
        });
        
        if (branchRes.ok) {
          const newBranch = await branchRes.json();
          finalBranchId = newBranch._id;
        } else {
          const errorData = await branchRes.json();
          toast.error(`Failed to create new branch: ${errorData.error}`);
          setIsLoading(false);
          return;
        }
      }

      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        branch: finalBranchId || null,
        permissions: formData.permissions
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Branch login updated successfully!');
        router.push('/admin/users');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update branch login: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating branch login.');
    } finally {
      setIsLoading(false);
    }
  };

  let derivedBranchCode = '';
  if (formData.branchId) {
    const match = branchSearch.match(/\(([^)]+)\)$/);
    if (match) derivedBranchCode = match[1];
  } else if (branchSearch.trim()) {
    derivedBranchCode = branchSearch.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  }

  if (isFetching) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading branch login details...</div>;
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
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Edit Branch Login</h1>
            <p className="text-xs text-gray-500 mt-0.5">Update branch access account details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-3 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Login Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 relative">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Assigned Branch <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {branchSearch && branchSuggestions.length > 0 && branchSuggestions[0].name.toLowerCase().startsWith(branchSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{branchSuggestions[0].name.slice(0, branchSearch.length)}</span>
                      <span>{branchSuggestions[0].name.slice(branchSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    name="branch"
                    value={branchSearch}
                    onChange={(e) => handleBranchSearchChange(e.target.value)}
                    onFocus={() => {
                      setBranchSuggestions(branchSearch ? branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase())) : branches);
                      setShowBranchDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowBranchDropdown(false), 250)}
                    onKeyDown={handleBranchKeyDown}
                    placeholder="Enter Assigned Branch..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.branchId ? 'border-red-500' : 'border-gray-200'}`}
                  />
                </div>
                {errors.branchId && !formData.branchId && <p className="text-xs text-red-500">{errors.branchId}</p>}
                
                {showBranchDropdown && branchSuggestions.length > 0 && !formData.branchId && (
                  <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                    {branchSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion._id}
                        onMouseDown={() => {
                          setFormData(prev => ({ ...prev, branchId: suggestion._id }));
                          setBranchSearch(`${suggestion.name} (${suggestion.code})`);
                          setNewBranchData({
                            pincode: suggestion.pincode || '',
                            state: suggestion.state || '',
                            city: suggestion.city || ''
                          });
                          setShowBranchDropdown(false);
                          setBranchHighlightIndex(-1);
                        }}
                        className={`flex flex-col px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${index === branchHighlightIndex
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'hover:bg-gray-50 text-gray-800'
                          }`}
                      >
                        <span className="font-bold">{suggestion.name} ({suggestion.code})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Branch Code</Label>
                <Input 
                  value={derivedBranchCode} 
                  disabled
                  placeholder="Auto-generated"
                  className="h-10 text-sm rounded-lg border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed font-medium text-gray-700" 
                />
              </div>

            </div>

            {/* Seamless Branch Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Pincode</Label>
                <div className="relative">
                  <Input 
                    value={newBranchData.pincode}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setNewBranchData(prev => ({ ...prev, pincode: val }));
                    }}
                    disabled={!!formData.branchId}
                    placeholder="e.g. 395002"
                    className={`h-10 text-sm rounded-lg border-gray-200 ${!!formData.branchId ? 'bg-gray-50 opacity-70 cursor-not-allowed text-gray-700' : ''}`}
                  />
                  {isFetchingPincode && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>}
                  {showPostOfficeDropdown && postOfficeOptions.length > 0 && !formData.branchId && (
                    <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Select Location</div>
                      {postOfficeOptions.map((po, index) => (
                        <div
                          key={index}
                          onMouseDown={() => {
                            setNewBranchData(prev => ({
                              ...prev,
                              city: po.District,
                              state: po.State
                            }));
                            setShowPostOfficeDropdown(false);
                          }}
                          className="flex flex-col px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors hover:bg-gray-50 text-gray-800"
                        >
                          <span className="font-bold">{po.Name}</span>
                          <span className="text-[10px] text-gray-500">{po.District}, {po.State}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">State {!formData.branchId && <span className="text-red-500">*</span>}</Label>
                <Input 
                  value={newBranchData.state}
                  onChange={e => setNewBranchData(prev => ({ ...prev, state: e.target.value }))}
                  disabled={!!formData.branchId}
                  placeholder="e.g. GUJARAT"
                  className={`h-10 text-sm rounded-lg border-gray-200 ${!!formData.branchId ? 'bg-gray-50 opacity-70 cursor-not-allowed text-gray-700' : ''}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">City</Label>
                <Input 
                  value={newBranchData.city}
                  onChange={e => setNewBranchData(prev => ({ ...prev, city: e.target.value }))}
                  disabled={!!formData.branchId}
                  placeholder="e.g. Surat"
                  className={`h-10 text-sm rounded-lg border-gray-200 ${!!formData.branchId ? 'bg-gray-50 opacity-70 cursor-not-allowed text-gray-700' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Role <span className="text-red-500">*</span></Label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  disabled
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary opacity-70 cursor-not-allowed"
                >
                  <option value="branch">Branch User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin (Staff)</option>
                </select>
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

        {/* Section: Module Permissions */}
        <Card className="border border-gray-100 shadow-sm rounded-xl mt-6 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-3 px-4">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Module Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase border-b border-gray-100">
                    <th className="font-semibold p-4">Module Name</th>
                    <th className="font-semibold p-4 text-center">View</th>
                    <th className="font-semibold p-4 text-center">Add</th>
                    <th className="font-semibold p-4 text-center">Edit</th>
                    <th className="font-semibold p-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-sm">Bookings & LR</div>
                      <div className="text-xs text-gray-500 mt-0.5">Manage Lorry Receipts</div>
                    </td>
                    {['canView', 'canAdd', 'canEdit', 'canDelete'].map(action => (
                      <td key={action} className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission('bookings', action)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(formData.permissions.bookings as any)[action] ? (action === 'canDelete' ? 'bg-red-500' : 'bg-brand-primary') : 'bg-gray-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${(formData.permissions.bookings as any)[action] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800 text-sm">Challans & Lorry Hire</div>
                      <div className="text-xs text-gray-500 mt-0.5">Manage Truck Memos & Lorry Hire Vouchers</div>
                    </td>
                    {['canView', 'canAdd', 'canEdit', 'canDelete'].map(action => (
                      <td key={action} className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission('challans', action)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.permissions.challans && (formData.permissions.challans as any)[action] ? (action === 'canDelete' ? 'bg-red-500' : 'bg-brand-primary') : 'bg-gray-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.permissions.challans && (formData.permissions.challans as any)[action] ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2.5 pt-4">
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
            {isLoading ? 'Saving...' : 'Update Login'}
          </Button>
        </div>
      </form>
    </div>
  );
}
