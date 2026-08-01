'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Please enter Email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Please enter Password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Login successful!');
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Column: Branding / Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-brand-bg">
        {/* Premium Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-[#0f4c3a] z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-white/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-[#00ffaa]/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <span className="font-extrabold text-3xl tracking-tight text-white drop-shadow-sm">
            Trust <span className="text-white/70">Logistic</span>
          </span>
        </div>

        <div className="relative z-10 mt-auto mb-20 max-w-xl">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white mb-6 backdrop-blur-md">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            System Operational
          </div>
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 drop-shadow-md">
            Streamline your<br/>transport operations.
          </h2>
          <p className="text-xl text-white/80 leading-relaxed font-medium">
            The all-in-one multi-tenant SaaS platform built specifically for modern logistics and transport businesses in India.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-white/50">
          &copy; {new Date().getFullYear()} Trust Logistic. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-[#0f4c3a] rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              Trust <span className="text-brand-primary">Logistic</span>
            </span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Welcome back</h1>
            <p className="text-gray-500 font-medium text-sm">Please enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-bold">Email Address</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Please enter your email" 
                  className={`bg-gray-50/50 border-gray-200 h-14 rounded-xl pl-4 pr-4 text-base focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary focus:bg-white transition-all shadow-sm ${errors.email ? 'border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500 bg-red-50/30' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700 text-sm font-bold">Password</Label>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  className={`bg-gray-50/50 border-gray-200 h-14 rounded-xl pl-4 pr-12 text-base focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary focus:bg-white transition-all shadow-sm ${errors.password ? 'border-red-500 focus-visible:ring-red-500/30 focus-visible:border-red-500 bg-red-50/30' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-xl text-base font-bold border-none bg-gradient-to-r from-brand-primary to-[#0f4c3a] hover:from-brand-primary hover:to-brand-primary text-white shadow-lg shadow-brand-primary/25 transition-all mt-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : 'Sign In to Workspace'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
