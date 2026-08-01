'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { AGENT_TYPES } from '@/config/constants';

export default function NewAgentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [typeSearch, setTypeSearch] = useState('Transporter');
  const [typeSuggestions, setTypeSuggestions] = useState<string[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [typeHighlightIndex, setTypeHighlightIndex] = useState(-1);

  const { user } = useUserStore();
  const [branches, setBranches] = useState<any[]>([]);

  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [branchHighlightIndex, setBranchHighlightIndex] = useState(-1);

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()));

  useEffect(() => {
    if (user?.role === 'logistic' || user?.role === 'superadmin') {
      const fetchBranches = async () => {
        try {
          const res = await fetch('/api/admin/branches');
          if (res.ok) {
            const data = await res.json();
            setBranches(data.branches || []);
          }
        } catch (error) {
          console.error('Failed to fetch branches', error);
        }
      };
      fetchBranches();
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    openingBalance: '0',
    agentType: 'Transporter',
    gstNumber: '',
    branch: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'openingBalance') {
      value = value.replace(/[^0-9.]/g, '');
    } else if (name === 'gstNumber') {
      value = value.toUpperCase().slice(0, 15);
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = typeSuggestions[0];
      if (firstMatch && typeSearch) {
        if (firstMatch.toLowerCase().startsWith(typeSearch.toLowerCase())) {
          setFormData(prev => ({ ...prev, agentType: firstMatch }));
          setTypeSearch(firstMatch);
          setShowTypeDropdown(false);
          setTypeHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showTypeDropdown || typeSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setTypeHighlightIndex(prev =>
        prev < typeSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setTypeHighlightIndex(prev =>
        prev > 0 ? prev - 1 : typeSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (typeHighlightIndex >= 0 && typeHighlightIndex < typeSuggestions.length) {
        e.preventDefault();
        const selected = typeSuggestions[typeHighlightIndex];
        setFormData(prev => ({ ...prev, agentType: selected }));
        setTypeSearch(selected);
        setShowTypeDropdown(false);
        setTypeHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowTypeDropdown(false);
      setTypeHighlightIndex(-1);
    }
  };

  const handleTypeSearchChange = (value: string) => {
    setTypeSearch(value);
    const filtered = AGENT_TYPES.filter(t =>
      t.toLowerCase().includes(value.toLowerCase())
    );
    setTypeSuggestions(filtered);
    setShowTypeDropdown(true);
    setTypeHighlightIndex(-1);

    if (errors.agentType) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.agentType;
        return copy;
      });
    }
  };

  const handleBranchSearchChange = (value: string) => {
    setBranchSearch(value);
    setShowBranchDropdown(true);
    setBranchHighlightIndex(-1);
    if (!value) {
      setFormData(prev => ({ ...prev, branch: '' }));
    }
    if (errors.branch) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.branch;
        return copy;
      });
    }
  };

  const handleBranchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = filteredBranches[0];
      if (firstMatch && branchSearch) {
        if (firstMatch.name.toLowerCase().startsWith(branchSearch.toLowerCase())) {
          setFormData(prev => ({ ...prev, branch: firstMatch._id }));
          setBranchSearch(firstMatch.name);
          setShowBranchDropdown(false);
          setBranchHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showBranchDropdown || filteredBranches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev < filteredBranches.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBranchHighlightIndex(prev => prev > 0 ? prev - 1 : filteredBranches.length - 1);
    } else if (e.key === 'Enter') {
      if (branchHighlightIndex >= 0 && branchHighlightIndex < filteredBranches.length) {
        e.preventDefault();
        const selected = filteredBranches[branchHighlightIndex];
        setFormData(prev => ({ ...prev, branch: selected._id }));
        setBranchSearch(selected.name);
        setShowBranchDropdown(false);
        setBranchHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowBranchDropdown(false);
      setBranchHighlightIndex(-1);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Please enter Agent Name';
    if (!formData.agentType) newErrors.agentType = 'Please enter Agent Type';

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter Contact Number';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email address format';
      }
    }

    if ((user?.role === 'logistic' || user?.role === 'superadmin') && !formData.branch) {
      newErrors.branch = 'Please assign a branch';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields correctly.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        openingBalance: parseFloat(formData.openingBalance) || 0
      };

      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Agent added successfully!');
        router.push('/admin/agents');
        router.refresh();
      } else {
        throw new Error(data.error || 'Failed to create agent');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <span className="text-[10px] font-semibold text-red-500 mt-0.5 block">{errors[field]}</span>;
    }
    return null;
  };

  return (
    <div className="w-full pb-8 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Add New Agent</h1>
          <p className="text-xs text-gray-500 mt-0.5">Register a new transporter, broker, or partner</p>
        </div>
        <Button
          type="button"
          onClick={() => router.push('/admin/agents')}
          className="h-9 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-2xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Fillup Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {(user?.role === 'logistic' || user?.role === 'superadmin') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1 relative md:col-span-3">
                  <Label className="text-xs font-semibold text-gray-600 uppercase">Assign Branch <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    {branchSearch && filteredBranches.length > 0 && filteredBranches[0].name.toLowerCase().startsWith(branchSearch.toLowerCase()) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                        <span className="opacity-0">{filteredBranches[0].name.slice(0, branchSearch.length)}</span>
                        <span>{filteredBranches[0].name.slice(branchSearch.length)}</span>
                      </div>
                    )}
                    <Input
                      value={branchSearch}
                      onChange={(e) => handleBranchSearchChange(e.target.value)}
                      onFocus={() => setShowBranchDropdown(true)}
                      onBlur={() => setTimeout(() => setShowBranchDropdown(false), 250)}
                      onKeyDown={handleBranchKeyDown}
                      placeholder="Search Branch..."
                      className="h-10 text-sm rounded-lg relative z-10 bg-transparent border-gray-200"
                    />
                    {showBranchDropdown && filteredBranches.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                        {filteredBranches.map((suggestion, index) => (
                          <div
                            key={suggestion._id}
                            onMouseDown={() => {
                              setFormData(prev => ({ ...prev, branch: suggestion._id }));
                              setBranchSearch(suggestion.name);
                              setShowBranchDropdown(false);
                              setBranchHighlightIndex(-1);
                            }}
                            className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === branchHighlightIndex
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'hover:bg-gray-50 text-gray-800'
                              }`}
                          >
                            <span className="font-bold">{suggestion.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {renderError('branch')}
                </div>
              </div>
            )}

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Agent Name <span className="text-red-500">*</span></Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ex. Agent Name"
                  className={`h-10 text-sm rounded-lg ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                />
                {renderError('name')}
              </div>
              <div className="space-y-1 relative">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Agent Type <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {typeSearch && typeSuggestions.length > 0 && typeSuggestions[0].toLowerCase().startsWith(typeSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{typeSuggestions[0].slice(0, typeSearch.length)}</span>
                      <span>{typeSuggestions[0].slice(typeSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    name="agentType"
                    value={typeSearch}
                    onChange={(e) => handleTypeSearchChange(e.target.value)}
                    onFocus={() => {
                      setTypeSuggestions(typeSearch ? AGENT_TYPES.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase())) : AGENT_TYPES);
                      setShowTypeDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowTypeDropdown(false), 250)}
                    onKeyDown={handleTypeKeyDown}
                    placeholder="Search Agent Type..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.agentType ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                  />
                  {showTypeDropdown && typeSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      {typeSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, agentType: suggestion }));
                            setTypeSearch(suggestion);
                            setShowTypeDropdown(false);
                            setTypeHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === typeHighlightIndex
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'hover:bg-gray-50 text-gray-800'
                            }`}
                        >
                          <span className="font-bold">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {renderError('agentType')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Contact No <span className="text-red-500">*</span></Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9966XXXXX8"
                  className={`h-10 text-sm rounded-lg ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                />
                {renderError('phone')}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Email ID</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="mail@transbook.com"
                  className={`h-10 text-sm rounded-lg ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                />
                {renderError('email')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">GST Number</Label>
                <Input
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="ex. 24AAAAA0000A1Z5"
                  className="h-10 text-sm rounded-lg border-gray-200 uppercase"
                />
              </div>
              

              
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Opening Balance</Label>
                <Input
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                  className="h-10 text-sm rounded-lg border-gray-200"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Agent Address</Label>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address details"
                  className="flex w-full rounded-lg bg-white border border-gray-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:border-brand-primary focus-visible:ring-brand-primary transition-all shadow-sm resize-none"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push('/admin/agents')}
            disabled={isLoading}
            className="h-10 px-5 rounded-lg border-gray-200 hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 px-5 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold transition-all shadow-md"
          >
            {isLoading ? 'Creating...' : 'Save Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
}
