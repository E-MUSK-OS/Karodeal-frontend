'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Save, CheckCircle2, LogOut, ArrowLeft, Trash2 } from 'lucide-react';
import Button from '@/components/common/Button';

export default function ProfileSettingsPage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
        }
      } catch (err) {
        console.error("Failed to fetch fresh profile data", err);
      }
    };

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      setName(parsedUser.name || '');
      setEmail(parsedUser.email || '');
      setMobile(parsedUser.mobile || parsedUser.phone || '');

      // Fetch latest from DB to keep UI in sync
      fetchLatestProfile(parsedUser.token, parsedUser);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
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
        throw new Error(data.error || 'Failed to update profile');
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
      setSuccessMessage('Account details updated successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };



  if (!user) return null;

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
        <h5 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <User className="w-5 h-5 text-neutral-700" />
          Account Settings
        </h5>
        <p className="text-sm text-neutral-500 mt-1">
          Update your personal details and contact information.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {errorMessage}
        </div>
      )}

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
    </div>
  );
}


