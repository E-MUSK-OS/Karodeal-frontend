'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle2, Eye, EyeOff, LogIn, User } from 'lucide-react';
import Button from '@/components/common/Button';

export default function ChangePassword() {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const uStr = localStorage.getItem('user');
      setUser(uStr ? JSON.parse(uStr) : null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccessMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-6 md:p-8">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <div className="mb-6">
        <h5 className="font-bold text-neutral-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-neutral-700" />
          Change Password
        </h5>
        <p className="text-sm text-neutral-500 mt-1">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>

      {!user ? (
        <div className="text-center py-10 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <div className="w-14 h-14 bg-white border border-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <User className="w-7 h-7 text-neutral-400" />
          </div>
          <h5 className="font-bold text-neutral-900 mb-1">Please log in to change password</h5>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-5">
            You must be logged in to update your security credentials.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors">
              <LogIn className="w-4 h-4" />
              <span>Login to Account</span>
            </Link>
          </div>
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

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
        <div>
          <label htmlFor="currentPassword" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
              required
            />
            <Button variant="none" size="none"
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
              required
            />
            <Button variant="none" size="none"
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-neutral-900"
              required
            />
            <Button variant="none" size="none"
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="none" size="none"
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
