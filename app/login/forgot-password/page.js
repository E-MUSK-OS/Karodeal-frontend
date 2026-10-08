'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/common/Button';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setMessage('A password reset code has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setResetToken(data.resetToken);
      setMessage('Code verified! Please enter your new password.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col justify-center py-12 relative font-sans ">
      <div className="flex flex-col bg-neutral-50 sm:mx-auto sm:w-full sm:max-w-[400px] sm:h-auto sm:min-h-[450px] sm:rounded-2xl sm:shadow-sm sm:border sm:border-neutral-200 p-6 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Button variant="none" size="none"
            onClick={() => step === 2 ? setStep(1) : router.back()}
            className="p-1 -ml-1 text-black hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
          </Button>
        </div>

        <div>
          <h2 className="font-extrabold text-black tracking-tight leading-tight">
            Forgot Password
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            {step === 1 && "Enter your email address and we'll send you a verification code."}
            {step === 2 && "Enter the 4-digit verification code sent to your email."}
            {step === 3 && "Securely set your new password."}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleSendOtp}>

            {error && <div className="text-red-500 text-sm mb-4 font-medium">{error}</div>}
            {message && <div className="text-green-600 text-sm mb-4 font-medium">{message}</div>}

            {/* Floating Label Input - Email */}
            <div className="relative mb-6">
              <input
                type="email"
                id="email"
                name="email"
                className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label
                htmlFor="email"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-[&:-webkit-autofill]:top-2 peer-[&:-webkit-autofill]:-translate-y-4 peer-[&:-webkit-autofill]:scale-75 ${email ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
              >
                Email address
              </label>
            </div>

            <div className="mt-auto">
              <Button variant="none" size="none"
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              <p className="text-sm text-center text-neutral-500 mt-4">
                Remembered your password? <Link href="/login" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">Login</Link>
              </p>
            </div>
          </form>
        ) : step === 2 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerifyOtp}>

            {error && <div className="text-red-500 text-sm mb-4 font-medium">{error}</div>}
            {message && <div className="text-green-600 text-sm mb-4 font-medium">{message}</div>}

            {/* OTP Input */}
            <div className="relative mb-6">
              <input
                type="text"
                id="otp"
                className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                placeholder=" "
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <label
                htmlFor="otp"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 ${otp ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
              >
                Verification Code
              </label>
            </div>

            <div className="mt-auto">
              <Button variant="none" size="none"
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          </form>
        ) : (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleResetPassword}>

            {error && <div className="text-red-500 text-sm mb-4 font-medium">{error}</div>}
            {message && <div className="text-green-600 text-sm mb-4 font-medium">{message}</div>}

            {/* New Password Input */}
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer pr-12"
                placeholder=" "
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <label
                htmlFor="newPassword"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 ${newPassword ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
              >
                New Password
              </label>
              <Button variant="none" size="none"
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>

            <div className="mt-auto">
              <Button variant="none" size="none"
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-neutral-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-lg disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
