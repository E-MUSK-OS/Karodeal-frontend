'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/common/Button';
import { useGoogleLogin } from '@react-oauth/google';
import { handleAppError, showSuccessToast } from '@/lib/errorHandler';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requireGoogleOtp, setRequireGoogleOtp] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyName, setVerifyName] = useState('');
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
    setInputCode(newOtp.join(''));

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
    setInputCode(newOtp.join(''));

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
        setInputCode(newOtp.join(''));
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

  const showError = (msg, context = 'Signup') => {
    const userMsg = handleAppError(msg, {
      context,
      title: 'Sign Up',
      fallback: 'An error occurred during registration. Please try again.'
    });
    setError(userMsg);
    setTimeout(() => {
      setError((prev) => (prev === userMsg ? '' : prev));
    }, 4000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Password validation: at least 1 uppercase, 1 lowercase, 1 number, 1 special character, min 8 chars
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      showError('Password must be at least 8 characters long and contain a capital letter, small letter, number, and special character.');
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Failed to send OTP');
        return;
      }

      setStep(2);
      setError('');
    } catch (err) {
      showError('Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: tokenResponse.access_token, isSignup: true }),
        });

        const data = await res.json();

        if (!res.ok) {
          showError(data.error || 'Google login failed');
          return;
        }

        if (data.requireOtp) {
          setVerifyEmail(data.email);
          setVerifyName(data.name);
          setRequireGoogleOtp(true);
          return;
        }

        localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        window.dispatchEvent(new Event('auth-change'));

        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        router.push(returnUrl || '/');
      } catch (err) {
        showError('Failed to connect to backend server');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => showError('Google signup failed')
  });

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = (inputCode || otpValues.join('')).trim();
    if (finalOtp.length < 6) {
      showError('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, otp: finalOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Failed to sign up');
        return;
      }

      // Save token and user data for session
      localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
      window.dispatchEvent(new Event('auth-change'));
      showSuccessToast('Account created successfully! Welcome to KaroDeal.');

      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      router.push(returnUrl || '/');
    } catch (err) {
      showError('Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyGoogleOtp = async (e) => {
    e.preventDefault();
    const finalOtp = (inputCode || otpValues.join('')).trim();
    if (finalOtp.length < 6) {
      showError('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://karodeal-backend.vercel.app/api'}/auth/verify-google-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail.trim().toLowerCase(), otp: finalOtp, name: verifyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || 'Invalid OTP');
        return;
      }

      localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
      window.dispatchEvent(new Event('auth-change'));

      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      router.push(returnUrl || '/');
    } catch (err) {
      showError('Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  if (requireGoogleOtp) {
    return (
      <div className="bg-white min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 relative font-sans">
        <div className="flex flex-col bg-neutral-50 w-full max-w-[420px] rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-7 relative">
          <div className="flex items-center mb-6">
            <Button variant="none" size="none" onClick={() => { setRequireGoogleOtp(false); setInputCode(''); setOtpValues(['','','','','','']); }} className="p-1 -ml-1 text-black hover:bg-neutral-100 rounded-full transition-colors">
              <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
            </Button>
          </div>
          <div>
            <h2 className="font-extrabold text-black tracking-tight leading-tight">Verify Google Account</h2>
            <p className="mt-1.5 text-sm text-neutral-500">We sent a 6-digit OTP to {verifyEmail}</p>
          </div>
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerifyGoogleOtp}>
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
                Verify OTP
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 relative font-sans">

      <div className="flex flex-col bg-neutral-50 w-full max-w-[420px] rounded-2xl shadow-sm border border-neutral-200 p-5 sm:p-7 relative">

        {/* Header Section */}
        <div className="flex items-center mb-6">
          <Button variant="none" size="none"
            onClick={() => {
              if (step === 2) {
                setStep(1);
                setInputCode('');
                setOtpValues(['','','','','','']);
                setError('');
              } else {
                router.push('/');
              }
            }}
            className="p-2 -ml-2 text-black hover:bg-neutral-100 active:bg-neutral-200 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
          >
            <ArrowLeft strokeWidth={2.5} className="w-5 h-5" />
          </Button>
        </div>

        <div>
          <h2 className="font-extrabold text-black tracking-tight leading-tight">
            {step === 1 ? 'Sign up' : 'Verify Email'}
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            {step === 1 ? 'Create an account to get started.' : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleSignup}>

            {/* Floating Label Input - Name */}
            <div className="relative mb-6">
              <input
                type="text"
                id="name"
                name="name"
                className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label
                htmlFor="name"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-[&:-webkit-autofill]:top-2 peer-[&:-webkit-autofill]:-translate-y-4 peer-[&:-webkit-autofill]:scale-75 ${name ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
              >
                Full Name
              </label>
            </div>

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

            {/* Floating Label Input - Password */}
            <div className="relative mb-8">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="block px-4 pb-3.5 pt-4 w-full  text-black bg-transparent rounded-lg border-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer pr-12 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_#fafafa_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label
                htmlFor="password"
                className={`absolute text-[15px] duration-300 transform z-10 origin-[0] bg-neutral-50 px-1.5 left-3 peer-focus:text-black peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-[&:-webkit-autofill]:top-2 peer-[&:-webkit-autofill]:-translate-y-4 peer-[&:-webkit-autofill]:scale-75 ${password ? 'top-2 -translate-y-4 scale-75 text-black' : 'top-1/2 -translate-y-1/2 scale-100 text-neutral-500'}`}
              >
                Password
              </label>
              <Button variant="none" size="none"
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex-1"></div>

            <div className="mb-6 flex justify-center w-full">
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={() => loginWithGoogle()}
                icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 shrink-0" />}
                className="gap-3"
              >
                Sign up with Google
              </Button>
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-neutral-300"></div>
              <span className="flex-shrink-0 mx-4 text-neutral-400 text-sm">Or sign up with email</span>
              <div className="flex-grow border-t border-neutral-300"></div>
            </div>

            {/* Terms and Bottom Button */}
            <div className="mt-auto">
              <p className="text-[13px] text-neutral-500 mb-5 leading-relaxed">
                By continuing, you agree to Karodeal&apos;s <Link href="/terms" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">terms & conditions</Link> and <Link href="/privacy-policy" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">privacy policy</Link>
              </p>

              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                type="submit"
              >
                Create Account
              </Button>
              <p className="text-sm text-center text-neutral-500 mt-4">
                Already have an account? <Link href="/login" className="text-sm lg:text-[15px] xl:text-base text-black font-medium hover:underline">Login</Link>
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-8 flex flex-col flex-1" onSubmit={handleVerify}>

            {/* OTP Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Enter 6-digit OTP</label>
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

            <div className="flex-1"></div>

            <div className="mt-auto">
              <Button
                variant="primary"
                size="md"
                fullWidth
                isLoading={isLoading}
                type="submit"
              >
                Verify & Register
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
