'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Button from '@/components/common/Button';
import PageLoader from '@/components/common/PageLoader';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in as admin, redirect to dashboard
    const adminStr = localStorage.getItem('adminUser');
    if (adminStr) {
      router.push('/admin');
      return;
    }

    // Pre-warm backend and Neon database on page load so cold start doesn't cause "Failed to fetch"
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    fetch(`${apiUrl}/health`).catch(() => {});
  }, [router]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api';
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to login');
        }

        if (data.user.role !== 'ADMIN' && data.user.role !== 'SUB_ADMIN') {
          throw new Error('Access Denied: You do not have administrator privileges.');
        }

        const adminUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          token: data.token,
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        window.dispatchEvent(new Event('admin-auth-change'));
        router.push('/admin');
        return;
      } catch (err) {
        // If it's a cold-start network failure ("Failed to fetch") and we have a retry attempt left
        const isNetworkError = err.message?.includes('Failed to fetch') || err.name === 'TypeError';
        if (isNetworkError && attempts < maxAttempts) {
          // Wait 1.5 seconds while server/DB wakes up and retry automatically
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        handleAppError(err, {
          context: 'Admin Login',
          title: 'Sign In Failed',
          fallback: isNetworkError ? 'Server is waking up from sleep mode. Please try clicking Sign In again in a few seconds.' : (err.message || 'Invalid admin email or password.')
        });
        break;
      } finally {
        if (attempts >= maxAttempts) {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/images/logo.png" alt="KaroDeal Admin Logo" className="h-20 lg:h-24 w-auto object-contain mb-4" />
          <h4 className="font-extrabold text-neutral-900 tracking-tight">Admin Portal</h4>
          <p className="text-sm text-neutral-500 mt-1">Sign in with administrator credentials</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          {/* Admin Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tagdo.com"
                className="w-full px-4 py-3.5 pl-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition-all font-medium"
                required
              />
              <Mail className="w-4.5 h-4.5 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 pl-10 pr-12 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition-all font-medium"
                required
              />
              <Lock className="w-4.5 h-4.5 text-neutral-400 absolute left-3.5 top-3.5" />
              <Button variant="none" size="none"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={!isLoading && <ArrowRight className="w-4 h-4" />}
            className="w-full py-3.5 text-sm rounded-xl normal-case tracking-normal shadow-md mt-4"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  );
}
