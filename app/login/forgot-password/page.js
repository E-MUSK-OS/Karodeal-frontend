'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/common/Button';
import { handleAppError, showSuccessToast, showErrorToast } from '@/lib/errorHandler';

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

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const fillOtpFromText = (rawText, startIndex = 0) => {
    const digits = (rawText || '').replace(/\D/g, '').slice(0, 6);
    if (!digits) return false;

    const newOtp = [...otpValues];
    const start = digits.length >= 6 ? 0 : startIndex;
    for (let i = 0; i < digits.length && (start + i) < 6; i++) {
      newOtp[start + i] = digits[i];
    }
    setOtpValues(newOtp);
    setOtp(newOtp.join(''));

    const nextFocus = Math.min(start + digits.length, 5);
    otpRefs.current[nextFocus]?.focus();
    return true;
  };

  const handleOtpChange = (index, value) => {
    const digitsOnly = value.replace(/\D/g, '');

    // Handle mobile paste or keyboard autocomplete providing multiple digits
    if (digitsOnly.length > 1) {
      fillOtpFromText(digitsOnly, index);
      return;
    }

    const char = digitsOnly.slice(-1) || '';
    const newOtp = [...otpValues];
    newOtp[index] = char;
    setOtpValues(newOtp);
    setOtp(newOtp.join(''));

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        setOtp(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e, index = 0) => {
    e.preventDefault();
    const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
    fillOtpFromText(pastedText, index);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setMessage('A password reset code has been sent to your email.');
      showSuccessToast('Reset code sent to your email.');
      setOtpValues(['', '', '', '', '', '']);
      setOtp('');
      setStep(2);
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: 'Forgot Password / Send OTP',
        title: 'Reset Code Error',
        fallback: 'Unable to send verification code. Please check your email address.'
      });
      setError(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const finalOtp = (otp || otpValues.join('')).trim();
    if (finalOtp.length < 6) {
      showErrorToast('Please enter all 6 digits of the OTP');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp: finalOtp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setResetToken(data.resetToken);
      setMessage('Code verified! Please enter your new password.');
      showSuccessToast('Code verified successfully.');
      setStep(3);
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: 'Forgot Password / Verify OTP',
        title: 'Verification Error',
        fallback: 'Invalid or expired OTP code. Please try again.'
      });
      setError(userMsg);
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
      showSuccessToast('Password reset successfully! You can now log in.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const userMsg = handleAppError(err, {
        context: 'Forgot Password / Reset Action',
        title: 'Reset Failed',
        fallback: 'Could not reset password. Please try again.'
      });
      setError(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 relative font-sans">
      <div className="flex flex-col bg-neutral-50 w-full max-w-[420px] rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-7 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Button variant="none" size="none"
            onClick={() => step === 2 ? setStep(1) : router.push('/login')}
            className="p-2 -ml-2 text-black hover:bg-neutral-100 active:bg-neutral-200 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
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
            {step === 2 && "Enter the 6-digit verification code sent to your email."}
            {step === 3 && "Securely set your new password."}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleSendOtp}>

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
              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                type="submit"
              >
                Send Verification Code
              </Button>
              <p className="text-sm text-center text-neutral-500 mt-4">
                Remembered your password? <Link href="/login" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">Login</Link>
              </p>
            </div>
          </form>
        ) : step === 2 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerifyOtp}>

            {message && <div className="text-green-600 text-sm mb-4 font-medium">{message}</div>}

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-digit OTP</label>
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 w-full" onPaste={(e) => handleOtpPaste(e, 0)}>
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={(e) => handleOtpPaste(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-full aspect-[4/5] sm:h-13 text-center text-lg sm:text-xl font-bold text-black bg-white rounded-xl border-2 border-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all p-0 flex items-center justify-center select-all"
                    required={index === 0}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                type="submit"
              >
                Verify Code
              </Button>
            </div>
          </form>
        ) : (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleResetPassword}>

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
              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                type="submit"
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
