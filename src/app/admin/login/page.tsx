'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam === 'deactivated_user') {
      signOut({ redirect: false });
      toast.error('Your account has been deactivated. Please contact support.');
      router.replace('/admin/login');
    } else if (errorParam === 'deactivated_company') {
      signOut({ redirect: false });
      toast.error('Your company account has been deactivated. Please contact support.');
      router.replace('/admin/login');
    } else if (errorParam === 'system_error') {
      signOut({ redirect: false });
      toast.error('System validation error. Please log in again.');
      router.replace('/admin/login');
    }
  }, [errorParam, router]);

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
        const errorMsg = result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error;
        toast.error(errorMsg);
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
          <Link href="/" className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-3xl inline-flex items-center justify-center shadow-2xl border border-white/20 hover:scale-[1.02] transition-transform">
            <img 
              src="/main_logo.svg" 
              alt="Trust Logistic Logo" 
              className="h-14 w-auto object-contain" 
            />
          </Link>
        </div>

        <div className="relative z-10 mt-auto mb-20 max-w-xl">
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
            <Link href="/" className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl inline-flex items-center justify-center shadow-md border border-gray-100 hover:scale-[1.02] transition-transform">
              <img 
                src="/main_logo.svg" 
                alt="Trust Logistic Logo" 
                className="h-10 w-auto object-contain" 
              />
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left relative">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-brand-primary mb-6 transition-colors lg:absolute lg:-top-16 lg:left-0">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to website
            </Link>
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
                  className={`bg-gray-50/50 border-gray-200 h-14 rounded-xl pl-4 pr-4 text-base focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary focus:bg-white transition-all shadow-sm ${errors.email ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[13px] font-medium flex items-center gap-1 mt-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> 
                  {errors.email}
                </p>
              )}
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
                  className={`bg-gray-50/50 border-gray-200 h-14 rounded-xl pl-4 pr-12 text-base focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary focus:bg-white transition-all shadow-sm ${errors.password ? 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100' : ''}`}
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
              {errors.password && (
                <p className="text-red-500 text-[13px] font-medium flex items-center gap-1 mt-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> 
                  {errors.password}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-full text-base font-bold bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 transition-all hover:-translate-y-0.5 mt-8"
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

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-brand-primary font-bold">Loading portal...</div>}>
      <AdminLogin />
    </Suspense>
  );
}
