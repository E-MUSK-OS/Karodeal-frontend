'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import {
  User, Mail, Phone, Save, CheckCircle2, LogOut, Settings, Wallet,
  IndianRupee, History, Ticket, Search, HelpCircle, Star, ShieldCheck, ArrowLeft, Lock, Trash2, Receipt, LogIn
} from 'lucide-react';

export default function ProfileAccountSettings() {
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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [mobileView, setMobileView] = useState('menu'); // 'menu' or 'settings'
  const router = useRouter();

  useEffect(() => {
    if (!user?.token) {
      router.replace('/login');
      return;
    }

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
    setSuccessMessage('');
    setErrorMessage('');
    setIsSaving(true);

    try {
      // Send update request to backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedUser = {
        ...user,
        name: data.user.name,
        email: data.user.email,
        mobile: data.user.mobile || mobile.trim(),
      };

      // Update current user session
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Update user in users list if present
      const usersStr = localStorage.getItem('users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const userIndex = users.findIndex((u) => u.email === user.email || u.name === user.name);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updatedUser };
          localStorage.setItem('users', JSON.stringify(users));
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
    setUser(null);
    setName('');
    setEmail('');
    setMobile('');
    window.dispatchEvent(new Event('auth-change'));
    router.replace('/login');
  };

  return (
    <>
      {/* MOBILE MEDIA VIEW */}
      <div className="block md:hidden bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {mobileView === 'menu' ? (
          <>
            {/* User Greeting */}
            <div className="p-5 pb-4">
              <div className="text-[13px] text-neutral-500 font-medium">Hello,</div>
              <h2 className="text-[18px] font-bold text-black">
                {user?.name || 'User'}
              </h2>
            </div>

            {/* Account Settings Option Button */}
            <div className="px-5 py-3.5 border-b border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
              <Button variant="none" size="none"
                onClick={() => setMobileView('settings')}
                className="flex items-center gap-3 text-black w-full text-left focus:outline-none"
              >
                <Settings className="w-5 h-5 text-neutral-800" />
                <span className="text-[14px] font-semibold">Account Settings</span>
              </Button>
            </div>

            {/* Change Password Link */}
            <div className="px-5 py-3.5 border-b border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
              <Link href="/profile/change-password" className="flex items-center gap-3 text-black">
                <Lock className="w-5 h-5 text-neutral-800" />
                <span className="text-[14px] font-semibold">Change Password</span>
              </Link>
            </div>

            {/* Cashback & Rewards Section */}
            <div className="px-5 py-4 border-b border-neutral-100">
              <div className="text-[13px] text-neutral-400 font-semibold mb-4">
                Cashback & Rewards
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/profile/earnings" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                  <Wallet className="w-5 h-5 text-neutral-700" />
                  <span className="text-[14px] font-medium">My Earnings</span>
                </Link>
                <Link href="/profile/payments" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                  <IndianRupee className="w-5 h-5 text-neutral-700" />
                  <span className="text-[14px] font-medium">Withdraw</span>
                </Link>
                <Link href="/profile/payments-history" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                  <History className="w-5 h-5 text-neutral-700" />
                  <span className="text-[14px] font-medium">Payments History</span>
                </Link>
                <Link href="/profile/claim-cashback" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                  <Receipt className="w-5 h-5 text-neutral-700" />
                  <span className="text-[14px] font-medium">Claim Cashback</span>
                </Link>
                <Link href="/profile/missing-cashback" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                  <Ticket className="w-5 h-5 text-neutral-700" />
                  <span className="text-[14px] font-medium">Missing Cashback</span>
                </Link>
              </div>
            </div>

            {/* Support & feedback Section */}
            <div className="px-5 py-4 border-b border-neutral-100">
              <div className="text-[13px] text-neutral-400 font-semibold mb-4">
                Support & feedback
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/profile/help" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                  <HelpCircle className="w-5 h-5 text-neutral-700" />
                  <span className="text-[14px] font-medium">Help & Support</span>
                </Link>
                <Link href="/profile/review" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                  <Star className="w-5 h-5 text-neutral-700" />
                  <span className="text-[14px] font-medium">Review Us</span>
                </Link>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="px-5 py-4 border-b border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
              <Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base flex items-center gap-3 text-neutral-800 hover:text-black">
                <ShieldCheck className="w-5 h-5 text-neutral-700" />
                <span className="text-[14px] font-medium">Privacy Policy</span>
              </Link>
            </div>

            {/* Logout / Login Button */}
            <div className="px-5 py-4 bg-white hover:bg-neutral-50 transition-colors">
              {user ? (
                <Button variant="none" size="none" onClick={handleLogout} className="flex items-center gap-3 text-red-600 w-full text-left">
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="text-[14px] font-medium">Logout</span>
                </Button>
              ) : (
                <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors">
                  <LogIn className="w-4 h-4" />
                  <span className="text-[14px] font-medium">Login / Sign up</span>
                </Link>
              )}
            </div>
          </>
        ) : (
          /* MOBILE ACCOUNT SETTINGS FORM VIEW */
          <div className="p-5 sm:p-6">
            <Button variant="none" size="none"
              onClick={() => setMobileView('menu')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Button>

            <div className="mb-6">
              <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                <User className="w-5 h-5 text-neutral-700" />
                Account Settings
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Update your personal details and contact information.
              </p>
            </div>

            {!user ? (
              <div className="text-center py-8 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="w-12 h-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <User className="w-6 h-6 text-neutral-400" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">Please log in</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-5">
                  Log in to edit your name, email, and mobile number.
                </p>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors">
                  <LogIn className="w-4 h-4" />
                  <span>Go to Login</span>
                </Link>
              </div>
            ) : (
              <>
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
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label htmlFor="mobileFullName" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          id="mobileFullName"
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
                      <label htmlFor="mobileEmailAddress" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="mobileEmailAddress"
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

                    <div>
                      <label htmlFor="mobilePhoneNumber" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          id="mobilePhoneNumber"
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="Enter mobile number"
                          maxLength="10"
                          pattern="[0-9]{10}"
                          className="w-full px-4 py-3 pl-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
                        />
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <Button variant="none" size="none"
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>

                    <Button variant="none" size="none"
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-3 text-red-600 hover:bg-red-50 font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout Account
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP MEDIA VIEW (Account Settings Form) */}
      <div className="hidden md:block bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-200">
        <div className="mb-6">
          <h4 className="font-bold text-neutral-900 flex items-center gap-2">
            <User className="w-5 h-5 text-neutral-700" />
            Account Settings
          </h4>
          <p className="text-sm text-neutral-500 mt-1">
            {user ? 'Update your personal details and contact information.' : 'Please log in to view and manage your account details.'}
          </p>
        </div>

        {!user && (
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
        )}

        {user && (
          <>
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
          {/* Personal Information */}
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
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="Enter mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 pl-10 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
                />
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
          </>
        )}
      </div>
    </>
  );
}

