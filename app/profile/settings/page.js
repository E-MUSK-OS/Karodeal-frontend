'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Save, LogOut, ArrowLeft, Trash2, LogIn } from 'lucide-react';
import Button from '@/components/common/Button';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';

export default function ProfileSettingsPage() {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [name, setName] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.name || '';
    } catch {
      return '';
    }
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.email || '';
    } catch {
      return '';
    }
  });
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.mobile || u?.phone || '';
    } catch {
      return '';
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user?.token) return;

    const fetchLatestProfile = async (token, cachedUser) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const freshUser = { ...cachedUser, ...data.user };
          setUser(freshUser);
          setName(freshUser.name || '');
          setEmail(freshUser.email || '');
          setMobile(freshUser.mobile || freshUser.phone || '');
          localStorage.setItem('user', JSON.stringify(freshUser));
        } else if (res.status === 401 || res.status === 404) {
          localStorage.removeItem('user');
          setUser(null);
          setName('');
          setEmail('');
          setMobile('');
          window.dispatchEvent(new Event('auth-change'));
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile data", err);
      }
    };

    fetchLatestProfile(user.token, user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        handleAppError(data.error || 'Failed to update profile', {
          context: 'Profile Settings Update',
          title: 'Update Failed',
          fallback: 'Failed to save settings. Please try again.'
        });
        return;
      }

      // Merge returned user data into local storage
      const updatedUser = {
        ...user,
        ...data.user
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Also sync if it's stored in adminUser
      const adminStr = localStorage.getItem('adminUser');
      if (adminStr) {
        const adminUser = JSON.parse(adminStr);
        if (adminUser.email === updatedUser.email) {
          localStorage.setItem('adminUser', JSON.stringify({ ...adminUser, ...updatedUser }));
        }
      }

      window.dispatchEvent(new Event('auth-change'));
      showSuccessToast('Account details updated successfully!');
    } catch (err) {
      handleAppError(err, {
        context: 'Profile Settings Update',
        title: 'Update Failed',
        fallback: 'Failed to save settings. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setName('');
    setEmail('');
    setMobile('');
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-200">
      {/* Mobile Back Button */}
      <div className="md:hidden mb-4">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
      </div>

      <div className="mb-6">
        <h5 className="font-bold text-neutral-900 flex items-center gap-2">
          <User className="w-5 h-5 text-neutral-700" />
          Account Settings
        </h5>
        <p className="text-sm text-neutral-500 mt-1">
          {user ? 'Update your personal details and contact information.' : 'Please log in to view and manage your account details.'}
        </p>
      </div>

      {!user ? (
        <div className="text-center py-10 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <div className="w-14 h-14 bg-white border border-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <User className="w-7 h-7 text-neutral-400" />
          </div>
          <h5 className="font-bold text-neutral-900 mb-1">You are currently logged out</h5>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-5">
            Log in to access your personal details, cashback earnings, and wallet withdrawal options.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors">
              <LogIn className="w-4 h-4" />
              <span>Login to Account</span>
            </Link>
            <Link href="/signup" className="px-6 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-black font-medium text-sm rounded-xl transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-3 pl-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
                required
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label htmlFor="emailAddress" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="emailAddress"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 pl-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
                required
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="phoneNumber" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <input
                id="phoneNumber"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 pl-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
              />
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="none" size="none"
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button variant="none" size="none"
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-3 text-red-600 hover:bg-red-50 font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100"
              >
                <LogOut className="w-4 h-4" />
                Logout Account
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}


