'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { ThemeSelect } from '@/components/ui/theme-select';

const ALL_STATES = [
  'Gujarat'
];

const BOOKING_INWARD_OPTIONS = [
  { value: 'B', label: 'Booking' },
  { value: 'I', label: 'Inward' },
  { value: 'B/I', label: 'B/I (Both)' }
];

const DIRECT_DATA_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' }
];

export default function NewBranchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [stateHighlightIndex, setStateHighlightIndex] = useState(-1);

  const [bookingInwardSearch, setBookingInwardSearch] = useState('B/I (Both)');
  const [bookingInwardSuggestions, setBookingInwardSuggestions] = useState<typeof BOOKING_INWARD_OPTIONS>([]);
  const [showBookingInwardDropdown, setShowBookingInwardDropdown] = useState(false);
  const [bookingInwardHighlightIndex, setBookingInwardHighlightIndex] = useState(-1);

  const [directDataSearch, setDirectDataSearch] = useState('No');
  const [directDataSuggestions, setDirectDataSuggestions] = useState<typeof DIRECT_DATA_OPTIONS>([]);
  const [showDirectDataDropdown, setShowDirectDataDropdown] = useState(false);
  const [directDataHighlightIndex, setDirectDataHighlightIndex] = useState(-1);

  // Agent autocomplete states
  const [agentsList, setAgentsList] = useState<{ value: string; label: string }[]>([]);
  const [agentSearch, setAgentSearch] = useState('');
  const [agentSuggestions, setAgentSuggestions] = useState<{ value: string; label: string }[]>([]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [agentHighlightIndex, setAgentHighlightIndex] = useState(-1);

  useEffect(() => {
    fetch('/api/admin/agents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.map((a: any) => ({
            value: a._id,
            label: a.name
          }));
          setAgentsList(list);
        }
      })
      .catch(err => console.error('Error fetching agents:', err));
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    state: 'Gujarat',
    pincode: '',
    distance: '0',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    agent: '',
    bookingInward: 'B/I', // 'B' | 'I' | 'B/I'
    commiBasis: '',
    commiAmount: '0.00',
    dcBasis: '',
    dcAmount: '0.00',
    lcBasis: '',
    lcAmount: '0.00',
    brnRateBasis: '',
    brnAmount: '0.00',
    directData: 'No'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Mask validation
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    } else if (['distance', 'commiAmount', 'dcAmount', 'lcAmount', 'brnAmount'].includes(name)) {
      value = value.replace(/[^0-9.]/g, '');
      if ((value.match(/\./g) || []).length > 1) {
        value = value.slice(0, -1);
      }
    }

    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value }));
      if (value.trim()) {
        const filtered = ALL_STATES.filter(s =>
          s.toLowerCase().includes(value.toLowerCase())
        );
        setStateSuggestions(filtered);
        setShowStateDropdown(true);
        setStateHighlightIndex(-1);
      } else {
        setStateSuggestions(ALL_STATES);
        setShowStateDropdown(true);
        setStateHighlightIndex(-1);
      }

      if (errors.state) {
        const newErrors = { ...errors };
        delete newErrors.state;
        setErrors(newErrors);
      }
    } else if (name === 'name') {
      const generatedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        name: value,
        code: generatedCode
      }));
      
      // Clear errors for both name and code if name is updated
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.name;
        delete copy.code;
        return copy;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (errors[name]) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const handleStateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = stateSuggestions[0];
      if (firstMatch && formData.state) {
        const hasMatch = firstMatch.toLowerCase().startsWith(formData.state.toLowerCase());
        if (hasMatch) {
          setFormData(prev => ({ ...prev, state: firstMatch }));
          setShowStateDropdown(false);
          setStateHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showStateDropdown || stateSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setStateHighlightIndex(prev =>
        prev < stateSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setStateHighlightIndex(prev =>
        prev > 0 ? prev - 1 : stateSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (stateHighlightIndex >= 0 && stateHighlightIndex < stateSuggestions.length) {
        e.preventDefault();
        const selected = stateSuggestions[stateHighlightIndex];
        setFormData(prev => ({ ...prev, state: selected }));
        setShowStateDropdown(false);
        setStateHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowStateDropdown(false);
      setStateHighlightIndex(-1);
    }
  };

  const handleBookingInwardKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = bookingInwardSuggestions[0];
      if (firstMatch && bookingInwardSearch) {
        if (firstMatch.label.toLowerCase().startsWith(bookingInwardSearch.toLowerCase())) {
          setFormData(prev => ({ ...prev, bookingInward: firstMatch.value }));
          setBookingInwardSearch(firstMatch.label);
          setShowBookingInwardDropdown(false);
          setBookingInwardHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showBookingInwardDropdown || bookingInwardSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBookingInwardHighlightIndex(prev =>
        prev < bookingInwardSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBookingInwardHighlightIndex(prev =>
        prev > 0 ? prev - 1 : bookingInwardSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (bookingInwardHighlightIndex >= 0 && bookingInwardHighlightIndex < bookingInwardSuggestions.length) {
        e.preventDefault();
        const selected = bookingInwardSuggestions[bookingInwardHighlightIndex];
        setFormData(prev => ({ ...prev, bookingInward: selected.value }));
        setBookingInwardSearch(selected.label);
        setShowBookingInwardDropdown(false);
        setBookingInwardHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowBookingInwardDropdown(false);
      setBookingInwardHighlightIndex(-1);
    }
  };

  const handleBookingInwardSearchChange = (value: string) => {
    setBookingInwardSearch(value);
    const filtered = BOOKING_INWARD_OPTIONS.filter(o =>
      o.label.toLowerCase().includes(value.toLowerCase())
    );
    setBookingInwardSuggestions(filtered);
    setShowBookingInwardDropdown(true);
    setBookingInwardHighlightIndex(-1);

    // Clear errors if any
    if (errors.bookingInward) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.bookingInward;
        return copy;
      });
    }
  };

  const handleDirectDataKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = directDataSuggestions[0];
      if (firstMatch && directDataSearch) {
        if (firstMatch.label.toLowerCase().startsWith(directDataSearch.toLowerCase())) {
          setFormData(prev => ({ ...prev, directData: firstMatch.value }));
          setDirectDataSearch(firstMatch.label);
          setShowDirectDataDropdown(false);
          setDirectDataHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showDirectDataDropdown || directDataSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDirectDataHighlightIndex(prev =>
        prev < directDataSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDirectDataHighlightIndex(prev =>
        prev > 0 ? prev - 1 : directDataSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (directDataHighlightIndex >= 0 && directDataHighlightIndex < directDataSuggestions.length) {
        e.preventDefault();
        const selected = directDataSuggestions[directDataHighlightIndex];
        setFormData(prev => ({ ...prev, directData: selected.value }));
        setDirectDataSearch(selected.label);
        setShowDirectDataDropdown(false);
        setDirectDataHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowDirectDataDropdown(false);
      setDirectDataHighlightIndex(-1);
    }
  };

  const handleDirectDataSearchChange = (value: string) => {
    setDirectDataSearch(value);
    const filtered = DIRECT_DATA_OPTIONS.filter(o =>
      o.label.toLowerCase().includes(value.toLowerCase())
    );
    setDirectDataSuggestions(filtered);
    setShowDirectDataDropdown(true);
    setDirectDataHighlightIndex(-1);

    // Clear errors if any
    if (errors.directData) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.directData;
        return copy;
      });
    }
  };

  const handleAgentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      const firstMatch = agentSuggestions[0];
      if (firstMatch && agentSearch) {
        if (firstMatch.label.toLowerCase().startsWith(agentSearch.toLowerCase())) {
          setFormData(prev => ({ ...prev, agent: firstMatch.value }));
          setAgentSearch(firstMatch.label);
          setShowAgentDropdown(false);
          setAgentHighlightIndex(-1);
          return;
        }
      }
    }

    if (!showAgentDropdown || agentSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAgentHighlightIndex(prev =>
        prev < agentSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAgentHighlightIndex(prev =>
        prev > 0 ? prev - 1 : agentSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (agentHighlightIndex >= 0 && agentHighlightIndex < agentSuggestions.length) {
        e.preventDefault();
        const selected = agentSuggestions[agentHighlightIndex];
        setFormData(prev => ({ ...prev, agent: selected.value }));
        setAgentSearch(selected.label);
        setShowAgentDropdown(false);
        setAgentHighlightIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setShowAgentDropdown(false);
      setAgentHighlightIndex(-1);
    }
  };

  const handleAgentSearchChange = (value: string) => {
    setAgentSearch(value);
    const filtered = agentsList.filter(a =>
      a.label.toLowerCase().includes(value.toLowerCase())
    );
    setAgentSuggestions(filtered);
    setShowAgentDropdown(true);
    setAgentHighlightIndex(-1);

    if (value === '') {
      setFormData(prev => ({ ...prev, agent: '' }));
    }

    // Clear errors if any
    if (errors.agent) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.agent;
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Branch Name is required";
    if (!formData.code.trim()) newErrors.code = "Branch Code is required";
    if (!formData.state) newErrors.state = "Please select a State";
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Contact Number is required";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (formData.pincode && formData.pincode.length !== 6) {
      newErrors.pincode = "PinCode must be exactly 6 digits";
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email address format";
      }
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

    const payload = {
      ...formData,
      distance: parseFloat(formData.distance) || 0,
      commiAmount: parseFloat(formData.commiAmount) || 0,
      dcAmount: parseFloat(formData.dcAmount) || 0,
      lcAmount: parseFloat(formData.lcAmount) || 0,
      brnAmount: parseFloat(formData.brnAmount) || 0,
    };

    try {
      const response = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Branch Added successfully!');
        router.push('/admin/branches');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add branch: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('An error occurred while creating branch.');
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

  return (
    <div className="w-full pb-8">
      <div className="mb-4 flex justify-between items-center bg-white p-3.5 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Add New Branch</h1>
          <p className="text-xs text-gray-500 mt-0.5">Register a new corporate office or delivery hub</p>
        </div>
        <Button 
          type="button" 
          onClick={() => router.back()} 
          className="h-9 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        {/* Section 1: Fillup Information */}
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-visible">
          <CardHeader className="bg-gray-50 border-b border-gray-100 py-2.5 px-4 rounded-t-xl">
            <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Fillup Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Branch Name <span className="text-red-500">*</span></Label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="ex. Ahmedabad" className={`h-10 text-sm rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('name')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Branch Code <span className="text-red-500">*</span></Label>
                <Input 
                  name="code" 
                  value={formData.code} 
                  readOnly 
                  disabled 
                  placeholder="Auto-generated" 
                  className="h-10 text-sm rounded-lg uppercase bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200" 
                />
                {renderError('code')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Contact No <span className="text-red-500">*</span></Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="9966XXXXX8" className={`h-10 text-sm rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('phone')}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1 relative">
                <Label className="text-xs font-semibold text-gray-600 uppercase">State <span className="text-red-500">*</span></Label>
                <div className="relative">
                  {/* Backdrop autocomplete suggestion */}
                  {formData.state && stateSuggestions.length > 0 && stateSuggestions[0].toLowerCase().startsWith(formData.state.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{stateSuggestions[0].slice(0, formData.state.length)}</span>
                      <span>{stateSuggestions[0].slice(formData.state.length)}</span>
                    </div>
                  )}
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    onFocus={() => {
                      setStateSuggestions(formData.state ? ALL_STATES.filter(s => s.toLowerCase().includes(formData.state.toLowerCase())) : ALL_STATES);
                      setShowStateDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowStateDropdown(false), 250)}
                    onKeyDown={handleStateKeyDown}
                    placeholder="Search State..."
                    className={`h-10 text-sm rounded-lg relative z-10 bg-transparent ${errors.state ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                  />
                  {showStateDropdown && stateSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      {stateSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, state: suggestion }));
                            setShowStateDropdown(false);
                            setStateHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === stateHighlightIndex
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
                {renderError('state')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">PinCode</Label>
                <Input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="ex. 380015" className="h-10 text-sm rounded-lg border-gray-200" />
                {renderError('pincode')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Distance (KM)</Label>
                <Input name="distance" value={formData.distance} onChange={handleChange} placeholder="ex. 15000" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">GST Number</Label>
                <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="Service Tax Number" className="h-10 text-sm rounded-lg border-gray-200 uppercase" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Email</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@transbook.com" className={`h-10 text-sm rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200'}`} />
                {renderError('email')}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Address</Label>
                <Input name="address" value={formData.address} onChange={handleChange} placeholder="Address details" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="space-y-1 relative">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Agent</Label>
                <div className="relative">
                  {agentSearch && agentSuggestions.length > 0 && agentSuggestions[0].label.toLowerCase().startsWith(agentSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{agentSuggestions[0].label.slice(0, agentSearch.length)}</span>
                      <span>{agentSuggestions[0].label.slice(agentSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    name="agent"
                    value={agentSearch}
                    onChange={(e) => handleAgentSearchChange(e.target.value)}
                    onFocus={() => {
                      setAgentSuggestions(agentSearch ? agentsList.filter(a => a.label.toLowerCase().includes(agentSearch.toLowerCase())) : agentsList);
                      setShowAgentDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowAgentDropdown(false), 250)}
                    onKeyDown={handleAgentKeyDown}
                    placeholder="Search Agent..."
                    className="h-10 text-sm rounded-lg relative z-10 bg-transparent border-gray-200"
                  />
                  {showAgentDropdown && agentSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      {agentSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.value}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, agent: suggestion.value }));
                            setAgentSearch(suggestion.label);
                            setShowAgentDropdown(false);
                            setAgentHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === agentHighlightIndex
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'hover:bg-gray-50 text-gray-800'
                            }`}
                        >
                          <span className="font-bold">{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1 relative">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Booking / Inward</Label>
                <div className="relative">
                  {bookingInwardSearch && bookingInwardSuggestions.length > 0 && bookingInwardSuggestions[0].label.toLowerCase().startsWith(bookingInwardSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{bookingInwardSuggestions[0].label.slice(0, bookingInwardSearch.length)}</span>
                      <span>{bookingInwardSuggestions[0].label.slice(bookingInwardSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    name="bookingInward"
                    value={bookingInwardSearch}
                    onChange={(e) => handleBookingInwardSearchChange(e.target.value)}
                    onFocus={() => {
                      setBookingInwardSuggestions(bookingInwardSearch ? BOOKING_INWARD_OPTIONS.filter(o => o.label.toLowerCase().includes(bookingInwardSearch.toLowerCase())) : BOOKING_INWARD_OPTIONS);
                      setShowBookingInwardDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowBookingInwardDropdown(false), 250)}
                    onKeyDown={handleBookingInwardKeyDown}
                    placeholder="Search Option..."
                    className="h-10 text-sm rounded-lg relative z-10 bg-transparent border-gray-200"
                  />
                  {showBookingInwardDropdown && bookingInwardSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      {bookingInwardSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.value}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, bookingInward: suggestion.value }));
                            setBookingInwardSearch(suggestion.label);
                            setShowBookingInwardDropdown(false);
                            setBookingInwardHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === bookingInwardHighlightIndex
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'hover:bg-gray-50 text-gray-800'
                            }`}
                        >
                          <span className="font-bold">{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Commi. (N / W)</Label>
                <Input name="commiBasis" value={formData.commiBasis} onChange={handleChange} placeholder="e.g. N" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Commi. Amount</Label>
                <Input name="commiAmount" value={formData.commiAmount} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">D.C. (N / W / P)</Label>
                <Input name="dcBasis" value={formData.dcBasis} onChange={handleChange} placeholder="e.g. W" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">D.C. Amount</Label>
                <Input name="dcAmount" value={formData.dcAmount} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">L.C. (N / W / P)</Label>
                <Input name="lcBasis" value={formData.lcBasis} onChange={handleChange} placeholder="e.g. P" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">L.C. Amount</Label>
                <Input name="lcAmount" value={formData.lcAmount} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Brn. Rate. (N / W)</Label>
                <Input name="brnRateBasis" value={formData.brnRateBasis} onChange={handleChange} placeholder="e.g. N" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Brn. Amount</Label>
                <Input name="brnAmount" value={formData.brnAmount} onChange={handleChange} placeholder="0.00" className="h-10 text-sm rounded-lg border-gray-200" />
              </div>
              <div className="space-y-1 relative">
                <Label className="text-xs font-semibold text-gray-600 uppercase">Direct Data ?</Label>
                <div className="relative">
                  {directDataSearch && directDataSuggestions.length > 0 && directDataSuggestions[0].label.toLowerCase().startsWith(directDataSearch.toLowerCase()) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-gray-400 select-none font-medium z-0 pl-[1px]">
                      <span className="opacity-0">{directDataSuggestions[0].label.slice(0, directDataSearch.length)}</span>
                      <span>{directDataSuggestions[0].label.slice(directDataSearch.length)}</span>
                    </div>
                  )}
                  <Input
                    name="directData"
                    value={directDataSearch}
                    onChange={(e) => handleDirectDataSearchChange(e.target.value)}
                    onFocus={() => {
                      setDirectDataSuggestions(directDataSearch ? DIRECT_DATA_OPTIONS.filter(o => o.label.toLowerCase().includes(directDataSearch.toLowerCase())) : DIRECT_DATA_OPTIONS);
                      setShowDirectDataDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDirectDataDropdown(false), 250)}
                    onKeyDown={handleDirectDataKeyDown}
                    placeholder="Search Option..."
                    className="h-10 text-sm rounded-lg relative z-10 bg-transparent border-gray-200"
                  />
                  {showDirectDataDropdown && directDataSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 w-full bg-white rounded-lg border border-gray-200 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                      {directDataSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.value}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, directData: suggestion.value }));
                            setDirectDataSearch(suggestion.label);
                            setShowDirectDataDropdown(false);
                            setDirectDataHighlightIndex(-1);
                          }}
                          className={`flex flex-col px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${index === directDataHighlightIndex
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'hover:bg-gray-50 text-gray-800'
                            }`}
                        >
                          <span className="font-bold">{suggestion.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
            disabled={isLoading} 
            className="h-10 px-6 rounded-lg bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-bold transition-all shadow-sm"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
