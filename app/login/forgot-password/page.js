'use client';
import { useState, useRef, useEffect } from 'react';
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

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
        handleAppError(data.error || 'Failed to send OTP', {
          context: 'Forgot Password / Send OTP',
          title: 'Reset Code Error',
          fallback: 'Unable to send verification code. Please check your email address.'
        });
        return;
      }

      showSuccessToast('Reset code sent to your email.');
      setOtpValues(['', '', '', '', '', '']);
      setOtp('');
      setResendTimer(30);
      setStep(2);
    } catch (err) {
      handleAppError(err, {
        context: 'Forgot Password / Send OTP',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again.'
      });
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
        handleAppError(data.error || 'Invalid verification code', {
          context: 'Forgot Password / Verify OTP',
          title: 'Verification Error',
          fallback: 'Invalid or expired OTP code. Please try again.'
        });
        return;
      }

      setResetToken(data.resetToken);
      showSuccessToast('Code verified successfully.');
      setStep(3);
    } catch (err) {
      handleAppError(err, {
        context: 'Forgot Password / Verify OTP',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        handleAppError(data.error || 'Failed to resend code', {
          context: 'Forgot Password / Resend OTP',
          title: 'Resend Failed',
          fallback: 'Unable to resend verification code. Please try again.'
        });
        return;
      }

      setOtpValues(['', '', '', '', '', '']);
      setOtp('');
      otpRefs.current[0]?.focus();
      setResendTimer(30);
      showSuccessToast('A new 6-digit verification code has been sent to your email.');
    } catch (err) {
      handleAppError(err, {
        context: 'Forgot Password / Resend OTP',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again.'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      showErrorToast('New password must be at least 8 characters long.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showErrorToast('Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).');
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
        handleAppError(data.error || 'Failed to reset password', {
          context: 'Forgot Password / Reset Action',
          title: 'Reset Failed',
          fallback: 'Could not reset password. Please try again.'
        });
        return;
      }

      showSuccessToast('Password reset successfully! You can now log in.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      handleAppError(err, {
        context: 'Forgot Password / Reset Action',
        title: 'Connection Error',
        fallback: 'Unable to connect to server. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 relative font-sans">
      <div className="flex flex-col bg-neutral-50 dark:bg-neutral-900 w-full max-w-[420px] rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-5 sm:p-7 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Button variant="none" size="none"
            onClick={() => step === 2 ? setStep(1) : step === 3 ? setStep(2) : router.push('/login')}
            className="p-2 -ml-2 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
          >
            <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
          </Button>
        </div>

        <div>
          <h2 className="font-extrabold text-black dark:text-white tracking-tight leading-tight">
            Forgot Password
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {step === 1 && "Enter your email address and we'll send you a verification code."}
            {step === 2 && "Enter the 6-digit verification code sent to your email."}
            {step === 3 && "Securely set your new password."}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleSendOtp}>

            {/* Floating Label Input - Email */}
            <div className="relative mb-6">
              <input
                type="email"
                id="email"
                name="email"
                className="block px-4 pb-3.5 pt-4 w-full text-black dark:text-white bg-transparent rounded-lg border-2 border-neutral-300 dark:border-neutral-700 appearance-none focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white peer [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black] dark:[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#171717_inset] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label
                htmlFor="email"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 dark:bg-neutral-900 px-1.5 left-3 peer-focus:text-black dark:peer-focus:text-white peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-[&:-webkit-autofill]:top-2 peer-[&:-webkit-autofill]:-translate-y-4 peer-[&:-webkit-autofill]:scale-75 ${email ? 'top-2 -translate-y-4 scale-75 text-black dark:text-white' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500 dark:text-neutral-400'}`}
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
              <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-4">
                Remembered your password? <Link href="/login" className="text-sm lg:text-[15px] xl:text-base text-black dark:text-white font-medium hover:underline">Login</Link>
              </p>
            </div>
          </form>
        ) : step === 2 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerifyOtp}>

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 text-center">Enter 6-digit OTP</label>
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
                    className="w-full aspect-[4/5] sm:h-13 text-center text-lg sm:text-xl font-bold text-black dark:text-white bg-white dark:bg-neutral-800 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all p-0 flex items-center justify-center select-all"
                    required={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Resend OTP Section */}
            <div className="text-center mt-2 mb-6">
              {resendTimer > 0 ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Didn&apos;t receive the code? Resend in{' '}
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">{resendTimer}s</span>
                </p>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-black dark:text-white font-bold hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {isResending ? 'Sending new code...' : 'Resend Code'}
                  </button>
                </p>
              )}
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

            {/* New Password Input */}
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="block px-4 pb-3.5 pt-4 w-full text-black dark:text-white bg-transparent rounded-lg border-2 border-neutral-300 dark:border-neutral-700 appearance-none focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white peer pr-12 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black] dark:[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#171717_inset] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                placeholder=" "
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <label
                htmlFor="newPassword"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 dark:bg-neutral-900 px-1.5 left-3 peer-focus:text-black dark:peer-focus:text-white peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 ${newPassword ? 'top-2 -translate-y-4 scale-75 text-black dark:text-white' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500 dark:text-neutral-400'}`}
              >
                New Password
              </label>
              <Button variant="none" size="none"
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white"
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
