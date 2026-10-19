'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/common/Button';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';

export default function ChangePassword() {
  const router = useRouter();
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

    if (newPassword.length < 8) {
      handleAppError('New password must be at least 8 characters long.', {
        context: 'Change Password Validation',
        title: 'Invalid Password'
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      handleAppError('Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).', {
        context: 'Change Password Validation',
        title: 'Weak Password'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      handleAppError('New password and confirm password do not match.', {
        context: 'Change Password Validation',
        title: 'Password Mismatch'
      });
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
        handleAppError(data.error || 'Failed to update password', {
          context: 'Change Password Action',
          title: 'Update Failed',
          fallback: 'Failed to update password. Please check your current password.'
        });
        return;
      }

      showSuccessToast('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      handleAppError(err, {
        context: 'Change Password Action',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again later.'
      });
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
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isUpdating}
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
